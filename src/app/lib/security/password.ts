import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password using bcrypt
 * @param {string} password - The plaintext password to hash
 * @returns {Promise<string>} - The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error: any) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Compare a plaintext password with a hashed password
 * @param {string} password - The plaintext password to verify
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error: any) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
}
