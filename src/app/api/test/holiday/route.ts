import { NextResponse } from "next/server";
import { isHoliday } from "@/lib/utils";

export async function GET() {
  try {
    const holidays = await isHoliday(); // should return Set<string>
    return NextResponse.json({ success: true, holidays: Array.from(holidays) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
