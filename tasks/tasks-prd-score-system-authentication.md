## Relevant Files

- `src/scenes/StartScene.ts` - ✅ Main start screen scene with authentication-aware navigation
- `src/scenes/LoginScene.ts` - Login/registration screen with Firebase integration
- `src/systems/ScoreManager.ts` - ✅ Core score management with local storage and ranking logic
- `src/systems/AuthManager.ts` - ✅ Authentication state management and Firebase integration
- `src/ui/Button.ts` - ✅ Reusable button component for consistent UI styling
- `src/ui/ScoreTable.ts` - ✅ Score display component for formatted score lists
- `src/scenes/ScoresScene.ts` - ✅ Dedicated scores viewing screen (navigation updated)
- `src/scenes/GameScene.ts` - Enhanced game scene with improved game over flow
- `src/scenes/BootScene.ts` - ✅ Updated to start with StartScene
- `src/main.ts` - ✅ Updated game initialization to include all scenes
- `package.json` - Updated dependencies for Firebase integration

### Notes

- All new scenes follow the existing pattern of game background with transparent overlay
- Score management prioritizes local storage with Firebase sync as enhancement
- Authentication uses Firebase Auth with guest account support
- UI components maintain consistency with existing DesignTokens.ts color scheme

## Tasks

- [x] 1.0 Create Start Screen and Navigation System
  - [x] 1.1 Create StartScene.ts with branded title and game background
  - [x] 1.2 Implement authentication-aware button layout (Start Game, Login/View Scores/Logout)
  - [x] 1.3 Add scene navigation logic to appropriate screens
  - [x] 1.4 Update main.ts to initialize with StartScene instead of GameScene
  - [x] 1.5 Style start screen with consistent visual design

- [x] 2.0 Implement Local Score Management System  
  - [x] 2.1 Create ScoreManager.ts for local score storage and retrieval
  - [x] 2.2 Implement score ranking and statistics calculation
  - [x] 2.3 Add session-based guest score tracking
  - [x] 2.4 Integrate score saving into GameScene.ts game over flow
  - [x] 2.5 Create score validation and data integrity checks

- [x] 3.0 Enhance Game Over Screen with Score Display
  - [x] 3.1 Create ScoreTable.ts component for formatted score display
  - [x] 3.2 Modify GameScene.ts to show top 3 personal scores
  - [x] 3.3 Add personal ranking display for current game
  - [x] 3.4 Implement authentication-aware game over UI (Login button for guests)
  - [x] 3.5 Add "HOME" button navigation to StartScene

- [ ] 4.0 Create Scores View Screen (ScoresScene)
  - [ ] 4.1 Create ScoresScene.ts with game background and overlay
  - [ ] 4.2 Implement comprehensive score table with all user scores
  - [ ] 4.3 Add personal statistics display (games played, average, personal best)
  - [ ] 4.4 Create navigation back to StartScene
  - [ ] 4.5 Add authentication requirement and error handling

- [ ] 5.0 Integrate Authentication System and Firebase
  - [ ] 5.1 Create AuthManager.ts for authentication state management
  - [ ] 5.2 Create LoginScene.ts for login/registration interface  
  - [ ] 5.3 Set up Firebase Authentication configuration
  - [ ] 5.4 Implement guest account creation and upgrade flow
  - [ ] 5.5 Add Firebase Firestore for cloud score storage
  - [ ] 5.6 Implement offline/online score synchronization
  - [ ] 5.7 Add score transfer from local to Firebase when user creates account 