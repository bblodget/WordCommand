import React, { createContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction, Word, City, CompletedWord } from '../types/game';

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
    score: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    typedTimestamps: [],
    // Dynamic difficulty initial values
    level: 1,
    wave: 1,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    baselineWPM: (() => {
        const stored = localStorage.getItem('wordCommand_baselineWPM');
        return stored ? parseFloat(stored) : 40;
    })(),
    flowState: 'normal',
    difficultyMultiplier: 1.0,
    challengeMultiplier: 1.0,
    // Track completed words for wave/level advancement
    wordsCompletedInWave: 0,
    // Visual effect for completed words
    completedWords: [],
};

// Constants for wave/level progression
const WORDS_PER_WAVE = 10; // Number of words to complete before advancing to next wave
const WAVES_PER_LEVEL = 5; // Number of waves per level

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
        case 'SET_CHALLENGE_MULTIPLIER': {
            return { ...state, challengeMultiplier: action.payload };
        }
        case 'NEXT_WAVE': {
            // Start next wave
            return {
                ...state,
                wave: state.wave + 1,
                wordsCompletedInWave: 0,
            };
        }
        case 'LEVEL_UP': {
            // Go to next level, reset to wave 1
            const nextLevel = Math.min(5, state.level + 1);
            return {
                ...state,
                level: nextLevel,
                wave: 1,
                wordsCompletedInWave: 0,
                difficultyMultiplier: 1.0, // Reset difficulty on level up
            };
        }
        case 'RESET_GAME': {
            // Reset the game but keep the baselineWPM
            return {
                ...initialState,
                baselineWPM: state.baselineWPM,
                cities: initialCities.map(c => ({ ...c, alive: true })),
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
            const now = Date.now();
            // Increment total keystrokes
            const totalKeystrokes = state.totalKeystrokes + 1;
            // Determine if keystroke matches any word
            const correct = state.words.some(w => w.text[w.typed] === char);
            const correctKeystrokes = state.correctKeystrokes + (correct ? 1 : 0);
            // Track consecutive successes/failures
            let consecutiveSuccesses = correct
                ? state.consecutiveSuccesses + 1
                : 0;
            let consecutiveFailures = correct
                ? 0
                : state.consecutiveFailures + 1;
            let difficultyMultiplier = state.difficultyMultiplier;
            // Heat-up
            if (consecutiveSuccesses >= 4) {
                difficultyMultiplier = Math.min(1.5, difficultyMultiplier * 1.1);
                consecutiveSuccesses = 0;
            }
            // Cool-down
            if (consecutiveFailures >= 4) {
                difficultyMultiplier = Math.max(0.7, difficultyMultiplier * 0.85);
                consecutiveFailures = 0;
            }
            // Update words and score tracking
            const finishedTimestamps = [...state.typedTimestamps];
            let scoreDelta = 0;

            // Calculate current WPM for score multiplier
            const windowMs = 10 * 1000;
            const recentCount = state.typedTimestamps.filter(ts => now - ts <= windowMs).length;
            const currentWpm = recentCount * 6;

            // Track completed words for wave progression
            let wordsCompletedInWave = state.wordsCompletedInWave;
            let shouldAdvanceWave = false;
            let shouldLevelUp = false;

            const completedWords = [...state.completedWords];

            const updatedWords = state.words.map(w => {
                const match = w.text[w.typed] === char;
                const newTyped = match ? w.typed + 1 : 0;

                if (match && newTyped === w.text.length) {
                    // Word completed
                    wordsCompletedInWave++;

                    // Check for wave/level advancement
                    if (wordsCompletedInWave >= WORDS_PER_WAVE) {
                        wordsCompletedInWave = 0;
                        shouldAdvanceWave = true;
                    }

                    // Base score: word length * 10
                    const baseScore = w.text.length * 10;

                    // WPM multiplier: current WPM / baseline WPM (capped at 3.0x)
                    const wpmMultiplier = Math.min(3.0, currentWpm / state.baselineWPM);

                    // Accuracy bonus: exponential growth based on consecutive correct words
                    const accuracyBonus = Math.pow(1.1, state.consecutiveSuccesses);

                    // Survival bonus: scales with number of cities alive
                    const citiesAlive = state.cities.filter(c => c.alive).length;
                    const survivalBonus = (citiesAlive / 6) * 1.5; // Max 1.5x when all cities alive

                    // Final score calculation
                    scoreDelta += Math.round(baseScore * wpmMultiplier * accuracyBonus * survivalBonus);

                    // Add to completed words list with timestamp for fadeout effect
                    completedWords.push({
                        id: w.id,
                        text: w.text,
                        x: w.x,
                        y: w.y,
                        timestamp: now,
                        score: Math.round(baseScore * wpmMultiplier * accuracyBonus * survivalBonus),
                    });

                    finishedTimestamps.push(now);
                }
                return { ...w, typed: newTyped };
            });

            const words = updatedWords.filter(w => w.typed < w.text.length);

            // Filter out completed words that have been displayed for more than 1 second
            const currentCompletedWords = completedWords.filter(w => now - w.timestamp < 1000);

            // Update next wave or level after processing all words
            if (shouldAdvanceWave) {
                // Check if we should level up
                if (state.wave >= WAVES_PER_LEVEL) {
                    shouldLevelUp = true;
                }
            }

            const newState = {
                ...state,
                words,
                score: state.score + scoreDelta,
                totalKeystrokes,
                correctKeystrokes,
                typedTimestamps: finishedTimestamps,
                consecutiveSuccesses,
                consecutiveFailures,
                difficultyMultiplier,
                wordsCompletedInWave,
                completedWords: currentCompletedWords,
            };

            // After the game state is updated, dispatch next wave or level up if needed
            if (shouldLevelUp) {
                setTimeout(() => dispatch({ type: 'LEVEL_UP' }), 500);
            } else if (shouldAdvanceWave) {
                setTimeout(() => dispatch({ type: 'NEXT_WAVE' }), 500);
            }

            return newState;
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