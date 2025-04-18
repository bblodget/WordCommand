import { useContext, useEffect, useRef } from 'react';
import { GameContext } from '../context/GameContext';
import { loadLevelWords } from '../data/index';
import { Word } from '../types/game';

// Hook to initialize and run the game loop
export default function useGameEngine(): void {
  const { state, dispatch } = useContext(GameContext);
  
  // Update baseline WPM when game is over
  useEffect(() => {
    if (state.gameOver) {
      const now = Date.now();
      const windowMs = 30 * 1000; // Look at the last 30 seconds for final WPM calculation
      const recentCount = state.typedTimestamps.filter(
        ts => now - ts <= windowMs
      ).length;
      const finalWpm = Math.round(recentCount * 2); // words per 30 seconds * 2 = WPM
      
      // Update baseline WPM if player achieved a higher rate
      if (finalWpm > state.baselineWPM) {
        localStorage.setItem('wordCommand_baselineWPM', finalWpm.toString());
        console.log(`New baseline WPM: ${finalWpm}`);
      }
    }
  }, [state.gameOver, state.typedTimestamps, state.baselineWPM]);
  
  // Load words for current level and dynamically spawn
  // Keep a ref to latest state for spawn calculations
  const stateRef = { current: state as typeof state } as { current: typeof state };
  useEffect(() => {
    stateRef.current = state;
    let levelWords: string[] = [];
    // Load level word list
    loadLevelWords(stateRef.current.level).then(words => {
      levelWords = words.filter(w => w.length > 1);
      console.log(`Loaded ${levelWords.length} words for level ${stateRef.current.level}`);
    });
    
    // Flag to prevent multiple spawn loops from running
    let cancelled = false;
    
    // Spawn loop using dynamic spawn rate
    const spawnLoop = async () => {
      if (cancelled) return;
      const now = Date.now();
      // Calculate current WPM from typedTimestamps (last 10s)
      const windowMs = 10 * 1000;
      const recentCount = stateRef.current.typedTimestamps.filter(
        ts => now - ts <= windowMs
      ).length;
      const currentWpm = recentCount * 6;
      // Dynamic spawn rate (words per second)
      const baseRate = 0.3; // Increased from 0.25 to 0.3
      const wpmFactor = Math.min(2.0, Math.max(0.8, currentWpm / state.baselineWPM));
      const levelFactor = 1 + (stateRef.current.level * 0.15); // Increased from 0.08 to 0.15
      
      // Calculate spawn rate with a cap to prevent overwhelming the player
      let spawnRate =
        baseRate * wpmFactor * levelFactor * stateRef.current.difficultyMultiplier * stateRef.current.challengeMultiplier;
        
      // Hard cap on spawn rate to prevent too many words
      const maxSpawnRate = 1.5; // Increased from 1.2 to 1.5
      spawnRate = Math.min(maxSpawnRate, spawnRate);
      
      const interval = 1000 / spawnRate;
      
      // Don't spawn if we already have too many words on screen
      const maxWordsOnScreen = 4 + Math.floor(stateRef.current.level * 1.5); // Increased level scaling from 1.2 to 1.5
      
      // Log spawn rate data for debugging (only occasionally to avoid console spam)
      if (Math.random() < 0.05) {
        console.log(`Spawn Rate: ${spawnRate.toFixed(2)} words/s (interval: ${Math.round(interval)}ms)`);
        console.log(`Words on screen: ${stateRef.current.words.length}/${maxWordsOnScreen}`);
        console.log(`Factors: base=${baseRate}, wpm=${wpmFactor.toFixed(2)}, level=${levelFactor.toFixed(2)}, diff=${stateRef.current.difficultyMultiplier.toFixed(2)}`);
      }
      
      // Schedule next spawn
      setTimeout(() => {
        if (!stateRef.current.gameOver && levelWords.length > 0 && 
            stateRef.current.words.length < maxWordsOnScreen) {
          const text =
            levelWords[
              Math.floor(Math.random() * levelWords.length)
            ];
            
          // Better horizontal distribution - ensure words aren't too close to edges
          // and divide the screen into sections to avoid overlapping
          const padding = 30; // Reduced from 50 to 30 to use more of the screen
          const availableWidth = 800 - (padding * 2) - (text.length * 12);
          
          // Simplified positioning - randomly place words across the entire screen width
          // but avoid overlapping by checking for collisions with existing words
          let x;
          let attempts = 0;
          const wordWidth = text.length * 12;
          const safetyMargin = 20; // Minimum horizontal distance between words
          
          do {
            // Random position across the entire available width
            x = padding + Math.random() * availableWidth;
            
            // Check for collisions with existing words
            const hasCollision = stateRef.current.words.some(existingWord => {
              const existingWordWidth = existingWord.text.length * 12;
              const existingWordLeft = existingWord.x;
              const existingWordRight = existingWordLeft + existingWordWidth;
              
              const newWordLeft = x;
              const newWordRight = newWordLeft + wordWidth;
              
              // Check if the new word overlaps with an existing word
              // with safety margin on both sides
              return (
                (newWordLeft - safetyMargin < existingWordRight) && 
                (newWordRight + safetyMargin > existingWordLeft)
              );
            });
            
            if (!hasCollision || attempts > 5) {
              break; // Either no collision or we've tried enough times
            }
            
            attempts++;
          } while (attempts <= 5);
          
          // Adjust speed based on level and difficulty
          const baseSpeed = 30 + (state.level * 6); // Increased from 25 to 30, and level scaling from 4 to 6
          const speedVariation = 20; // Increased from 15 to 20
          const speed = 
            baseSpeed + 
            (Math.random() * speedVariation) * 
            stateRef.current.difficultyMultiplier * 
            stateRef.current.challengeMultiplier;
          
          const word: Word = {
            id: stateRef.current.nextWordId.toString(),
            text,
            x,
            y: 0,
            speed,
            typed: 0,
          };
          dispatch({ type: 'SPAWN_WORD', payload: word });
        }
        
        // CRITICAL FIX: Only continue the spawn loop if the game is not over
        if (!stateRef.current.gameOver) {
          spawnLoop();
        }
      }, interval);
    };
    
    // Start the spawn loop
    spawnLoop();
    
    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [dispatch, state.level]); // Only re-run when level changes, not on every state change

  // Main game loop for physics
  useEffect(() => {
    let last = performance.now();
    let rafId: number;
    const loop = (time: number) => {
      const delta = (time - last) / 1000;
      last = time;
      dispatch({ type: 'TICK', payload: { delta } });
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [dispatch]);

  // Listen for key presses to type letters
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (/^[a-z]$/i.test(e.key) && !state.gameOver) {
        dispatch({ type: 'TYPE_CHAR', payload: { char: e.key.toLowerCase() } });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, state.gameOver]);
}