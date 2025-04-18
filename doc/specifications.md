# Word Command - Technical Specifications

## 1. Word List and Language Support
- **Source**: Initially sourced from the LoveToType project (https://github.com/bblodget/LoveToType), but will be expanded with additional words that match our level-based criteria.
- **Word Types**: Will include both regular and nonsense words for varied practice
- **Language**: English-only support for the initial version
- **Word Organization**:
  - Words will be organized into 5 difficulty levels (level1.json through level5.json)
  - Each level contains words matching specific length and complexity criteria
  - Target of 300-800 words per level for increased variety
  - Subcategories within levels to ensure diverse typing experiences

## 2. Framework and Tech Stack
- **Frontend Framework**: Game will be built using a modern JavaScript framework (React.js)
- **Language**: TypeScript will be used instead of plain JavaScript for improved type safety, better IDE support, and more maintainable code
- **Game Rendering**: HTML5 Canvas for rendering game elements with custom animation logic
- **CSS Framework**: Tailwind CSS for responsive styling and UI components
- **State Management**: 
  - Start with React's built-in state management (Context API and useReducer) for the MVP
  - Only introduce Redux if/when state complexity requires it, avoiding premature optimization
  - This approach keeps the initial codebase simpler while allowing for scaling as needed
- **Build System**: Vite for fast development and optimized production builds
- **Project Structure**:
  - `/src/components` - React UI components
  - `/src/game` - Core game logic and mechanics
  - `/src/hooks` - Custom React hooks
  - `/src/context` - Context providers and reducers
  - `/src/assets` - Static assets (sprites, sounds)
  - `/src/data` - Word lists and game configuration
  - `/src/utils` - Helper functions and utilities
  - `/src/types` - TypeScript type definitions

## 3. Art and Audio Assets
- **Visual Assets**: 
  - Placeholder sprites will be sourced from open-source/free game asset libraries
  - Retro-styled pixel art for cities, cannons, and explosions
  - Simple particle effects for explosions and destroyed words
- **Audio Assets**:
  - Free sound effects from sources like Freesound.org for typing, explosions, and game events
  - Optional background music with retro arcade feel
- **Asset Management**: All assets will be properly credited and checked for appropriate licensing

## 4. MVP Features vs. Stretch Goals
- **MVP Core Features**:
  - Dynamic difficulty system based on player WPM
  - Progressive word complexity across 5 levels
  - Wave-based progression with boss waves
  - Multi-dimensional scoring system
  - Challenge mechanics (heat-up, cool-down modes)
  - Basic visual and sound effects
  - High score storage

- **Stretch Goals** (in priority order):
  1. Bonus words (worth extra points, appear briefly)
  2. Power-up words (temporary benefits like slowdown or city shields)
  3. Chain words (connected words that must be typed in sequence)
  4. Sound effects and background music
  5. Custom word lists
  6. Manual difficulty adjustments

## 5. Hosting and Deployment
- **Hosting Platform**: GitHub Pages for static site hosting
- **CI/CD**: GitHub Actions workflow for automatic deployment when changes are pushed to the main branch
  - New workflow will be created for GitHub Pages deployment
- **Testing**: Jest tests for core game logic functions
  - Priority testing areas:
    - Word generation and difficulty progression
    - Collision detection between projectiles and words
    - WPM calculation and scoring system
    - Game state management
    - Dynamic difficulty adjustment algorithms
- **Offline Support**: Service worker implementation for offline play capability (after core game is working)

## 6. Performance Considerations
- **Target Devices**: Desktop and laptop computers with physical keyboards
- **Optimization**: Canvas rendering optimization for smooth animations
- **Storage**: Use of localStorage for saving high scores, player progression, and game settings

## 7. Development Approach
- **Version Control**: Git with GitHub repository
- **Coding Standards**: ESLint and Prettier for code formatting
- **Documentation**: JSDoc for function documentation
- **Project Structure**: Component-based architecture with separation of game logic and rendering

## 8. Word Lists and Data Management
- **Source Files**: 
  - Original LoveToType JSON word lists will be reorganized into level-based lists
  - New words will be added to each level to increase variety
  - Target word counts: 300-800 words per level
- **Data Organization**:
  - `/src/data/level1.json` - 3-4 letter common words
  - `/src/data/level2.json` - 4-5 letter words with common patterns
  - `/src/data/level3.json` - 5-7 letter words with more complex combinations
  - `/src/data/level4.json` - Specialized vocabulary and technical terms
  - `/src/data/level5.json` - Words with difficult letter combinations
- **Data Optimization**:
  - Split word lists by level into separate JSON files to load progressively
  - Implement basic lazy loading to fetch higher difficulty words only when needed
  - Target maximum individual JSON file size of ~100KB to balance load times and HTTP requests

## 9. Scoring System
- **Multi-dimensional Scoring**:
  - Base score: Words completed × word length × 10
  - WPM multiplier: (current WPM / baseline WPM) capped at 3.0x
  - Accuracy bonus: Exponential growth based on consecutive correct words (1.1^consecutiveSuccesses)
  - Survival bonus: Scales with cities alive ((citiesAlive / 6) × 1.5)
- **WPM Calculation**: Calculate words per minute based on completed words in a rolling 10-second window, multiplied by 6
- **Accuracy**: Percentage of correctly typed characters vs. total keystrokes
- **High Score Storage**:
  - Store entries as `{name, score, peakWPM, accuracy, level, waves, date}` in localStorage
  - Limit to top 10 scores sorted by total score
  - Allow filtering/sorting by different metrics (WPM, accuracy, level)

## 10. Dynamic Difficulty System Implementation

### GameState Extensions
```typescript
// Extended GameState interface
interface GameState {
  // Existing properties...
  words: Word[];
  cities: City[];
  score: number;
  // etc...
  
  // New properties for dynamic difficulty
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

### Dynamic Parameters
- **Heat-up threshold**: 4 consecutive successful words
- **Cool-down threshold**: 4 consecutive mistakes 
- **Heat-up intensity**: Increase difficulty by 10%
- **Cool-down intensity**: Decrease difficulty by 15%
- **Difficulty multiplier cap**: 1.5 maximum, 0.7 minimum

### Spawn Rate Calculation
```typescript
const calculateSpawnRate = (state) => {
  const baseRate = 0.5; // 1 word every 2 seconds at baseline (in Hz)
  const wpmFactor = Math.max(1, state.currentWPM / 40);
  const levelFactor = 1 + (state.level * 0.1);
  
  // Higher value = more words per second
  return baseRate * wpmFactor * levelFactor * state.difficultyMultiplier * state.challengeMultiplier;
};
```

### Heat-up and Cool-down Implementation
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

### Wave Management
```typescript
const initializeWave = (level, waveNumber) => {
  const isLastWave = waveNumber === getWavesPerLevel(level);
  const wordCount = isLastWave ? 30 : 20; // Boss wave has more words
  const spawnInterval = isLastWave ? 1000 : 1500; // Boss wave spawns faster
  
  return {
    level,
    waveNumber,
    totalWords: wordCount,
    wordsSpawned: 0,
    wordsDestroyed: 0,
    spawnInterval,
    isBossWave: isLastWave
  };
};
```

### Score Calculation
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
