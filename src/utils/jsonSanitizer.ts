/**
 * JSON Sanitization Utility
 * Fixes common AI-generated JSON formatting issues
 */

/**
 * Sanitize AI-generated JSON to fix common formatting issues
 * Removes literal newlines and extra whitespace from within string values
 *
 * @param jsonString - The JSON string to sanitize
 * @returns Sanitized JSON string safe for parsing
 */
export function sanitizeJSON(jsonString: string): string {
  try {
    // Replace literal newlines within quoted strings with spaces
    // This regex finds string values and replaces newlines within them
    let sanitized = jsonString.replace(
      /"([^"]*?)"/g,
      (match, content) => {
        // Replace newlines and multiple spaces with single space
        const cleaned = content
          .replace(/\r?\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return `"${cleaned}"`;
      }
    );

    return sanitized;
  } catch (error) {
    console.error('❌ JSON sanitization failed:', error);
    return jsonString; // Return original if sanitization fails
  }
}

/**
 * Safely parse JSON with automatic sanitization fallback
 * Attempts to parse as-is first, then tries sanitization if that fails
 *
 * @param jsonString - The JSON string to parse
 * @param fallbackValue - Optional fallback value if parsing fails entirely
 * @returns Parsed JSON object
 */
export function safeJSONParse<T = any>(jsonString: string, fallbackValue?: T): T {
  try {
    // Try parsing as-is first
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.warn('⚠️ Initial JSON parse failed, attempting sanitization...', parseError);

    try {
      // Try with sanitization
      const sanitized = sanitizeJSON(jsonString);
      return JSON.parse(sanitized);
    } catch (sanitizeError) {
      console.error('❌ JSON parsing failed even after sanitization:', sanitizeError);

      if (fallbackValue !== undefined) {
        return fallbackValue;
      }

      throw sanitizeError;
    }
  }
}
