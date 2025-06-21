/**
 * POST /api/game-session/
 *
 * body: {
 *  player_1: string,
 *  player_2: string,
 *  event_id: string,
 *  round: number,
 *  match_date: string
 * }
 *
 * Creates a new game session for two players in a specific event, round, and date.
*/

import { insertGameSession } from "@/lib/db";

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();
    const { player_1, player_2, event_id, round, match_date } = body;

    console.log(`
      Creating game session:
      Player 1: ${player_1},
      Player 2: ${player_2},
      Event ID: ${event_id},
      Round: ${round},
      Match Date: ${match_date}
    `)
    const result = await insertGameSession({
      eventId: event_id,
      round: round,
      matchDate: match_date,
      player1: player_1,
      player2: player_2,
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

