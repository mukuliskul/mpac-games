// app/api/test-holiday/route.ts
import { NextResponse } from "next/server";
import { isHoliday } from "@/lib/utils";

export async function GET() {
  try {
    const holidays = await isHoliday(); // should return Set<string>
    return NextResponse.json({ success: true, holidays: Array.from(holidays) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
