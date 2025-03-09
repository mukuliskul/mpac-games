export interface Game {
  id: number;
  name: string;
  description: string;
  image_url: string;
  rules: string;
  modes: string;
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


