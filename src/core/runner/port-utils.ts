/**
 * Port and HTTP utilities for dev server lifecycle management.
 */

import { createServer, Socket } from "node:net";
import { logger } from "../../utils/logger.js";

const log = logger.child("runner:port-utils");

/**
 * Check if a TCP port is currently in use on localhost / 127.0.0.1.
 */
export async function isPortInUse(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket();
    socket.setTimeout(400);

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.once("error", () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

/**
 * Find an available TCP port starting from the given port.
 */
export async function findAvailablePort(startPort: number, host = "127.0.0.1"): Promise<number> {
  for (let port = startPort; port < startPort + 100; port++) {
    const inUse = await isPortInUse(port, host);
    if (!inUse) {
      return port;
    }
  }
  throw new Error(`No available ports found in range ${startPort}-${startPort + 100}`);
}

/**
 * Poll an HTTP URL until it responds with a 2xx, 3xx, or 4xx status, or times out.
 */
export async function waitForHttp(
  url: string,
  timeoutMs = 30000,
  intervalMs = 500,
): Promise<boolean> {
  const startTime = Date.now();
  log.debug(`Waiting for HTTP readiness at: ${url} (timeout: ${timeoutMs}ms)`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(id);

      // Any HTTP response (even 404 or 401) indicates the server is listening!
      if (res.status >= 200 && res.status < 500) {
        log.debug(`Server responded at ${url} with status ${res.status}`);
        return true;
      }
    } catch {
      // Server not ready yet; wait and retry
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  log.warn(`Timed out waiting for HTTP readiness at: ${url}`);
  return false;
}
