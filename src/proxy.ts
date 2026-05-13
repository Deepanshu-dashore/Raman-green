import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy to handle authentication and token forwarding.
 * This proxy:
 * 1. Protects /admin routes (except login).
 * 2. Proxies the 'token' cookie to the 'Authorization' header for API routes.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("token")?.value;

    // 1. Route Protection for Admin Panel
    if (pathname.startsWith("/admin")) {
        // Allow access to the login page without a token
        if (pathname === "/admin/login") {
            // If already logged in, redirect to admin dashboard
            if (token) {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            return NextResponse.next();
        }

        // If no token is present, redirect to the login page
        if (!token) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    // 2. Token Proxying for API Routes
    // This allows API handlers to find the token in the Authorization header
    // even though the frontend doesn't store it manually.
    if (pathname.startsWith("/api") && token) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("Authorization", `Bearer ${token}`);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

// Specify the paths that this middleware should run on
export const config = {
    matcher: [
        "/admin/:path*",
        "/api/:path*",
    ],
};
