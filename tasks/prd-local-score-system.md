# Product Requirements Document: Local Score System

## Introduction/Overview

This feature implements a local score storage and display system that works independently of authentication. The system will store scores locally in the browser, display them on a dedicated scores page accessible from the start screen, show relevant scores on the game over screen, and ensure proper UI alignment throughout. This addresses the current requirement to have a functional score system while authentication features are temporarily disabled.

## Goals

1. **Implement Local Score Persistence**: Store game scores locally in the browser using localStorage, persisting between sessions
2. **Fix Game Over Screen UI**: Center-align Home and Restart buttons properly on the game over screen
3. **Enable Score Navigation**: Add a "VIEW SCORES" button to the start screen that navigates to the existing scores page
4. **Remove Dummy Data**: Replace placeholder/dummy scores with actual local score data
5. **Highlight Recent Scores**: Visually distinguish the most recent game's score in score displays
6. **Maintain Optional Cloud Sync**: Keep Firebase functionality disabled but ready for future re-enablement

## User Stories

1. **As a player**, I want to see my scores saved locally so that I can track my progress without creating an account
2. **As a player**, I want properly aligned buttons on the game over screen so that the interface looks polished and professional
3. **As a player**, I want to access my score history from the main menu so that I can review my past performance
4. **As a player**, I want to see my current game's rank highlighted in the score list so that I can quickly identify how well I performed
5. **As a player**, I want to see the top 3 scores plus my latest game's ranking on the game over screen so that I have immediate feedback on my performance
6. **As a player**, I want to see "No scores yet" when I haven't played any games so that I understand the current state

## Functional Requirements

### 1. Game Over Screen Button Alignment
1.1. The Home and Restart buttons must be horizontally centered as a pair on the game over screen
1.2. The buttons should maintain their current vertical position
1.3. The button spacing should remain visually appropriate

### 2. Local Score Storage System
2.1. Scores must be saved to localStorage immediately after each game
2.2. The system must store only points and distance for each score entry
2.3. The system must maintain up to 50 scores maximum (remove oldest when limit exceeded)
2.4. Scores must persist between browser sessions
2.5. The system must work without any authentication or Firebase connection

### 3. Score Display on Game Over Screen
3.1. The game over screen must display the top 3 local scores in positions 1, 2, 3
3.2. The current game's score must be displayed in its actual ranking position (e.g., rank 5 if it's the 5th best score)
3.3. The current game's score must be visually highlighted (different color/styling) from stored scores
3.4. If there are no stored scores, display "No previous scores" message
3.5. All dummy/placeholder scores must be removed from the display

### 4. Start Screen Scores Navigation
4.1. The start screen must include a "VIEW SCORES" button
4.2. The button must navigate to the existing ScoresScene
4.3. The button should be positioned appropriately within the current layout
4.4. The button must work without requiring authentication

### 5. Scores Scene Integration
5.1. The ScoresScene must display local scores instead of requiring authentication
5.2. The scene must show "No scores yet" when no local scores exist
5.3. The most recent score (if visible on current page) must be visually highlighted
5.4. Pagination must work correctly with local scores (5 scores per page)
5.5. Ranking numbers must reflect actual global ranking across all stored scores

### 6. Score Data Management
6.1. Each score entry must include: points, distance, timestamp
6.2. Scores must be sorted by points in descending order
6.3. The system must handle storage quota gracefully (clear oldest scores if needed)
6.4. Local scores must be immediately available after saving (no async delays)

## Non-Goals (Out of Scope)

- Online leaderboards or score sharing
- Score comparison with other players
- Advanced score analytics or statistics
- Score export/import functionality
- Multiple difficulty levels or game modes
- Re-enabling Firebase authentication in this implementation
- Backwards compatibility with existing cloud-stored scores
- Score verification or anti-cheat measures

## Design Considerations

### Game Over Screen Layout
- Maintain current button styling and colors
- Ensure responsive design works on different screen sizes
- Keep consistent spacing with other UI elements

### Score Highlighting
- Use a distinct color (e.g., gold/yellow accent) for the latest game's score
- Consider adding a subtle indicator like "← Latest" or different background
- Ensure highlighting is visible across different themes

### Start Screen Integration
- Position the "VIEW SCORES" button to complement existing layout
- Use consistent button styling with other start screen buttons
- Ensure proper spacing and visual hierarchy

## Technical Considerations

### Storage Strategy
- Utilize existing ScoreManager.ts functionality where possible
- Bypass Firebase/authentication checks for local storage operations
- Use localStorage with the existing key structure for consistency

### Scene Integration
- Modify existing ScoresScene to work without authentication
- Update StartScene to include uncommented scores navigation
- Ensure proper scene transitions and navigation flow

### Performance
- Local storage operations should be synchronous for immediate feedback
- Implement efficient score sorting and ranking calculations
- Optimize score display rendering for large score lists

## Success Metrics

1. **UI Improvement**: Game over screen buttons are properly centered and aligned
2. **Score Persistence**: 100% of game scores are successfully saved to localStorage
3. **Navigation Success**: Players can access scores from start screen without errors
4. **Data Accuracy**: Score rankings and displays show correct information
5. **User Experience**: No dummy data visible, proper messaging for empty states
6. **Performance**: Score operations complete within 100ms for immediate feedback

## Open Questions

1. Should we add a "Clear All Scores" option in the scores scene?
2. Should we display additional statistics (average score, total games played) on the scores page?
3. Should we add sound effects or animations when viewing scores?
4. Should we show timestamps for when scores were achieved?
5. Is there a preferred visual treatment for highlighting the latest score?

## Implementation Priority

**Phase 1 (Critical)**:
- Fix game over screen button alignment
- Implement local score storage without authentication
- Enable scores navigation from start screen

**Phase 2 (Important)**:
- Remove dummy scores and implement proper display logic
- Add score highlighting for latest game
- Ensure "no scores" state handling

**Phase 3 (Polish)**:
- Optimize performance and error handling
- Verify responsive design across screen sizes
- Test edge cases and storage limits 