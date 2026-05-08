import jwt from "jsonwebtoken";
import { headers, cookies } from "next/headers";

export interface UserTokenPayload extends jwt.JwtPayload {
  role?: string;
  id?: string;
}

/**
 * Verify JWT from Authorization header or cookies
 * @returns {Promise<UserTokenPayload | null>} - Decoded token payload if valid, null otherwise
 */
export const verifyJWT = async (): Promise<UserTokenPayload | null> => {
  try {
    let token: string | undefined | null = null;

    // Check Authorization header first
    const authHeader = (await headers()).get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // If no token in header, check cookies
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("authToken")?.value;
    }

    // If still no token, return null
    if (!token) {
      return null;
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof decoded === "string") {
      return null;
    }
    return decoded as UserTokenPayload; // Return user object with id, name, email, etc.
  } catch (err) {
    // Token is invalid or expired
    return null;
  }
};
