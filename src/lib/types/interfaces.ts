import { DaysOfWeek, EventEdition, EventStatus, GameMode, Role, TeamName } from "./enums";

export interface Game {
  id: number;
  name: string;
  description: string;
  image_url: string;
  rules: string;
  modes: GameMode[];
  available_online: boolean;
}

export interface Event {
  id: number;
  game_name: string;
  enrolled_count: number;
  edition: EventEdition
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
  team_name: TeamName;
  days_in_office: DaysOfWeek[];
  role: Role;
};

export interface Leaderboard {
  username: string;
  total_wins: number;
  last_updated: string;
}
