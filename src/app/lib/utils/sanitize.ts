/**
 * Recursively sanitizes input objects to prevent NoSQL query operator injection.
 * Strips any keys starting with "$" (e.g. $gt, $ne, $where).
 */
export function sanitizeNoSql(input: any): any {
  if (Array.isArray(input)) {
    return input.map(sanitizeNoSql);
  }
  if (input !== null && typeof input === 'object') {
    const sanitized: any = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        if (key.startsWith('$')) {
          continue; // Skip keys starting with $
        }
        sanitized[key] = sanitizeNoSql(input[key]);
      }
    }
    return sanitized;
  }
  return input;
}

/**
 * Validates an email address using standard regex.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates an Indian phone number (10 digits, optional country code +91).
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // Matches 10-digit numbers, or 10-digits with +91 or 91 prefix
  const phoneRegex = /^(?:\+?91|0)?[6-9]\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validates password strength (minimum 6 characters).
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}
