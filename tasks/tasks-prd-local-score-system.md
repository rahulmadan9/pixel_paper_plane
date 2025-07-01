## Relevant Files

- `src/scenes/GameScene.ts` - Contains the game over screen where button alignment needs to be fixed and score display logic is implemented
- `src/scenes/StartScene.ts` - Main menu scene where the "VIEW SCORES" button needs to be added and uncommented
- `src/scenes/ScoresScene.ts` - Existing scores display scene that needs to work without authentication and show local scores
- `src/systems/ScoreManager.ts` - Core score management system that needs modifications to work purely with local storage
- `src/ui/ScoreTable.ts` - Score table component that handles individual score row display and needs highlighting for recent scores

### Notes

- The existing ScoreManager already has local storage functionality but is mixed with Firebase/authentication logic
- StartScene has commented-out "VIEW SCORES" button functionality that can be restored
- ScoresScene is currently designed to work with authentication but needs to be modified for local-only operation
- Game over screen button positioning uses manual calculations that need adjustment for proper centering

## Tasks

- [x] 1.0 Fix Game Over Screen Button Alignment
  - [x] 1.1 Analyze current button positioning logic in GameScene.ts createGameOverButtons method
  - [x] 1.2 Calculate proper center positioning for Home and Restart buttons as a pair
  - [x] 1.3 Update button positioning to center them horizontally while maintaining vertical position
  - [x] 1.4 Test button alignment on different screen sizes to ensure responsive behavior

- [x] 2.0 Implement Local Score Storage Without Authentication  
  - [x] 2.1 Modify ScoreManager.saveScore method to work without Firebase/authentication checks
  - [x] 2.2 Update ScoreManager.getAllScores to return local scores without authentication requirements
  - [x] 2.3 Ensure local score storage persists between browser sessions
  - [x] 2.4 Implement score limit of 50 with oldest score removal when limit exceeded
  - [x] 2.5 Test local storage functionality works without any authentication or Firebase connection

- [x] 3.0 Enable Score Navigation from Start Screen
  - [x] 3.1 Uncomment and restore "VIEW SCORES" button in StartScene.ts createButtons method
  - [x] 3.2 Remove authentication checks from showScores method in StartScene.ts
  - [x] 3.3 Position VIEW SCORES button appropriately in the start screen layout
  - [x] 3.4 Test navigation from start screen to scores scene works without authentication

- [x] 4.0 Update Score Display Logic for Local Storage
  - [x] 4.1 Modify ScoresScene.ts to load local scores instead of requiring authentication
  - [x] 4.2 Update ScoresScene to handle empty state with "No scores yet" message
  - [x] 4.3 Ensure pagination works correctly with local scores (5 scores per page)
  - [x] 4.4 Fix ranking numbers to reflect actual global ranking across all stored scores
  - [x] 4.5 Test ScoresScene functionality with various local score scenarios

- [x] 5.0 Add Score Highlighting and Remove Dummy Data
  - [x] 5.1 Remove all dummy/placeholder scores from game over screen display
  - [x] 5.2 Implement visual highlighting for the most recent game's score on game over screen
  - [x] 5.3 Add highlighting for recent score in ScoreTable component when visible
  - [x] 5.4 Update game over screen to show top 3 scores plus current game's rank
  - [x] 5.5 Test highlighting and score display logic with various score scenarios 