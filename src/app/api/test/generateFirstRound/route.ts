import { NextResponse } from "next/server";
import { generateFirstRound } from "@/lib/generateBracket";

export async function GET() {
  try {
    // TODO: should be triggered by a cron job when enrollment end date is reached
    await generateFirstRound("d6f8850b-4cc5-4d81-9711-9e7dccfa5796", "2025-05-12");
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

