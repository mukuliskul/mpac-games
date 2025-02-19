import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";

export async function GET(req: NextRequest) {
	console.log("hi");
	const token = req.cookies.get("jwt")?.value;

	if (!token) {
		return NextResponse.json({ isAuthenticated: false }, { status: 401 });
	}

	try {
		verifyJwt(token);
		return NextResponse.json({ isAuthenticated: true });
	} catch (error) {
		return NextResponse.json({ isAuthenticated: false }, { status: 401 });
	}
}
