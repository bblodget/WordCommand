# Dynamic Difficulty System - Implementation Guide

This document provides specific implementation details and parameters for the Word Command dynamic difficulty system.

## 1. Word Lists & Level Organization

### Migration Strategy
- Transform existing `easy.json`, `medium.json`, and `hard.json` pools into five separate `level1.json` through `level5.json` files
- Implement this transformation before building the core difficulty engine
- Filter existing words according to the criteria defined in the dynamic difficulty system document

### Source Lists for Advanced Levels

**Level 4 (Specialized Vocabulary)**:
- Academic Word List (AWL)
- Domain-specific glossaries (programming, science, business)
- SAT/GRE vocabulary lists
- Wikipedia technical terminology extractions

**Level 5 (Difficult Patterns)**:
- English spelling bee word lists
- Words with silent letters (psychology, knead, pneumonia)
- Words with unusual letter combinations (rhythm, queue, yacht)
- Commonly misspelled words lists
- Words with doubled letters or diphthongs

## 2. GameState Extensions

Add the following properties to GameState:

```typescript
// Add to GameState interface
interface GameState {
  // Existing properties...
  
  // New properties
  level: number;              // Current level (1-5)
  wave: number;               // Current wave within level
  consecutiveSuccesses: number; // Count of correctly typed words in a row
  consecutiveFailures: number;  // Count of mistakes in a row
  baselineWPM: number;        // Player's baseline typing speed
  flowState: 'struggling' | 'normal' | 'in-flow'; // Current flow state
  difficultyMultiplier: number; // Current difficulty multiplier
  challengeMultiplier: number;  // Player-adjusted challenge level (0.8-1.2)
}
```

### Initial Values
- `level`: 1
- `wave`: 1
- `consecutiveSuccesses`: 0
- `consecutiveFailures`: 0
- `baselineWPM`: Load from localStorage if available, otherwise use 40
- `flowState`: 'normal'
- `difficultyMultiplier`: 1.0
- `challengeMultiplier`: 1.0

### Baseline WPM Storage
- Store in localStorage as `wordCommand_baselineWPM`
- Update only when player achieves a higher WPM than their previous baseline
- Example implementation:

```typescript
// At game end
const updateBaselineWPM = (currentWPM: number) => {
  const storedWPM = localStorage.getItem('wordCommand_baselineWPM');
  const baselineWPM = storedWPM ? parseFloat(storedWPM) : 40;
  
  if (currentWPM > baselineWPM) {
    localStorage.setItem('wordCommand_baselineWPM', currentWPM.toString());
    return currentWPM;
  }
  
  return baselineWPM;
};
```

## 3. Dynamic Parameters

### Spawn Rate Calculation
- Use Hz (words per second) for spawn rate
- Formula adjusted to reflect words per second:

```typescript
const calculateSpawnRate = (state) => {
  const baseRate = 0.5; // 1 word every 2 seconds at baseline
  const wpmFactor = Math.max(1, state.currentWPM / 40);
  const levelFactor = 1 + (state.level * 0.1);
  
  // Higher value = more words per second
  return baseRate * wpmFactor * levelFactor * state.difficultyMultiplier * state.challengeMultiplier;
};
```

### Heat-up and Cool-down Parameters
- **Heat-up threshold**: 4 consecutive successful words
- **Cool-down threshold**: 4 consecutive mistakes
- **Heat-up intensity**: Increase difficulty by 10%
- **Cool-down intensity**: Decrease difficulty by 15%

```typescript
// Constants
const CONSECUTIVE_SUCCESS_THRESHOLD = 4;
const CONSECUTIVE_FAILURE_THRESHOLD = 4;
const HEAT_UP_FACTOR = 1.1;  // 10% increase
const COOL_DOWN_FACTOR = 0.85; // 15% decrease

// In reducer
case 'TYPE_CHAR': {
  // Existing type char logic...
  
  // Track consecutive successes/failures
  let consecutiveSuccesses = correct ? state.consecutiveSuccesses + 1 : 0;
  let consecutiveFailures = correct ? 0 : state.consecutiveFailures + 1;
  let difficultyMultiplier = state.difficultyMultiplier;
  
  // Apply heat-up
  if (consecutiveSuccesses >= CONSECUTIVE_SUCCESS_THRESHOLD) {
    difficultyMultiplier = Math.min(1.5, difficultyMultiplier * HEAT_UP_FACTOR);
    consecutiveSuccesses = 0; // Reset counter after applying
  }
  
  // Apply cool-down
  if (consecutiveFailures >= CONSECUTIVE_FAILURE_THRESHOLD) {
    difficultyMultiplier = Math.max(0.7, difficultyMultiplier * COOL_DOWN_FACTOR);
    consecutiveFailures = 0; // Reset counter after applying
  }
  
  return {
    ...state,
    // Other updated properties...
    consecutiveSuccesses,
    consecutiveFailures,
    difficultyMultiplier
  };
}
```

## 4. UI & Controls

### Challenge Multiplier
- Add to HUD as a slider with range 0.8-1.2 (80%-120%)
- Update UI to display current value
- Implement in the form:

```tsx
// HUD component (simplified)
const HUD = () => {
  const { state, dispatch } = useContext(GameContext);
  
  const handleChallengeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    dispatch({ type: 'SET_CHALLENGE_MULTIPLIER', payload: value });
  };
  
  return (
    <div className="hud">
      {/* Other HUD elements */}
      
      <div className="challenge-control">
        <label>Challenge: {Math.round(state.challengeMultiplier * 100)}%</label>
        <input
          type="range"
          min="0.8"
          max="1.2"
          step="0.05"
          value={state.challengeMultiplier}
          onChange={handleChallengeChange}
        />
      </div>
    </div>
  );
};
```

### Level-Wave Display
- Add "Level X - Wave Y" display to the top of the HUD
- Include visual indication for boss waves
- Example implementation:

```tsx
<div className="level-display">
  <span className="level">Level {state.level}</span>
  <span className="wave">Wave {state.wave}</span>
  {isBossWave && <span className="boss-indicator">BOSS WAVE</span>}
</div>
```

## 5. Scoring System

### Complete Formula

```typescript
const calculateWordScore = (word, state) => {
  // Base score: word length * 10
  const baseScore = word.length * 10;
  
  // WPM multiplier: current WPM / baseline WPM (capped at 3.0x)
  const wpmMultiplier = Math.min(3.0, state.currentWPM / state.baselineWPM);
  
  // Accuracy bonus: exponential growth based on consecutive correct words
  const accuracyBonus = Math.pow(1.1, state.consecutiveSuccesses);
  
  // Survival bonus: scales with number of cities alive
  const citiesAlive = state.cities.filter(c => c.alive).length;
  const survivalBonus = (citiesAlive / 6) * 1.5; // Max 1.5x when all cities alive
  
  // Final score calculation
  return Math.round(baseScore * wpmMultiplier * accuracyBonus * survivalBonus);
};
```

### Score Display
- Update score display to show:
  - Current score
  - WPM multiplier (e.g., "2.1x")
  - Streak counter when applicable
  - Cities remaining 