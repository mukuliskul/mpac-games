import { DaysOfWeek, EventStatus, GameMode, Role, TeamName } from "./enums";

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
  start_date: string;
  event_status: EventStatus;
}

export interface Enrollment {
  id: string;
  event_id: number;
  username: string;
}

export interface GameSession {
  id: string;
  game_name: string;
  start_time: string;
  end_time: string;
  status: string;
  date: string;
  enrolled_count: number
}

export interface Player {
  username: string;
  team: TeamName;
  days_in_office: DaysOfWeek[];
  role: Role;
};

export interface Match {
  player1: string;
  player2: string;
  round: number;
  date: string;
  winner: string | null;
}

export interface Leaderboard {
  username: string;
  total_wins: number;
  last_updated: string;
}
