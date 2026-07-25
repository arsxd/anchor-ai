const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|context)/i,
  /you\s+are\s+now\s+a/i,
  /system\s*:/i,
  /forget\s+(all|everything|your)\s+(instructions|rules|guidelines)/i,
  /override\s+(your|all|the)\s+(instructions|rules|settings)/i,
  /act\s+as\s+(if|though)\s+you/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /new\s+instructions?\s*:/i,
];

/**
 * Sanitizes user input for safe use in LLM prompts.
 * Strips HTML, enforces length limits, and blocks prompt injection attempts.
 */
export function sanitizeForLLM(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== "string") return "";

  let sanitized = input.trim();

  // Strip HTML tags
  sanitized = stripHtml(sanitized);

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, " ");

  // Enforce max length
  sanitized = enforceMaxLength(sanitized, maxLength);

  // Block prompt injection patterns
  sanitized = removeInjectionAttempts(sanitized);

  return sanitized;
}

/**
 * Strips all HTML tags from input string.
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Enforces maximum character length, truncating at word boundary.
 */
export function enforceMaxLength(input: string, maxLength: number): string {
  if (!input || input.length <= maxLength) return input;

  const truncated = input.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > maxLength * 0.8 ? truncated.substring(0, lastSpace) : truncated;
}

/**
 * Detects and neutralizes prompt injection attempts.
 * Returns cleaned input with injection patterns removed.
 */
export function removeInjectionAttempts(input: string): string {
  let cleaned = input;

  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[filtered]");
  }

  return cleaned;
}

/**
 * Checks if input contains potential prompt injection.
 */
export function containsInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}
