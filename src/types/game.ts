// Game model types
export interface Word {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  typed: number;
}

// Completed word for visual effect
export interface CompletedWord {
  id: string;
  text: string;
  x: number;
  y: number;
  timestamp: number;  // When the word was completed
  score: number;      // Points earned for this word
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
  // Dynamic difficulty properties
  level: number;                // 1-5
  wave: number;                 // current wave in level
  consecutiveSuccesses: number; // count of words typed correctly in a row
  consecutiveFailures: number;  // count of errors in a row
  baselineWPM: number;          // stored baseline WPM
  flowState: 'struggling' | 'normal' | 'in-flow';
  difficultyMultiplier: number; // heat-up/cool-down applied
  challengeMultiplier: number;  // player-adjusted (0.8-1.2)
  // Wave progression
  wordsCompletedInWave: number; // track words completed toward next wave
  // Visual effects
  completedWords: CompletedWord[]; // recently completed words for visual feedback
}

// Actions for game state management
export type GameAction =
  | { type: 'SPAWN_WORD'; payload: Word }
  | { type: 'TICK'; payload: { delta: number } }
  | { type: 'TYPE_CHAR'; payload: { char: string } }
  | { type: 'SET_CHALLENGE_MULTIPLIER'; payload: number }
  | { type: 'NEXT_WAVE' }
  | { type: 'LEVEL_UP' }
  | { type: 'RESET_GAME' };