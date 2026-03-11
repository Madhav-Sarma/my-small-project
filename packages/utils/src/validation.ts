export function validateJsonSchema(data: unknown, schema: Record<string, unknown>): { valid: boolean; errors: string[] } {
  // Lightweight JSON schema validation stub — integrate ajv for production
  if (typeof data !== "object" || data === null) {
    return { valid: false, errors: ["Input must be an object"] };
  }
  return { valid: true, errors: [] };
}
