/**
 * Filesystem helpers — safe reads, directory listing, path normalization.
 */

import { readFile, readdir, stat, access, mkdir } from "node:fs/promises";
import { join, resolve, relative, basename, isAbsolute, extname } from "node:path";
import { constants } from "node:fs";

/**
 * Read a file as UTF-8, return null if it doesn't exist or isn't readable.
 */
export async function safeReadFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Read and parse a JSON file, return null if missing or invalid.
 */
export async function safeReadJson<T = Record<string, unknown>>(
  filePath: string,
): Promise<T | null> {
  const content = await safeReadFile(filePath);
  if (!content) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Write a file as UTF-8, ensuring parent directory exists.
 */
export async function safeWriteFile(
  filePath: string,
  content: string,
): Promise<boolean> {
  try {
    const { dirname } = await import("node:path");
    const { writeFile } = await import("node:fs/promises");
    await ensureDir(dirname(filePath));
    await writeFile(filePath, content, "utf-8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Write JSON formatted with indentation, ensuring parent directory exists.
 */
export async function safeWriteJson(
  filePath: string,
  data: unknown,
): Promise<boolean> {
  return await safeWriteFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Check if a path exists.
 */
export async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path is a directory.
 */
export async function isDirectory(p: string): Promise<boolean> {
  try {
    const s = await stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists (recursive mkdir).
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

/**
 * Build a shallow folder structure string (max depth 3) for a project.
 * Used in ProjectProfile.raw.folderStructure.
 */
export async function buildFolderStructure(
  rootPath: string,
  maxDepth = 3,
  currentDepth = 0,
  prefix = "",
): Promise<string> {
  if (currentDepth >= maxDepth) return "";

  const entries = await readdir(rootPath, { withFileTypes: true });

  // Filter out noise
  const SKIP = new Set([
    "node_modules",
    ".git",
    ".next",
    ".nuxt",
    "__pycache__",
    ".swag",
    "swag-output",
    "dist",
    "build",
    ".cache",
    ".turbo",
    "coverage",
    ".venv",
    "venv",
    ".tox",
  ]);

  const filtered = entries
    .filter((e) => !SKIP.has(e.name) && !e.name.startsWith("."))
    .sort((a, b) => {
      // Directories first, then files
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  const lines: string[] = [];
  for (let i = 0; i < filtered.length; i++) {
    const entry = filtered[i];
    const isLast = i === filtered.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const childPrefix = isLast ? "    " : "│   ";

    if (entry.isDirectory()) {
      lines.push(`${prefix}${connector}${entry.name}/`);
      const childPath = join(rootPath, entry.name);
      const childTree = await buildFolderStructure(
        childPath,
        maxDepth,
        currentDepth + 1,
        prefix + childPrefix,
      );
      if (childTree) lines.push(childTree);
    } else {
      lines.push(`${prefix}${connector}${entry.name}`);
    }
  }

  return lines.join("\n");
}

/**
 * Safely resolve a path that might be relative to a base or already absolute.
 */
export function resolvePath(basePath: string, targetPath: string): string {
  if (isAbsolute(targetPath)) return targetPath;
  return join(basePath, targetPath);
}

/**
 * Read image file and convert to data URI with appropriate mime type.
 */
export async function fileToDataUrl(filePath: string): Promise<string | null> {
  try {
    if (!(await pathExists(filePath))) return null;
    const buf = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const mime =
      ext === ".svg"
        ? "image/svg+xml"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export { join, resolve, relative, basename, isAbsolute, extname };
