import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
	try {
		const { email, password, username } = await req.json();

		// Check if email already exists
		const { data: existingPlayer } = await supabase
			.from("players")
			.select("id")
			.eq("email", email)
			.single();

		if (existingPlayer) {
			console.log("Player exists");
			return NextResponse.json(
				{ message: "Email already exists" },
				{ status: 400 }
			);
		}

		// Check if username is taken
		const { data: existingUsername } = await supabase
			.from("players")
			.select("id")
			.eq("username", username)
			.single();

		if (existingUsername) {
			return NextResponse.json(
				{ message: "Username already taken" },
				{ status: 400 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Insert player into Supabase
		const { data, error } = await supabase
			.from("players")
			.insert([{ email, password: hashedPassword, username }])
			.select()
			.single();

		if (error) {
			throw error;
		}

		return NextResponse.json(
			{ player: data, message: "User registered successfully" },
			{ status: 201 }
		);
	} catch (error: any) {
		console.error("Registration Error:", error.message);

		return NextResponse.json(
			{ error: error.message || "Error registering player" },
			{ status: 500 }
		);
	}
}
