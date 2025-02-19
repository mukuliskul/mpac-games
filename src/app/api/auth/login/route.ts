import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt"; // Helper function to sign JWT

export async function POST(req: Request) {
	try {
		const { email, password } = await req.json();
		if (!email || !password) {
			return NextResponse.json(
				{ error: "Missing credentials" },
				{ status: 400 }
			);
		}

		// Fetch user from DB
		const { data: user, error } = await supabase
			.from("players")
			.select("id, email, password, username")
			.eq("email", email)
			.single();

		if (error || !user) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Compare hashed password
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Generate JWT token (valid for 1 hour)
		const token = signJwt(
			{ id: user.id, email: user.email, username: user.username },
			"1h"
		);

		// Create a response object
		const response = NextResponse.json(
			{
				success: true,
				user: { id: user.id, email: user.email, username: user.username },
			},
			{ status: 200 }
		);

		// Set HTTP-only cookie with the JWT
		response.cookies.set("jwt", token, {
			httpOnly: true,
			sameSite: "strict",
			maxAge: 3600, // 1 hour
			path: "/",
		});

		return response;
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
