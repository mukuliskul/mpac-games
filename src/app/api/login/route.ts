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

		// Generate JWT token (or use NextAuth session)
		const token = signJwt({
			id: user.id,
			email: user.email,
			username: user.username,
		});

		return NextResponse.json({ token, user }, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
