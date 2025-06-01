import { NextResponse } from "next/server";
import { getEnrolledPlayers } from "@/lib/db";

export async function GET() {
  try {
    const enrolledPlayers = await getEnrolledPlayers("a8345bed-43f0-40b4-8b7f-01b840bdaa56");
    return NextResponse.json({ success: true, enrolledPlayers: Array.from(enrolledPlayers) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

