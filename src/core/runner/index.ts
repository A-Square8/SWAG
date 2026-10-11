/**
 * Dev Server Runner — manages dev server lifecycle for web project capture.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { isPortInUse, waitForHttp } from "./port-utils.js";
import { SwagError } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

const log = logger.child("runner");

export interface DevServerOptions {
  /** Root directory of the project */
  projectPath: string;
  /** Dev server start command (e.g. "npm run dev") */
  runCommand: string;
  /** Expected listening port (e.g. 3000) */
  port: number;
  /** Optional ready regex pattern to scan in stdout/stderr */
  readyPattern?: string | RegExp;
  /** Optional override URL (if server is already known to be running) */
  serverUrl?: string;
  /** Readiness timeout in milliseconds (default: 30000ms) */
  timeoutMs?: number;
}

export interface DevServerInstance {
  url: string;
  port: number;
  isManaged: boolean;
  getRecentLogs(): string;
  stop(): Promise<void>;
}

export class DevServerRunner {
  private static activeInstances = new Map<string, DevServerInstance>();

  /**
   * Ensure a dev server is running and accessible at the specified port or URL.
   */
  public static async ensureRunning(
    options: DevServerOptions,
  ): Promise<DevServerInstance> {
    const {
      projectPath,
      runCommand,
      port,
      readyPattern,
      serverUrl,
      timeoutMs = 30000,
    } = options;

    const targetUrl = serverUrl || `http://localhost:${port}`;

    // If an instance is already tracked for this projectPath, return it
    const existing = this.activeInstances.get(projectPath);
    if (existing) {
      log.info(`Reusing existing dev server instance for: ${projectPath}`);
      return existing;
    }

    // 1. Check if a server is ALREADY listening on the target port
    const inUse = await isPortInUse(port);
    if (inUse) {
      log.info(
        `Port ${port} is already in use. Checking HTTP responsiveness at: ${targetUrl}`,
      );
      const isHttpReady = await waitForHttp(targetUrl, 3000, 300);
      if (isHttpReady) {
        log.info(`Detected running server at: ${targetUrl}. Reusing.`);
        const unmanagedInstance: DevServerInstance = {
          url: targetUrl,
          port,
          isManaged: false,
          getRecentLogs: () => "Reused existing running server on port " + port,
          stop: async () => {
            log.info(`Unmanaged server at ${targetUrl} left running.`);
          },
        };
        this.activeInstances.set(projectPath, unmanagedInstance);
        return unmanagedInstance;
      }
    }

    // 2. Spawn dev server
    log.info(`Starting dev server: "${runCommand}" in ${projectPath}`);

    const logLines: string[] = [];
    const maxLogs = 100;

    const appendLog = (chunk: Buffer | string) => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        const trimmed = line.trimEnd();
        if (trimmed) {
          logLines.push(trimmed);
          if (logLines.length > maxLogs) {
            logLines.shift();
          }
        }
      }
    };

    let child: ChildProcess | null = null;

    try {
      child = spawn(runCommand, {
        shell: true,
        cwd: projectPath,
        stdio: ["ignore", "pipe", "pipe"],
        detached: process.platform !== "win32",
        env: {
          ...process.env,
          PORT: String(port),
          BROWSER: "none", // Prevent auto-opening browser window
        },
      });

      child.stdout?.on("data", (data) => {
        appendLog(data);
      });

      child.stderr?.on("data", (data) => {
        appendLog(data);
      });

      let exitError: Error | null = null;
      child.on("error", (err) => {
        exitError = err;
        log.error(`Process error: ${err.message}`);
      });

      child.on("exit", (code, signal) => {
        if (code !== null && code !== 0) {
          exitError = new Error(
            `Dev server process exited with code ${code} (${signal ?? "no signal"})`,
          );
        }
      });

      // 3. Wait for readiness
      const defaultReadyRegex =
        readyPattern instanceof RegExp
          ? readyPattern
          : readyPattern
            ? new RegExp(readyPattern, "i")
            : /(localhost|127\.0\.0\.1|ready in|compiled successfully|Local:)/i;

      const startTime = Date.now();
      let ready = false;

      while (Date.now() - startTime < timeoutMs) {
        if (exitError) {
          break;
        }

        // Check if logs matched pattern
        const recentText = logLines.slice(-10).join("\n");
        if (defaultReadyRegex.test(recentText)) {
          // Verify with quick HTTP ping
          if (await waitForHttp(targetUrl, 2000, 300)) {
            ready = true;
            break;
          }
        }

        // Direct HTTP poll as backup
        if (await isPortInUse(port) && (await waitForHttp(targetUrl, 1000, 200))) {
          ready = true;
          break;
        }

        await new Promise((r) => setTimeout(r, 500));
      }

      if (!ready || exitError) {
        // Kill failed process
        try {
          if (child && child.pid) {
            if (process.platform !== "win32") {
              process.kill(-child.pid, "SIGTERM");
            } else {
              child.kill("SIGTERM");
            }
          }
        } catch {
          // Ignore
        }

        const recent = logLines.slice(-20).join("\n");
        throw new SwagError(
          "SERVER_START_FAILED",
          `Dev server failed to start or did not become responsive within ${timeoutMs / 1000}s at ${targetUrl}.\nRecent output:\n${recent}`,
          "Check the run command and port in your project configuration, or provide the 'serverUrl' hint if running manually.",
        );
      }

      log.info(`Dev server is ready at: ${targetUrl}`);

      const instance: DevServerInstance = {
        url: targetUrl,
        port,
        isManaged: true,
        getRecentLogs: () => logLines.join("\n"),
        stop: async () => {
          log.info(`Stopping managed dev server for: ${projectPath}`);
          DevServerRunner.activeInstances.delete(projectPath);
          if (child && child.pid) {
            try {
              if (process.platform !== "win32") {
                process.kill(-child.pid, "SIGTERM");
                // Allow 1s for graceful exit, then force kill
                setTimeout(() => {
                  try {
                    process.kill(-child!.pid!, "SIGKILL");
                  } catch {
                    // Already dead
                  }
                }, 1000);
              } else {
                child.kill("SIGTERM");
              }
            } catch {
              // Ignore
            }
          }
        },
      };

      this.activeInstances.set(projectPath, instance);
      return instance;
    } catch (err) {
      if (err instanceof SwagError) {
        throw err;
      }
      throw new SwagError(
        "SERVER_START_FAILED",
        `Could not spawn dev server: ${err instanceof Error ? err.message : String(err)}`,
        "Check that dependencies are installed and the run command is executable.",
      );
    }
  }

  /**
   * Stop an active server instance if tracked.
   */
  public static async stopServer(projectPath: string): Promise<void> {
    const instance = this.activeInstances.get(projectPath);
    if (instance) {
      await instance.stop();
    }
  }

  /**
   * Stop all active servers (e.g. on shutdown).
   */
  public static async stopAll(): Promise<void> {
    for (const [projectPath, instance] of this.activeInstances.entries()) {
      try {
        await instance.stop();
      } catch (err) {
        log.warn(`Error stopping server for ${projectPath}: ${err}`);
      }
    }
    this.activeInstances.clear();
  }
}
