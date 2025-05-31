import { DaysOfWeek, EventStatus, GameMode, Role, TeamName } from "./enums";

export interface Game {
  id: number;
  name: string;
  description: string;
  image_url: string;
  rules: string;
  modes: GameMode[];
  available_online: boolean;
}

export interface Edition {
  id: number;
  name: string;
  is_active: boolean;
  enrollment_end_date: string;
  edition_start_date: string;
}

export interface Event {
  id: number;
  game_name: string;
  enrolled_count: number;
  edition: string;
  start_date: string;
  event_status: EventStatus;
}

export interface Enrollment {
  id: number;
  event_id: number;
  username: string;
}

export interface GameSession {
  id: number;
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
  player1: Player;
  player2: Player;
  round: number;
  date: string;
}

export interface Leaderboard {
  username: string;
  total_wins: number;
  last_updated: string;
}
