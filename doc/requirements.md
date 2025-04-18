# Word Command - Game Requirements

## Game Overview
Word Command is a typing practice game inspired by the classic 1980s arcade game "Missile Command." Players defend their cities by typing words that appear on screen, with each keystroke sending a character projectile toward the falling words.

## Core Gameplay

### Basic Mechanics
- Words fall from the top of the screen toward the bottom at varying speeds
- Players type the words to destroy them before they reach the bottom
- As each character is typed correctly, a "character projectile" fires from the player's cannon toward the word
- When a character hits its target word, that character in the word turns blue
- When the last character of a word is typed, the word explodes
- If a word reaches the bottom of the screen, one "city" is destroyed
- The game ends when all cities are destroyed

### Typing Rules
- Players must type words in the correct sequence of characters
- If a typing error is made, the word resets and must be typed again from the beginning
- If multiple words start with the same characters, both words will be targeted simultaneously
- Players can destroy a shorter word that is a prefix of a longer word, then continue typing to destroy the longer word

## Game Elements

### Cities (Player Bases)
- 6 cities arranged along the bottom of the screen (similar to Missile Command)
- Each city can be destroyed by a single word reaching it
- Game over occurs when all cities are destroyed

### Cannons
- 3 typing cannons positioned between the cities
- Cannons automatically fire characters toward words when the player types
- Visual effects show characters flying from cannons to target words

### Words (Threats)
- Words descend from the top of the screen toward the cities
- Words have different point values based on difficulty (length, complexity)
- Words fall at different speeds and angles

## Game Progression

### Dynamic Difficulty System
- Adaptive speed scaling based on player's WPM
  - Base falling speed adjusts according to player typing speed
  - Challenge multiplier allows players to fine-tune difficulty (80%-120%)
  - "Flow state detector" increases difficulty during successful streaks
  - Difficulty decreases after multiple mistakes

### Progressive Word Complexity
- Level 1: 3-4 letter common words
- Level 2: 4-5 letter words with common patterns
- Level 3: 5-7 letter words with more complex combinations
- Level 4: Specialized vocabulary and technical terms
- Level 5: Words with difficult letter combinations

### Wave-Based Progression
- Each level consists of 3-5 waves with fixed word counts
- Short breathers between waves
- Final wave in each level features a "boss wave" with rapid-fire words
- Advance to next level after completing all waves
- Option to replay levels at increased difficulty for higher score multipliers

### Special Word Types
- Power-up words: When destroyed, grant temporary benefits (slowdown, shield city, etc.)
- Bonus words: Worth extra points, appear briefly and move faster
- Chain words: Connected words that must be typed in sequence

## Scoring System
- Multi-dimensional scoring:
  - Base score: Words completed × word length
  - WPM multiplier: (current WPM / baseline WPM) capped at 3.0x
  - Accuracy bonus: Perfect typing streaks give exponential bonuses
  - Survival time bonus: Additional points for keeping cities alive

## Challenge Mechanics
- Heat-up mode: Automatically increases spawn rate when player is clearing words easily
- Cool-down mode: Slightly reduces difficulty when multiple cities are destroyed
- Rush periods: Temporary speed increases with higher score multipliers
- Special words: Keywords that require alternate typing patterns

## User Interface

### Game Screen
- Top: Score display, level information, current WPM, multiplier
- Center: Main game area where words fall
- Bottom: Cities and cannons, remaining lives

### Statistics Display
- Words per minute (WPM) tracking
- Accuracy percentage
- Current level and wave
- High score table

### Visuals
- Retro arcade aesthetic inspired by Missile Command
- Modern particle effects for explosions and destroyed words
- Color-coding for different word types and difficulty levels

## Technical Requirements
- Web-based implementation
- Compatible with static web hosting (GitHub Pages)
- Responsive design for different screen sizes
- Works on keyboard-equipped devices (desktop/laptop)
- All game assets and logic must be client-side (no server requirements)
- Local storage for saving high scores and player progression

## Stretch Goals
- Sound effects and retro background music
- Custom word lists (user-defined practice)
- Manual difficulty adjustments
- Two-player competitive mode
- Touch typing indicators/guides
- Accessibility features for different skill levels
