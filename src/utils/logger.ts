/**
 * Secret-safe logger.
 *
 * All output goes to stderr so it never contaminates MCP stdio transport
 * on stdout. Sensitive patterns are redacted before logging.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Patterns that look like secrets — redacted in all log output
const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/g,        // OpenAI-style keys
  /pk_[a-zA-Z0-9]{20,}/g,        // Stripe-style public keys
  /AKIA[A-Z0-9]{16}/g,           // AWS access keys
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, // JWT tokens
  /ghp_[a-zA-Z0-9]{36}/g,        // GitHub personal access tokens
  /Bearer\s+[a-zA-Z0-9._\-]{20,}/gi, // Bearer tokens
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Emails (optional)
];

function redact(message: string): string {
  let result = message;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]");
  }
  return result;
}

class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(prefix = "swag", level?: LogLevel) {
    this.prefix = prefix;
    this.level =
      level ??
      (process.env.SWAG_LOG_LEVEL as LogLevel | undefined) ??
      "info";
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private format(level: LogLevel, msg: string): string {
    const ts = new Date().toISOString();
    return `[${ts}] [${this.prefix}] ${level.toUpperCase()} ${redact(msg)}`;
  }

  debug(msg: string, ...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      console.error(this.format("debug", msg), ...args);
    }
  }

  info(msg: string, ...args: unknown[]): void {
    if (this.shouldLog("info")) {
      console.error(this.format("info", msg), ...args);
    }
  }

  warn(msg: string, ...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      console.error(this.format("warn", msg), ...args);
    }
  }

  error(msg: string, ...args: unknown[]): void {
    if (this.shouldLog("error")) {
      console.error(this.format("error", msg), ...args);
    }
  }

  child(prefix: string): Logger {
    return new Logger(`${this.prefix}:${prefix}`, this.level);
  }
}

export const logger = new Logger();
export { Logger };
