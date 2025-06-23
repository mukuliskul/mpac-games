import { DaysOfWeek, GameMode, Role, TeamName } from "./enums";

// TODO: use camelCase in all interfaces
export interface Game {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rules: string;
  modes: GameMode[];
  available_online: boolean;
  is_active: boolean;
}

export interface Edition {
  id: string;
  name: string;
  is_active: boolean;
  enrollment_end_date: string;
  edition_start_date: string;
}

export interface Event {
  id: string;
  game_name: string;
  enrolled_count: number;
  edition: string;
}

export interface Enrollment {
  id: string;
  event_id: number;
  username: string;
}

export interface Player {
  username: string;
  team: TeamName;
  days_in_office: DaysOfWeek[];
  role: Role;
};

export interface Match {
  id: string;
  player1: string;
  player2: string;
  round: number;
  date: string;
  winner: string | null;
  game_name?: string | null;
}

export interface Leaderboard {
  username: string;
  total_wins: number;
  last_updated: string;
}
