## Relevant Files

- `src/scenes/GameScene.ts` - Contains the game over screen UI implementation with the unwanted text and duplicate score saving calls.
- `src/systems/ScoreManager.ts` - Contains score saving logic that's being called multiple times, causing duplicates.

### Notes

- The game over screen shows a status message that needs to be removed
- Both `saveSyncScore` and `saveScore` are being called for the same game, causing duplicate entries
- `saveSyncScore` internally calls `saveScore`, so calling both creates two entries

## Tasks

- [x] 1.0 Remove unwanted status message from game over screen
  - [x] 1.1 Locate the `createAuthAwareUI` method in GameScene.ts that displays status messages
  - [x] 1.2 Remove or modify the status message logic to eliminate the "Create account to save scores online" text
  - [x] 1.3 Test the game over screen to ensure the unwanted text no longer appears
- [x] 2.0 Fix duplicate score entries issue
  - [x] 2.1 Identify where both `saveSyncScore` and `saveScore` are being called in the same game session
  - [x] 2.2 Remove the redundant `saveSyncScore` call that's causing the duplicate entry
  - [x] 2.3 Ensure only one score saving method is used per game
  - [x] 2.4 Test the score saving functionality to verify no duplicate entries are created
- [x] 3.0 Verify and test the fixes
  - [x] 3.1 Play a complete game and verify the game over screen no longer shows the unwanted text
  - [x] 3.2 Check the scores menu to ensure only one entry is created per game
  - [x] 3.3 Test multiple games to ensure the fixes work consistently 