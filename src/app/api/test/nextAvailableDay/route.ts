import { NextResponse } from "next/server";
import { findNextAvailableDate } from "@/lib/generateBracket";
import { DateTime } from 'luxon';
import { Player } from "@/lib/types/interfaces";
import { DaysOfWeek, Role, TeamName } from "@/lib/types/enums";

export async function GET() {
  try {
    const player1: Player = {
      username: 'Mukul',
      team: TeamName.Backend,
      days_in_office: ['Monday', 'Wednesday', 'Thursday'] as DaysOfWeek[],
      role: Role.Admin
    }
    const player2 = {
      username: 'Susmitha',
      team: TeamName.Backend,
      days_in_office: ['Monday', 'Wednesday', 'Thursday'] as DaysOfWeek[],
      role: Role.Player
    }
    const localDate = DateTime.fromISO('2025-05-13', { zone: 'America/New_York' });
    await findNextAvailableDate(
      player1,
      player2,
      localDate,
      new Set(['2025-05-13', '2025-07-12', '2025-09-22']),
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

