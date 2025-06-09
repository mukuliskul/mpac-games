import { supabase } from './supabase';
import { Match, Player } from './types/interfaces';

// TODO: organize methods properly
export async function getByePlayer(): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('username', 'BYE')
    .single();

  if (error) throw new Error("Missing BYE player in DB");
  return data;
}

export async function getEnrolledPlayers(eventId: string): Promise<Player[]> {
  // Step 1: Get usernames from enrollments
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('username')
    .eq('event_id', eventId);

  if (enrollmentsError) {
    throw new Error(`Error fetching enrollments: ${enrollmentsError.message}`);
  }

  const usernames = enrollments?.map(e => e.username);
  if (!usernames || usernames.length === 0) {
    return [];
  }

  // Step 2: Fetch players from players table
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('username, team, days_in_office, role')
    .in('username', usernames);

  if (playersError) {
    throw new Error(`Error fetching players: ${playersError.message}`);
  }

  return players as Player[];
}

export async function isPlayerBusyOnDate(username: string, dateStr: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('match_date', dateStr)
    .or(`player1_username.eq.${username}, player2_username.eq.${username}`)
    .limit(1);

  if (error) throw new Error(`Error checking busy date: ${error.message}`);
  return data.length > 0;
}

export async function getLastRound(eventId: string): Promise<number> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('round')
    .eq('event_id', eventId)
    .order('round', { ascending: false })
    .limit(1);

  if (error || !data.length) throw new Error("No previous rounds");

  return data[0].round;
}

export async function getPlayersByUsernames(usernames: string[]) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .in('username', usernames);

  if (error) throw new Error("Failed to fetch players");
  return data;
}

export async function getMatchesForRound(eventId: string, round: number): Promise<Match[]> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('event_id', eventId)
    .eq('round', round);

  if (error) throw new Error("Failed to fetch matches");

  return data.map(row => {

    const match: Match = {
      player1: row.player1_username,
      player2: row.player2_username,
      round: row.round,
      date: row.match_date,
      winner: row.winner_username,
    };

    return match;
  });
}

// TODO: move this logic to use effect
// TODO: move the logic for get matches for round to a nextjs endpoint
export async function getAllRounds(eventId: string): Promise<Match[][]> {
  const rounds: Match[][] = [];
  let round = 1;

  while (true) {
    // TODO: order by dates in asc
    const matches = await getMatchesForRound(eventId, round);
    if (!matches || matches.length === 0) break;
    rounds.push(matches);
    round++;
  }

  return rounds;
}

export async function insertGameSession(params: {
  eventId: string;
  round: number;
  matchDate: string;
  player1: string;
  player2: string;
  winner?: string | null;
}): Promise<void> {
  const { eventId, round, matchDate, player1, player2, winner } = params;

  const { error } = await supabase
    .from('game_sessions')
    .insert({
      event_id: eventId,
      round,
      match_date: matchDate,
      player1_username: player1,
      player2_username: player2,
      winner_username: winner ?? null,
    });

  if (error) throw new Error(`Error inserting match: ${error.message}`);
}
