import React, { useContext, useRef, useEffect, useState } from 'react';
import { GameContext } from '../context/GameContext';
import { Word, City } from '../types/game';

// Add a star field state
interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    twinkleSpeed: number;
    twinkleDirection: 1 | -1;
}

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { state, dispatch } = useContext(GameContext);
    const { words, cities, gameOver, level, wave } = state;

    // State to track level/wave changes for notifications
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showWaveUp, setShowWaveUp] = useState(false);
    const [prevLevel, setPrevLevel] = useState(level);
    const [prevWave, setPrevWave] = useState(wave);

    // Create a star field
    const [stars, setStars] = useState<Star[]>([]);
    const [lastFrameTime, setLastFrameTime] = useState(0);

    // Initialize star field
    useEffect(() => {
        // Create 100 stars
        const newStars: Star[] = [];
        const canvas = canvasRef.current;
        if (canvas) {
            const width = canvas.width;
            const height = canvas.height;

            for (let i = 0; i < 100; i++) {
                newStars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 0.5, // 0.5 - 2.5 size
                    opacity: Math.random() * 0.8 + 0.2, // 0.2 - 1.0 opacity
                    twinkleSpeed: Math.random() * 0.6 + 0.2, // 0.2 - 0.8 speed
                    twinkleDirection: Math.random() > 0.5 ? 1 : -1
                });
            }
            setStars(newStars);
        }
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

    // Drawing logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animationFrame = () => {
            // Calculate delta time for smooth animation
            const now = performance.now();
            const deltaTime = (now - lastFrameTime) / 1000; // in seconds
            setLastFrameTime(now);

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background with subtle gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#000033');
            gradient.addColorStop(1, '#000022');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars with twinkling effect
            setStars(prevStars => {
                return prevStars.map(star => {
                    // Calculate new opacity based on twinkling
                    let newOpacity = star.opacity + (star.twinkleSpeed * star.twinkleDirection * deltaTime);

                    // Reverse direction if reaching min/max
                    let newDirection = star.twinkleDirection;
                    if (newOpacity >= 1) {
                        newOpacity = 1;
                        newDirection = -1;
                    } else if (newOpacity <= 0.2) {
                        newOpacity = 0.2;
                        newDirection = 1;
                    }

                    // Draw the star
                    ctx.fillStyle = `rgba(255, 255, 255, ${newOpacity})`;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                    ctx.fill();

                    // Return updated star
                    return {
                        ...star,
                        opacity: newOpacity,
                        twinkleDirection: newDirection as 1 | -1
                    };
                });
            });

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

            // Request next frame
            requestAnimationFrame(animationFrame);
        };

        // Start animation
        const animationId = requestAnimationFrame(animationFrame);

        // Cleanup
        return () => cancelAnimationFrame(animationId);
    }, [lastFrameTime]);

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
