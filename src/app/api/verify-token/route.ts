import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt"; // Helper function to verify JWT

export async function POST(req: Request) {
	try {
		const { token } = await req.json();

		// Verify token using the JWT secret key
		const isValid = verifyJwt(token) !== null;

		return NextResponse.json({ isValid }, { status: 200 });
	} catch (error) {
		console.error("Token verification failed:", error);
		return NextResponse.json({ error: "Invalid token" }, { status: 401 });
	}
}
