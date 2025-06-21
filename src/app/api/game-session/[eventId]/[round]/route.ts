import { supabase } from "@/lib/supabase";
import { Match } from "@/lib/types/interfaces";

/**
 * GET /api/game-sessions/[eventId]/[round]
 *
 * eventId: string
 * round: number
 *
 * Retrieves a game session by event ID and round number.
*/

export async function GET(
  _request: Request,
  { params }: {
    params: Promise<{
      eventId: string, round: number
    }>
  }
) {
  const { eventId, round } = await params;

  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('event_id', eventId)
    .eq('round', round)
    .order('created_at', { ascending: true });

  if (error) {
    return new Response("Error fetching data", { status: 500 });
  }

  const matches = (data ?? []).map(row => {
    const match: Match = {
      player1: row.player1_username,
      player2: row.player2_username,
      round: row.round,
      date: row.match_date,
      winner: row.winner_username,
    };
    return match;
  });

  return new Response(JSON.stringify(matches), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

