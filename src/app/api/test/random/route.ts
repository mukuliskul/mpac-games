import { NextResponse } from "next/server";
import { generateBracket } from "@/lib/generateBracket";

export async function GET() {
  try {
    await generateBracket("a8345bed-43f0-40b4-8b7f-01b840bdaa56", "2025-05-12");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

