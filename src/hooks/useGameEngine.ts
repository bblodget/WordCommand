import { useContext, useEffect } from 'react';
import { GameContext } from '../context/GameContext';
import { loadEasyWords } from '../data/index';
import { Word } from '../types/game';

// Hook to initialize and run the game loop
export default function useGameEngine(): void {
  const { state, dispatch } = useContext(GameContext);
  // Load easy words for initial level
  useEffect(() => {
    let easyWords: string[] = [];
    loadEasyWords().then(mod => {
      easyWords = (mod.default || mod) as string[];
    });
    // Spawn a new word every 2 seconds
    const spawnInterval = 2000;
    const intervalId = setInterval(() => {
      if (!state.gameOver && easyWords.length > 0) {
        const text = easyWords[Math.floor(Math.random() * easyWords.length)];
        const x = Math.random() * (800 - text.length * 12);
        const speed = 40 + Math.random() * 40;
        const word: Word = {
          id: state.nextWordId.toString(),
          text,
          x,
          y: 0,
          speed,
          typed: 0,
        };
        dispatch({ type: 'SPAWN_WORD', payload: word });
      }
    }, spawnInterval);
    return () => clearInterval(intervalId);
  }, [dispatch, state.gameOver, state.nextWordId]);

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