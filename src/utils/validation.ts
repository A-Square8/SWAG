/**
 * Validation helpers — turn Zod errors into agent-friendly messages.
 */

import { ZodError, ZodSchema, z } from "zod";

/**
 * Validate data against a Zod schema and return a structured result.
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: formatZodErrors(result.error),
  };
}

/**
 * Format Zod errors into human-readable strings.
 */
export function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  });
}

/**
 * Convert a Zod schema to a JSON Schema (basic conversion for MCP tool definitions).
 * This produces a simplified schema suitable for the agent to understand
 * what structure to fill.
 */
export function zodToJsonSchema(schema: ZodSchema): Record<string, unknown> {
  // Use zod's built-in describe + a simple recursive converter
  return convertZodType(schema);
}

function convertZodType(schema: ZodSchema): Record<string, unknown> {
  const def = (schema as any)._def as any;

  if (!def) return { type: "unknown" };

  const typeName = def.typeName as string;

  switch (typeName) {
    case "ZodString":
      return { type: "string" };
    case "ZodNumber":
      return { type: "number" };
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodArray":
      return {
        type: "array",
        items: convertZodType(def.type),
      };
    case "ZodObject": {
      const shape = def.shape();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = convertZodType(value as ZodSchema);
        const valueDef = (value as any)._def;
        if (valueDef.typeName !== "ZodOptional" && valueDef.typeName !== "ZodDefault") {
          required.push(key);
        }
      }
      return {
        type: "object",
        properties,
        ...(required.length > 0 ? { required } : {}),
      };
    }
    case "ZodEnum":
      return { type: "string", enum: def.values };
    case "ZodOptional":
      return convertZodType(def.innerType);
    case "ZodDefault":
      return { ...convertZodType(def.innerType), default: def.defaultValue() };
    case "ZodNullable":
      return { ...convertZodType(def.innerType), nullable: true };
    case "ZodUnion":
      return {
        oneOf: (def.options as ZodSchema[]).map(convertZodType),
      };
    case "ZodRecord":
      return {
        type: "object",
        additionalProperties: convertZodType(def.valueType),
      };
    default:
      return { type: "unknown" };
  }
}
