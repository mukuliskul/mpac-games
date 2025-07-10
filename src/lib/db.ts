import { formatToNYDateString, getCurrentNYDateTime } from './date';
import { findNextAvailableDate } from './generateBracket';
import { supabase } from './supabase';
import { EventStatus } from './types/enums';
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

export async function getEventStatus(eventId: string): Promise<EventStatus> {
  const { data, error } = await supabase
    .from('events')
    .select('event_status')
    .eq('id', eventId)
    .single();

  if (error) throw new Error(`Error fetching event status: ${error.message}`);
  if (!data) throw new Error("Event not found");

  return data.event_status as EventStatus;
}

export async function updateEventStatus(
  eventId: string,
  status: EventStatus
): Promise<void> {
  console.log(`Updating event ${eventId} status to ${status} 1`);
  const { error } = await supabase
    .from('event')
    .update({ event_status: status })
    .eq('id', eventId);

  console.log(`Updating event ${eventId} status to ${status}`);

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }
}

export async function updateWinner(
  gameSessionId: string,
  winner: string
): Promise<void> {
  const { error } = await supabase
    .from('game_sessions')
    .update({ winner_username: winner })
    .eq('id', gameSessionId);

  if (error) {
    throw new Error(`Failed to update winner: ${error.message}`);
  }
}

export async function rescheduleGame(
  gameSessionId: string,
): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', gameSessionId)
    .single();

  if (fetchError || !data) throw fetchError;

  const match: Match = {
    id: data.id,
    player1: data.player1_username,
    player2: data.player2_username,
    round: data.round,
    date: data.match_date,
    winner: data.winner_username,
  };

  const player1 = await getPlayerByUsername(match.player1);
  const player2 = await getPlayerByUsername(match.player2);

  // Find next available date for the match
  const currentDate = getCurrentNYDateTime();
  const nextDate = await findNextAvailableDate(
    player1,
    player2,
    formatToNYDateString(currentDate),
    data.event_id, // TODO: include it in the match object
  );

  const { error } = await supabase
    .from('game_sessions')
    .update({ match_date: nextDate })
    .eq('id', gameSessionId);

  if (error) {
    throw new Error(`Failed to update date: ${error.message}`);
  }
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

export async function isEventBookedOnDate(eventId: string, dateStr: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('event_id', eventId)
    .eq('match_date', dateStr)
    .limit(1);

  if (error) throw new Error(`Error checking event booking: ${error.message}`);
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

export async function getPlayerByUsername(username: string): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    throw new Error(`Error fetching player: ${error.message}`);
  }
  return data as Player;
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
      id: row.id,
      player1: row.player1_username,
      player2: row.player2_username,
      round: row.round,
      date: row.match_date,
      winner: row.winner_username,
    };

    return match;
  });
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

  // const { data } = await supabase
  //   .from('events')
  //   .select('event_name')
  //   .eq('id', eventId)
  //   .single();

  const { error } = await supabase
    .from('game_sessions')
    .insert({
      event_id: eventId,
      round,
      match_date: matchDate,
      player1_username: player1,
      player2_username: player2,
      winner_username: winner ?? null,
      // event_name: data?.event_name || null, //TODO: make sure this works
    });

  if (error) throw new Error(`Error inserting match: ${error.message}`);
}
