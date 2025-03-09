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
  day: string;
  enrolled_count: number
}

// TODO: Design the Enroll interface
export interface Enroll {
  id: number;
  game_id: number;
  name: string;
  description: string;
  image_url: string;
  rules: string;
  modes: string;
}


