import { supabase } from "@/lib/supabase";
import { Match } from "@/lib/types/interfaces";

/**
 * GET /api/game-sessions/event/[eventId]/[round]
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
    .order('match_date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return new Response("Error fetching data", { status: 500 });
  }

  const matches: Match[] = (data ?? []).map(row => ({
    id: row.id,
    player1: row.player1_username,
    player2: row.player2_username,
    round: row.round,
    date: row.match_date,
    winner: row.winner_username,
  }));

  // Sort so that matches with BYE appear first
  matches.sort((a, b) => {
    const aIsBye = a.player1 === 'BYE' || a.player2 === 'BYE';
    const bIsBye = b.player1 === 'BYE' || b.player2 === 'BYE';

    if (aIsBye && !bIsBye) return -1;
    if (!aIsBye && bIsBye) return 1;
    return 0; // maintain original order
  });

  return new Response(JSON.stringify(matches), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

