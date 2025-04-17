# Word Command - Technical Specifications

## 1. Word List and Language Support
- **Source**: Word lists will be sourced from the LoveToType project (https://github.com/bblodget/LoveToType), which provides words categorized by difficulty levels.  Just use the word lists that are a..z characters.  We don't need to test symbols or numbers.
- **Word Types**: Will include both regular and nonsense words for varied practice
- **Language**: English-only support for the initial version
- **Implementation**: Words will be stored in JSON format with properties for difficulty, length, and type

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
  - Basic falling word mechanics
  - Character projectile system
  - City destruction system
  - Level progression with increasing difficulty
  - WPM tracking as a score multiplier
  - Basic visual and sound effects
  - High score storage

- **Stretch Goals** (in priority order):
  1. Bonus words (worth extra points, appear briefly)
  2. Power-up words (temporary benefits like slowdown or city shields)
  3. Chain words (connected words that must be typed in sequence)
  4. Sound effects and background music
  5. Custom word lists
  6. Difficulty settings

## 5. Hosting and Deployment
- **Hosting Platform**: GitHub Pages for static site hosting
- **CI/CD**: GitHub Actions workflow for automatic deployment when changes are pushed to the main branch
- **Testing**: Basic Jest tests for core game logic functions

## 6. Performance Considerations
- **Target Devices**: Desktop and laptop computers with physical keyboards
- **Optimization**: Canvas rendering optimization for smooth animations
- **Storage**: Use of localStorage for saving high scores and game settings
- **Offline Support**: Service worker implementation for offline play capability

## 7. Development Approach
- **Version Control**: Git with GitHub repository
- **Coding Standards**: ESLint and Prettier for code formatting
- **Documentation**: JSDoc for function documentation
- **Project Structure**: Component-based architecture with separation of game logic and rendering
