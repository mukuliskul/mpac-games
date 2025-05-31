import { supabase } from './supabase';
import { Player } from './types/interfaces';
import { formatInTimeZone } from "date-fns-tz";

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

export async function isPlayerBusyOnDate(username: string, dateStr: str): Promise<boolean> {
  console.log(`Checking if player ${username} is busy on date ${dateStr}`);

  const { data, error } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('match_date', dateStr)
    .or(`player1_username.eq.${username}, player2_username.eq.${username}`)
    .limit(1);
  // .neq('event_id', eventId); TODO: this shouldnt be needed since it doesnt matter as long as the player is busy


  console.log("Data:", data);
  console.log("--------------")


  if (error) throw new Error(`Error checking busy date: ${error.message}`);
  return data.length > 0;
}

export async function insertGameSession(params: {
  eventId: string;
  round: number;
  matchDate: string;
  player1: string;
  player2: string;
  winner?: string | null;
}) {
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
