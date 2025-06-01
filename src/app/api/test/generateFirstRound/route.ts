import { NextResponse } from "next/server";
import { generateFirstRound } from "@/lib/generateBracket";

export async function GET() {
  try {
    // TODO: should be triggered by a cron job when enrollment end date is reached
    await generateFirstRound("a8345bed-43f0-40b4-8b7f-01b840bdaa56", "2025-05-12");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

