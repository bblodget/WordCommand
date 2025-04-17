// Game model types
export interface Word {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  typed: number;
}

export interface City {
  id: number;
  x: number;
  alive: boolean;
}

export interface GameState {
  words: Word[];
  cities: City[];
  nextWordId: number;
  gameOver: boolean;
  // Scoring and stats
  score: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  // Timestamps (ms) for completed words for WPM calculation
  typedTimestamps: number[];
}

// Actions for game state management
export type GameAction =
  | { type: 'SPAWN_WORD'; payload: Word }
  | { type: 'TICK'; payload: { delta: number } }
  | { type: 'TYPE_CHAR'; payload: { char: string } };