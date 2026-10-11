/**
 * Platform detection and dependency checking.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { platform as osPlatform } from "node:os";

const execFileAsync = promisify(execFile);

export type Platform = "win32" | "darwin" | "linux";

export function getPlatform(): Platform {
  return osPlatform() as Platform;
}

export interface DependencyCheck {
  name: string;
  available: boolean;
  version?: string;
  installGuide: string;
}

/**
 * Check if a command is available on the system.
 */
async function commandExists(
  command: string,
  versionFlag = "--version",
): Promise<{ available: boolean; version?: string }> {
  try {
    const { stdout, stderr } = await execFileAsync(command, [versionFlag], {
      timeout: 5000,
    });
    const output = (stdout || stderr).trim();
    // Extract version-like string
    const versionMatch = output.match(/(\d+\.\d+[\d.]*)/);
    return {
      available: true,
      version: versionMatch?.[1],
    };
  } catch {
    return { available: false };
  }
}

/**
 * Check all SWAG dependencies and return status + install guidance.
 */
export async function checkDependencies(): Promise<DependencyCheck[]> {
  const platform = getPlatform();

  const ffmpegGuide: Record<Platform, string> = {
    win32: "Install FFmpeg: winget install FFmpeg or download from https://ffmpeg.org",
    darwin: "Install FFmpeg: brew install ffmpeg",
    linux: "Install FFmpeg: sudo apt install ffmpeg (or your distro's equivalent)",
  };

  const checks: Array<{
    name: string;
    command: string;
    flag: string;
    guide: string;
  }> = [
    {
      name: "FFmpeg",
      command: "ffmpeg",
      flag: "-version",
      guide: ffmpegGuide[platform],
    },
    {
      name: "Node.js",
      command: "node",
      flag: "--version",
      guide: "Install Node.js >= 18 from https://nodejs.org",
    },
  ];

  const results: DependencyCheck[] = [];

  for (const check of checks) {
    const result = await commandExists(check.command, check.flag);
    results.push({
      name: check.name,
      available: result.available,
      version: result.version,
      installGuide: check.guide,
    });
  }

  return results;
}
