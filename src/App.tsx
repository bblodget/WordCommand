import React from 'react';
import GameCanvas from './components/GameCanvas';


const App: React.FC = () => (
  <div className="w-screen h-screen bg-black flex items-center justify-center">
    <GameCanvas />
  </div>
);

export default App;