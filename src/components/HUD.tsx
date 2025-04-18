import React, { useContext, useEffect, useState } from 'react';
import { GameContext } from '../context/GameContext';

// Constants for wave/level progression (must match GameContext)
const WORDS_PER_WAVE = 10;

const HUD: React.FC = () => {
    const { state, dispatch } = useContext(GameContext);
    const {
        score,
        totalKeystrokes,
        correctKeystrokes,
        typedTimestamps,
        cities,
        consecutiveSuccesses,
        baselineWPM,
        difficultyMultiplier,
        wordsCompletedInWave
    } = state;
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

    // Calculate multipliers for display
    const wpmMultiplier = Math.min(3.0, wpm / baselineWPM);
    const accuracyBonus = Math.pow(1.1, consecutiveSuccesses);
    const survivalBonus = (citiesRemaining / 6) * 1.5;

    return (
        <div className="absolute top-2 left-2 text-white font-mono space-y-2 z-10">
            <div className="font-bold">
                Level {state.level} - Wave {state.wave}
                <div className="w-full bg-gray-700 h-3 mt-1 rounded overflow-hidden">
                    <div
                        className="bg-blue-500 h-3 rounded relative transition-all duration-300"
                        style={{ width: `${(wordsCompletedInWave / WORDS_PER_WAVE) * 100}%` }}
                    >
                        {wordsCompletedInWave > 0 && (
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                                {wordsCompletedInWave}/{WORDS_PER_WAVE}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-xs text-right">{WORDS_PER_WAVE - wordsCompletedInWave} words to next wave</div>
            </div>
            <div>Score: {score}</div>
            <div>WPM: {wpm}</div>
            <div>Accuracy: {accuracy}%</div>
            <div>Cities: {citiesRemaining}/6</div>

            {/* Multipliers section */}
            <div className="mt-4 border-t border-white/30 pt-2">
                <div className="text-xs text-white/70">Multipliers</div>
                <div>Speed: {wpmMultiplier.toFixed(1)}x</div>
                {consecutiveSuccesses > 0 && (
                    <div>Streak: {accuracyBonus.toFixed(2)}x ({consecutiveSuccesses})</div>
                )}
                <div>Survival: {survivalBonus.toFixed(1)}x</div>
                <div>Difficulty: {difficultyMultiplier.toFixed(1)}x</div>
            </div>

            <div className="mt-2">
                <label className="mr-2">
                    Challenge: {Math.round(state.challengeMultiplier * 100)}%
                </label>
                <input
                    type="range"
                    min={0.8}
                    max={1.2}
                    step={0.05}
                    value={state.challengeMultiplier}
                    onChange={e =>
                        dispatch({
                            type: 'SET_CHALLENGE_MULTIPLIER',
                            payload: parseFloat(e.currentTarget.value),
                        })
                    }
                />
            </div>
        </div>
    );
};

export default HUD;