import React, { createContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction, Word, City } from '../types/game';

// Initialize 6 cities along bottom
const initialCities: City[] = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: (i + 1) * (800 / 7),
  alive: true,
}));

const initialState: GameState = {
  words: [],
  cities: initialCities,
  nextWordId: 1,
  gameOver: false,
};

// Reducer to handle game actions
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SPAWN_WORD': {
      const newWord = action.payload;
      return {
        ...state,
        words: [...state.words, newWord],
        nextWordId: state.nextWordId + 1,
      };
    }
    case 'TICK': {
      const { delta } = action.payload;
      let gameOver = state.gameOver;
      // Move words down
      const cities = state.cities.map(c => ({ ...c }));
      let words = state.words.map(w => ({ ...w, y: w.y + w.speed * delta }));
      // Check words that reached bottom
      words = words.filter(w => {
        if (w.y >= 580) {
          // Destroy first alive city
          const aliveCity = cities.find(c => c.alive);
          if (aliveCity) {
            aliveCity.alive = false;
            if (!cities.some(c => c.alive)) {
              gameOver = true;
            }
          }
          return false;
        }
        return true;
      });
      return { ...state, words, cities, gameOver };
    }
    case 'TYPE_CHAR': {
      const { char } = action.payload;
      let words = state.words.map(w => {
        if (w.text[w.typed] === char) {
          return { ...w, typed: w.typed + 1 };
        } else {
          return { ...w, typed: 0 };
        }
      });
      // Remove fully typed words
      words = words.filter(w => w.typed < w.text.length);
      return { ...state, words };
    }
    default:
      return state;
  }
};

// Context for game state
export const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({ state: initialState, dispatch: () => undefined });

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};