import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	const token = req.cookies.get("jwt")?.value;

	if (!token) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	try {
		// Forward the request to /api/auth/me for verification
		const response = await fetch(new URL("/api/auth/me", req.url), {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`, // Send token in Authorization header if needed
			},
		});

		// If the response is successful, proceed
		if (response.ok) {
			const data = await response.json();
			if (data.isAuthenticated) {
				return NextResponse.next();
			} else {
				return NextResponse.redirect(new URL("/login", req.url));
			}
		} else {
			return NextResponse.redirect(new URL("/login", req.url));
		}
	} catch (error) {
		// Handle any fetch or verification error
		return NextResponse.redirect(new URL("/login", req.url));
	}
}

export const config = {
	matcher: [
		{ source: "/games" },
		{ source: "/(api.*)" }, // Apply to routes you want the middleware to process
	],
};
