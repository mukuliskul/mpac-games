import { getCurrentNYDateString } from "@/lib/date";
import { supabase } from "@/lib/supabase";
import { Match } from "@/lib/types/interfaces";
import { NextResponse } from 'next/server';


/**
 * GET /api/game-session/
 *
 * upcoming: boolean (optional)
 *
 * Fetches all game sessions, optionally filtered for upcoming sessions.
*/
export async function GET(
  request: Request
) {
  const url = new URL(request.url);
  const filterUpcoming = url.searchParams.get('upcoming') === 'true';

  let query = supabase
    .from('game_sessions')
    .select(`
    *,
    event:event_id ( game_name )
  `); // join on event_id to get event.game_name

  if (filterUpcoming) {
    const today = getCurrentNYDateString();
    query = query
      .gte('match_date', today)
      .order('match_date', { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sessions: Match[] = (data ?? []).map(row => ({
    id: row.id,
    player1: row.player1_username,
    player2: row.player2_username,
    round: row.round,
    date: row.match_date,
    winner: row.winner_username,
    game_name: row.event?.game_name ?? null, // add event name here
  }));

  return NextResponse.json({ sessions });
}
