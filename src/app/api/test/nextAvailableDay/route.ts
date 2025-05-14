import { NextResponse } from "next/server";
import { findNextAvailableDate } from "@/lib/generateBracket";
import { DateTime } from 'luxon';

export async function GET() {
  try {
    const player1 = {
      username: 'Mukul',
      team: 'backend',
      days_in_office: ['Monday', 'Wednesday', 'Thursday'],
      role: 'admin'
    }
    const player2 = {
      username: 'Kevin',
      team: 'other',
      days_in_office: null,
      role: 'player'
    }
    const localDate = DateTime.fromISO('2025-05-13', { zone: 'America/New_York' });
    const jsDate = localDate.toJSDate(); // native JavaScript Date object
    await findNextAvailableDate(
      player1,
      player2,
      jsDate,
      new Set(['2025-05-13', '2025-07-12', '2025-09-22']),
      "a8345bed-43f0-40b4-8b7f-01b840bdaa56"
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

