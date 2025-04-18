import React, { useContext, useRef, useEffect, useState } from 'react';
import { GameContext } from '../context/GameContext';
import { Word, City } from '../types/game';

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { state, dispatch } = useContext(GameContext);
    const { words, cities, gameOver, level, wave } = state;

    // State to track level/wave changes for notifications
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showWaveUp, setShowWaveUp] = useState(false);
    const [prevLevel, setPrevLevel] = useState(level);
    const [prevWave, setPrevWave] = useState(wave);

    // Check for level or wave advancement
    useEffect(() => {
        // Level up notification
        if (level > prevLevel) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 2000);
            setPrevLevel(level);
        }

        // Wave up notification (but only if not also leveling up)
        if (wave > prevWave && level === prevLevel) {
            setShowWaveUp(true);
            setTimeout(() => setShowWaveUp(false), 2000);
        }

        setPrevWave(wave);
    }, [level, wave, prevLevel, prevWave]);

    // Drawing logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background with subtle gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(1, '#000022');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add subtle star effect in background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 50; i++) {
            const size = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                size,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // Draw cities
        cities.forEach(city => {
            ctx.fillStyle = city.alive ? '#7FFF7F' : '#FF3333';
            ctx.beginPath();
            ctx.moveTo(city.x - 20, 590);
            ctx.lineTo(city.x, 570);
            ctx.lineTo(city.x + 20, 590);
            ctx.fill();

            // Add a glow effect to active cities
            if (city.alive) {
                const glow = ctx.createRadialGradient(city.x, 580, 5, city.x, 580, 30);
                glow.addColorStop(0, 'rgba(127, 255, 127, 0.3)');
                glow.addColorStop(1, 'rgba(127, 255, 127, 0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(city.x, 580, 30, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw words
        ctx.font = '18px monospace';
        words.forEach(word => {
            // Draw word background for better visibility
            const wordWidth = ctx.measureText(word.text).width;
            ctx.fillStyle = 'rgba(0, 0, 50, 0.6)';
            ctx.fillRect(
                word.x - 2,
                word.y - 2,
                wordWidth + 4,
                24
            );

            // Add subtle border to words
            ctx.strokeStyle = 'rgba(100, 100, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                word.x - 3,
                word.y - 3,
                wordWidth + 6,
                26
            );

            // Highlight the portion that's been typed
            if (word.typed > 0) {
                ctx.fillStyle = '#7FFF7F';
                ctx.fillText(
                    word.text.substring(0, word.typed),
                    word.x,
                    word.y + 16
                );
            }

            // Draw remaining part of the word
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(
                word.text.substring(word.typed),
                word.x + ctx.measureText(word.text.substring(0, word.typed)).width,
                word.y + 16
            );
        });

        // Draw completed words with fade-out effect
        state.completedWords.forEach(word => {
            const now = Date.now();
            const ageMs = now - word.timestamp;
            const opacity = 1.0 - (ageMs / 1000); // Fade out over 1 second

            // Skip if fully faded out
            if (opacity <= 0) return;

            // Animate the completed word - move up slightly with fading
            const offsetY = -10 * (ageMs / 1000); // Move up 10px over 1 second

            // Draw the word with fading opacity
            ctx.font = '18px monospace';
            ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
            ctx.fillText(word.text, word.x, word.y + offsetY + 16);

            // Draw score with fading and floating
            ctx.font = '16px monospace';
            ctx.fillStyle = `rgba(255, 255, 0, ${opacity})`;
            ctx.fillText(`+${word.score}`, word.x + ctx.measureText(word.text).width + 10, word.y + offsetY + 16);
        });

    }, [words, cities, state.completedWords]);

    // Handle restart
    const handleRestart = () => {
        dispatch({ type: 'RESET_GAME' });
    };

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-gray-800"
            />

            {/* Level up notification */}
            {showLevelUp && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-blue-500/70 text-white py-3 px-8 rounded-lg text-2xl font-bold animate-pulse">
                        Level {level}!
                    </div>
                </div>
            )}

            {/* Wave up notification */}
            {showWaveUp && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-green-500/70 text-white py-2 px-6 rounded-lg text-xl font-bold animate-pulse">
                        Wave {wave}
                    </div>
                </div>
            )}

            {/* Game over overlay */}
            {gameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Game Over</h2>
                    <p className="text-white mb-4">Final Score: {state.score}</p>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={handleRestart}
                    >
                        Restart Game
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameCanvas;
