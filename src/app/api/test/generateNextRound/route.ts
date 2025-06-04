import { NextResponse } from "next/server";
import { generateNextRound } from "@/lib/generateBracket";

export async function GET() {
  try {
    // TODO: should be triggered by a trigger when winner is added for all games in that round
    await generateNextRound("d6f8850b-4cc5-4d81-9711-9e7dccfa5796", "2025-05-19");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


