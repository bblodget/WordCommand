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

### Levels
- Game difficulty increases with each level
- Higher levels introduce:
  - More words simultaneously on screen
  - Faster falling words
  - Longer/more complex words
  - Special word types (see below)

### Special Word Types
- Power-up words: When destroyed, grant temporary benefits (slowdown, shield city, etc.)
- Bonus words: Worth extra points, appear briefly and move faster
- Chain words: Connected words that must be typed in sequence

## Scoring System
- Points awarded for each successfully destroyed word
- Bonus points for quick typing speed
- Combo multipliers for destroying multiple words without errors
- End-of-level bonus based on cities remaining and typing accuracy
- WPM (Words Per Minute) tracking that serves as a score multiplier:
  - Higher WPM increases the point value of destroyed words
  - WPM calculation updates in real-time during gameplay
  - Visual feedback shows current WPM and corresponding multiplier

## User Interface

### Game Screen
- Top: Score display, level information
- Center: Main game area where words fall
- Bottom: Cities and cannons, remaining lives

### Statistics Display
- Words per minute (WPM) tracking
- Accuracy percentage
- High score table

### Visuals
- Retro arcade aesthetic inspired by Missile Command
- Modern particle effects for explosions and destroyed words
- Color-coding for different word types

## Technical Requirements
- Web-based implementation
- Compatible with static web hosting (GitHub Pages)
- Responsive design for different screen sizes
- Works on keyboard-equipped devices (desktop/laptop)
- All game assets and logic must be client-side (no server requirements)
- Local storage for saving high scores

## Stretch Goals
- Sound effects and retro background music
- Custom word lists (user-defined practice)
- Difficulty settings (easy, medium, hard)
- Two-player competitive mode
- Touch typing indicators/guides
- Accessibility features for different skill levels
