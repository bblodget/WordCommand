import React, { useEffect, useRef, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { Word, City } from '../types/game';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useContext(GameContext);
  const stateRef = useRef(state);

  // Keep stateRef updated on each state change
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { words, cities, gameOver } = stateRef.current;
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw falling words
      ctx.font = '20px monospace';
      words.forEach((w: Word) => {
        for (let i = 0; i < w.text.length; i++) {
          ctx.fillStyle = i < w.typed ? 'cyan' : 'white';
          ctx.fillText(w.text[i], w.x + i * 12, w.y);
        }
      });

      // Draw cities
      cities.forEach((c: City) => {
        ctx.fillStyle = c.alive ? 'lime' : 'darkred';
        ctx.fillRect(c.x - 20, 580, 40, 20);
      });

      // Draw game over
      if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '48px sans-serif';
        ctx.fillText('Game Over', 300, 300);
      }

      if (!gameOver) {
        requestAnimationFrame(render);
      }
    };
    requestAnimationFrame(render);
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default GameCanvas;
