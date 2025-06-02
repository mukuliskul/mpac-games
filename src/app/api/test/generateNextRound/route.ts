import { NextResponse } from "next/server";
import { generateNextRound } from "@/lib/generateBracket";

export async function GET() {
  try {
    // TODO: should be triggered by a trigger when winner is added for all games in that round
    await generateNextRound("a8345bed-43f0-40b4-8b7f-01b840bdaa56", "2025-05-19");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


