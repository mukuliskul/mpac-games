import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
	try {
		const { email, password } = await req.json();

		// Check if player already exists
		const { data: existingPlayer } = await supabase
			.from("players")
			.select("id")
			.eq("email", email)
			.single();

		if (existingPlayer) {
			return NextResponse.json(
				{ error: "Player already exists" },
				{ status: 400 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Insert player into Supabase
		const { data, error } = await supabase
			.from("players")
			.insert([{ email, password: hashedPassword }])
			.select()
			.single();

		if (error) {
			throw error;
		}

		return NextResponse.json({ player: data }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Error registering player" },
			{ status: 500 }
		);
	}
}
