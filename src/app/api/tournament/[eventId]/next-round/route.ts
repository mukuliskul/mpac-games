/**
 * POST /api/tournament/[eventId]/next-round
 *
 * eventId: string
 * body: {
 *  player1: string,
 *  player2: string,
 *  round: number,
 * }
 *
 * Creates a new game session for two players in a specific event, round, and date.
*/

import { formatToNYDateString, getCurrentNYDateTime } from "@/lib/date";
import { getPlayerByUsername, insertGameSession } from "@/lib/db";
import { findNextAvailableDate } from "@/lib/generateBracket";

export async function POST(
  request: Request,
  { params }: {
    params: Promise<{
      eventId: string
    }>
  }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const { player1, player2, round } = body;
    const currentDate = getCurrentNYDateTime();
    const startDate = currentDate.plus({ days: 1 });

    const player1Obj = await getPlayerByUsername(player1);
    const player2Obj = await getPlayerByUsername(player2);
    const matchDateObj = await findNextAvailableDate(
      player1Obj,
      player2Obj,
      startDate,
    )
    const matchDate = formatToNYDateString(matchDateObj);

    console.log(`
      Creating game session:
      Player 1: ${player1},
      Player 2: ${player2},
      Event ID: ${eventId},
      Round: ${round},
      Match Date: ${matchDate}
    `)
    const result = await insertGameSession({
      eventId: eventId,
      round: round,
      matchDate: matchDate,
      player1: player1,
      player2: player2,
    });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating game session:", error);
    return new Response(JSON.stringify({ message: "Failed to create game session" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


