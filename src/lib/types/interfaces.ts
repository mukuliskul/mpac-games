export interface Game {
  id: number;
  name: string;
  description: string;
  image_url: string;
  rules: string;
  modes: string;
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

export interface Leaderbaord {
  username: string;
  wins: number;
}
