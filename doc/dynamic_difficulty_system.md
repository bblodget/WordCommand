# Dynamic Difficulty System

This document outlines the design for a dynamic difficulty progression system for the typing game, aimed at keeping players in their "flow state" where the challenge matches their skill level.

## Core Design Principles

- Keep players at their skill edge for maximum engagement
- Reward faster typing with higher scores while maintaining challenge
- Adapt to player performance in real-time
- Provide clear progression through levels

## Adaptive Speed Scaling

- Base falling speed on `currentWPM × scalingFactor`
- Allow players to adjust a "challenge multiplier" (80%-120% of typical ability)
- Implement a "flow state detector" that increases difficulty when player is consistently successful
- Gradually decrease difficulty when multiple mistakes are made

## Progressive Word Complexity


| Level | Word Characteristics | Examples |
|-------|---------------------|----------|
| 1 | 3-4 letter common words | cat, dog, run |
| 2 | 4-5 letter words with common patterns | jump, quick, house |
| 3 | 5-7 letter words with more complex combinations | design, project, machine |
| 4 | Specialized vocabulary, technical terms | algorithm, framework, component |
| 5 | Words with difficult letter combinations | rhythm, queue, through |

## Word List Organization

### Current Structure
Currently, word lists are stored in `src/data` directory with three difficulty levels:
- `easy.json` - Simple, commonly used words
- `medium.json` - Moderately complex words
- `hard.json` - More challenging words

These word lists were originally extracted from the LoveToType GitHub project.

### Proposed Structure
To align with our progressive difficulty system, we will replace the current word lists with level-based lists:

- `level1.json` - 3-4 letter common words with simple letter combinations
- `level2.json` - 4-5 letter words with common spelling patterns
- `level3.json` - 5-7 letter words with more complex combinations
- `level4.json` - Specialized vocabulary and technical terms
- `level5.json` - Words with difficult letter combinations and challenging patterns

### Word Selection Criteria

| Level | Primary Criteria | Secondary Criteria | Source |
|-------|-----------------|-------------------|--------|
| 1 | Length: 3-4 letters | Common in everyday language | Select from `easy.json` |
| 2 | Length: 4-5 letters | Regular spelling patterns | Combine from `easy.json` and `medium.json` |
| 3 | Length: 5-7 letters | Mix of common and less common words | Mostly from `medium.json` |
| 4 | Specialized context | Technical, scientific, or domain-specific | Select from `medium.json` and `hard.json` |
| 5 | Challenging patterns | Contains: th, qu, gh, ph, etc. | Select from `hard.json` |

The existing word lists (easy, medium, hard) will be phased out once the level-based lists are implemented.

### Expanding Word Lists

While we'll start by migrating words from the existing lists, we should significantly expand each level's word pool to increase variety and maintain player engagement:

- **Additional Sources**: Beyond the existing LoveToType word lists, we can incorporate words from:
  - Common word frequency lists
  - Subject-specific vocabularies (for higher levels)
  - Creative writing resources
  - Typing practice texts

- **Target Word Counts**:
  - Level 1: 300-500 words
  - Level 2: 400-600 words
  - Level 3: 500-700 words
  - Level 4: 600-800 words
  - Level 5: 400-600 words

- **Variety Within Levels**: Each level should include multiple subcategories to ensure diverse typing experiences while maintaining consistent difficulty:
  - For example, Level 3 might include sections for common verbs, nouns, adjectives, and topic-based words
  - This prevents players from encountering too many similar words in succession

## Wave-Based Progression

- Each level consists of 3-5 waves with fixed word counts (20-30 words per wave)
- Short breather between waves (3-5 seconds)
- Final wave in each level features a "boss wave" with rapid-fire words
- Advance to next level after completing all waves
- Option to replay levels at increased difficulty for higher score multipliers

## Multi-dimensional Scoring

- **Base score**: words completed × word length × 10
- **WPM multiplier**: (current WPM / baseline WPM) capped at 3.0x
- **Accuracy bonus**: perfect typing streaks give exponential bonuses (1.1^consecutiveSuccesses)
- **Survival bonus**: additional points based on cities alive ((citiesAlive / 6) × 1.5)

## Challenge Mechanics

- **Heat-up mode**: If player clears words too easily, automatically increase spawn rate
  - Threshold: 4 consecutive successful words
  - Intensity: Increase difficulty by 10% (maximum cap of 1.5×)
- **Cool-down mode**: If multiple cities are destroyed, slightly reduce difficulty
  - Threshold: 4 consecutive mistakes
  - Intensity: Decrease difficulty by 15% (minimum floor of 0.7×)
- **Rush periods**: Temporary speed increases with higher score multipliers
- **Special words**: Keywords that require alternate typing patterns (SHIFT, function keys)

## Implementation Example

```typescript
// Constants
const CONSECUTIVE_SUCCESS_THRESHOLD = 4;
const CONSECUTIVE_FAILURE_THRESHOLD = 4;
const HEAT_UP_FACTOR = 1.1;  // 10% increase
const COOL_DOWN_FACTOR = 0.85; // 15% decrease

// Calculate spawn rate (in Hz - words per second)
const calculateSpawnRate = (state) => {
  const baseRate = 0.5; // 1 word every 2 seconds at baseline
  const wpmFactor = Math.max(1, state.currentWPM / 40);
  const levelFactor = 1 + (state.level * 0.1);
  
  // Higher value = more words per second
  return baseRate * wpmFactor * levelFactor * state.difficultyMultiplier * state.challengeMultiplier;
};

// Calculate word falling speed
const calculateWordSpeed = (state) => {
  const baseSpeed = 0.05;
  const wpmFactor = Math.max(1, state.currentWPM / 40);
  const levelFactor = 1 + (state.level * 0.15);
  
  return baseSpeed * wpmFactor * levelFactor * state.difficultyMultiplier;
};

// Calculate score for a completed word
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

## UI Feedback

- Display current level and wave prominently
- Show difficulty adjustment controls (for manual tweaking)
- Provide visual feedback when difficulty increases/decreases
- Color-code words based on difficulty level

## Player Progression

- Save player's highest achieved WPM as a baseline
- Unlock new word sets and visual themes as player advances
- Track statistics over time to show improvement
- Optional: global leaderboard for comparing scores 