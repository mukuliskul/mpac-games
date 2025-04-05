import { DaysOfWeek, GameMode, Role, TeamName } from "./enums";

export interface Game {
  id: number;
  name: string;
  description: string;
  image_url: string;
  rules: string;
  game_mode: GameMode[];
  available_online: boolean;
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
