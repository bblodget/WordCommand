import React, { useContext, useEffect, useState } from 'react';
import { GameContext } from '../context/GameContext';

const HUD: React.FC = () => {
  const { state } = useContext(GameContext);
  const { score, totalKeystrokes, correctKeystrokes, typedTimestamps, cities } = state;
  const [wpm, setWpm] = useState(0);

  // Compute WPM over last 10 seconds
  useEffect(() => {
    const calcWpm = () => {
      const now = Date.now();
      const windowMs = 10 * 1000;
      const recentCount = typedTimestamps.filter(ts => now - ts <= windowMs).length;
      setWpm(recentCount * 6);
    };
    calcWpm();
    const id = setInterval(calcWpm, 1000);
    return () => clearInterval(id);
  }, [typedTimestamps]);

  const accuracy =
    totalKeystrokes > 0
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
      : 100;
  const citiesRemaining = cities.filter(c => c.alive).length;

  return (
    <div className="absolute top-2 left-2 text-white font-mono space-y-1 z-10">
      <div>Score: {score}</div>
      <div>WPM: {wpm}</div>
      <div>Accuracy: {accuracy}%</div>
      <div>Cities: {citiesRemaining}</div>
    </div>
  );
};

export default HUD;