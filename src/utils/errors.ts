/**
 * SwagError hierarchy — structured errors with codes and actionable messages.
 */

export type SwagErrorCode =
  | "PROJECT_NOT_FOUND"
  | "PROJECT_NOT_WEB"
  | "CONFIG_INVALID"
  | "CONFIG_NOT_FOUND"
  | "ANALYSIS_FAILED"
  | "SERVER_START_FAILED"
  | "BROWSER_LAUNCH_FAILED"
  | "CAPTURE_FAILED"
  | "ASSET_NOT_FOUND"
  | "ASSET_INVALID"
  | "FILE_NOT_FOUND"
  | "RENDER_FAILED"
  | "TTS_FAILED"
  | "THEME_INVALID"
  | "BRAND_INVALID"
  | "VALIDATION_FAILED"
  | "DEPENDENCY_MISSING"
  | "INTERNAL_ERROR";

export class SwagError extends Error {
  public readonly code: SwagErrorCode;
  public readonly suggestion: string;

  constructor(code: SwagErrorCode, message: string, suggestion: string) {
    super(message);
    this.name = "SwagError";
    this.code = code;
    this.suggestion = suggestion;
  }

  /**
   * Format for MCP tool response — the agent sees this and can act on it.
   */
  toToolResponse(): { success: false; error: { code: string; message: string; suggestion: string } } {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        suggestion: this.suggestion,
      },
    };
  }
}

/**
 * Wrap a tool handler so unhandled errors become structured SwagError responses.
 */
export function wrapToolHandler<TArgs, TResult>(
  handler: (args: TArgs) => Promise<TResult>,
): (args: TArgs) => Promise<TResult | ReturnType<SwagError["toToolResponse"]>> {
  return async (args: TArgs) => {
    try {
      return await handler(args);
    } catch (err) {
      if (err instanceof SwagError) {
        return err.toToolResponse();
      }
      const message = err instanceof Error ? err.message : String(err);
      return new SwagError(
        "INTERNAL_ERROR",
        message,
        "This is an unexpected error. Please report it or try again.",
      ).toToolResponse();
    }
  };
}
