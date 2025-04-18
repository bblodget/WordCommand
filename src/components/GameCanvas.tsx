import React, { useContext, useRef, useEffect, useState } from 'react';
import { GameContext } from '../context/GameContext';
import { Word, City } from '../types/game';

// Star field configuration
interface Star {
    x: number;
    y: number;
    size: number;
    brightness: number;
    twinkleSpeed: number;
}

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { state, dispatch } = useContext(GameContext);
    const { words, cities, gameOver, level, wave } = state;
    const animationRef = useRef<number>(0);
    const starsRef = useRef<Star[]>([]);

    // State to track level/wave changes for notifications
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showWaveUp, setShowWaveUp] = useState(false);
    const [prevLevel, setPrevLevel] = useState(level);
    const [prevWave, setPrevWave] = useState(wave);

    // Initialize star field once
    useEffect(() => {
        // Create 150 stars with different properties
        const stars: Star[] = [];
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                size: Math.random() * 1.5 + 0.5,
                brightness: Math.random(),
                twinkleSpeed: 0.3 + Math.random() * 0.7,
            });
        }
        starsRef.current = stars;
    }, []);

    // Sound effects function
    const playSound = (type: 'levelUp' | 'waveUp' | 'wordComplete' | 'gameOver') => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Set parameters based on sound type
            switch (type) {
                case 'levelUp':
                    // Ascending triumphant sound
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(660, audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;

                case 'waveUp':
                    // Quick ascending note
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(550, audioContext.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;

                case 'wordComplete':
                    // Quick blip sound
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;

                case 'gameOver':
                    // Descending sad sound
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(220, audioContext.currentTime + 0.5);
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.6);
                    break;
            }
        } catch (e) {
            console.log('Audio error:', e);
        }
    };

    // Listen for level up and wave up events
    useEffect(() => {
        const handleLevelUp = () => {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
            setPrevLevel(level);
            playSound('levelUp');
        };

        const handleWaveUp = () => {
            setShowWaveUp(true);
            setTimeout(() => setShowWaveUp(false), 2000);
            playSound('waveUp');
        };

        window.addEventListener('levelUp', handleLevelUp);
        window.addEventListener('waveUp', handleWaveUp);

        return () => {
            window.removeEventListener('levelUp', handleLevelUp);
            window.removeEventListener('waveUp', handleWaveUp);
        };
    }, []);

    // Play game over sound
    useEffect(() => {
        if (gameOver) {
            playSound('gameOver');
        }
    }, [gameOver]);

    // Listen for word completion events
    useEffect(() => {
        const handleWordComplete = () => {
            playSound('wordComplete');
        };

        window.addEventListener('wordCompleted', handleWordComplete);

        return () => {
            window.removeEventListener('wordCompleted', handleWordComplete);
        };
    }, []);

    // Main animation and drawing logic in a single useEffect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let lastTime = 0;

        const animate = (time: number) => {
            // Calculate delta time
            const deltaTime = lastTime ? (time - lastTime) / 1000 : 0.016;
            lastTime = time;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#000044');
            gradient.addColorStop(1, '#000022');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars
            const stars = starsRef.current;
            const now = time / 1000; // Current time in seconds for twinkling

            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];

                // Calculate twinkling effect
                const twinkle = Math.sin(now * star.twinkleSpeed) * 0.5 + 0.5;
                const opacity = 0.2 + star.brightness * twinkle * 0.8;

                // Draw star
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Larger stars get a subtle glow
                if (star.size > 1.5) {
                    ctx.fillStyle = `rgba(200, 220, 255, ${opacity * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
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
                ctx.fillStyle = 'rgba(0, 0, 80, 0.5)';
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
            const currentTime = Date.now();
            state.completedWords.forEach(word => {
                const ageMs = currentTime - word.timestamp;
                const opacity = 1.0 - (ageMs / 1000); // Fade out over 1 second

                // Skip if fully faded out
                if (opacity <= 0) return;

                // Animate the completed word - move up slightly with fading
                const offsetY = -20 * (ageMs / 1000); // Move up 20px over 1 second

                // Draw the word with fading opacity
                ctx.font = '18px monospace';
                ctx.fillStyle = `rgba(50, 255, 50, ${opacity})`;
                ctx.fillText(word.text, word.x, word.y + offsetY + 16);

                // Draw score with fading and floating
                ctx.font = '16px monospace';
                ctx.fillStyle = `rgba(255, 255, 50, ${opacity})`;
                ctx.fillText(`+${word.score}`, word.x + ctx.measureText(word.text).width + 10, word.y + offsetY + 16);
            });

            // Continue animation loop
            animationRef.current = requestAnimationFrame(animate);
        };

        // Start animation
        animationRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
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
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="bg-blue-600/80 text-white py-5 px-10 rounded-lg text-3xl font-bold animate-pulse shadow-lg border-2 border-blue-300">
                        LEVEL {level}!
                        <div className="text-lg text-center mt-2">New challenges await!</div>
                    </div>
                </div>
            )}

            {/* Wave up notification */}
            {showWaveUp && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="bg-green-600/80 text-white py-3 px-8 rounded-lg text-2xl font-bold animate-pulse shadow-lg border-2 border-green-300">
                        Wave {wave}
                        <div className="text-sm text-center mt-1">Difficulty increased!</div>
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
