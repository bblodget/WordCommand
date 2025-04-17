import React from 'react';
import GameCanvas from './components/GameCanvas';
import { GameProvider } from './context/GameContext';
import useGameEngine from './hooks/useGameEngine';
import HUD from './components/HUD';


// Wraps engine initialization and renders the GameCanvas
const GameRunner: React.FC = () => {
  useGameEngine();
  return <GameCanvas />;
};

const App: React.FC = () => (
  <GameProvider>
    <div className="relative w-screen h-screen bg-black">
      <HUD />
      <div className="flex items-center justify-center h-full">
        <GameRunner />
      </div>
    </div>
  </GameProvider>
);

export default App;