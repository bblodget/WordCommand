import React from 'react';
import GameCanvas from './components/GameCanvas';
import { GameProvider } from './context/GameContext';
import useGameEngine from './hooks/useGameEngine';


// Wraps engine initialization and renders the GameCanvas
const GameRunner: React.FC = () => {
  useGameEngine();
  return <GameCanvas />;
};

const App: React.FC = () => (
  <GameProvider>
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <GameRunner />
    </div>
  </GameProvider>
);

export default App;