# Product Requirements Document: Top Boundary Collision System

## Introduction/Overview

Currently, the paper plane in the game can fly out of the visible screen area at the top and remain there indefinitely. This creates a poor user experience as players lose visual contact with their plane and may become confused about the game state. This feature will implement a top boundary collision system that prevents the plane from leaving the screen while maintaining game flow by bouncing the plane back into the playable area without ending the game.

**Goal:** Implement a top screen boundary that prevents the paper plane from flying off-screen while providing a smooth, non-punitive bounce-back mechanism.

## Goals

1. Prevent the paper plane from flying beyond the top edge of the screen
2. Implement an immediate bounce-back mechanism when the plane hits the top boundary
3. Maintain existing game flow and mechanics for all other boundaries
4. Ensure the collision system does not negatively impact player experience or score

## User Stories

- **As a player**, I want the plane to stay visible on screen at all times so that I can always see and control my plane's position.
- **As a player**, I want hitting the top boundary to be a neutral event (not game-ending) so that I can continue playing without losing progress.
- **As a player**, I want the plane to bounce back immediately when hitting the top so that the game feels responsive and predictable.

## Functional Requirements

1. **Top Boundary Detection:** The system must detect when the paper plane reaches or exceeds the top edge of the visible screen area.

2. **Immediate Bounce Response:** When the plane hits the top boundary, it must immediately bounce down by 5% of the screen height.

3. **Collision Reset:** After bouncing, the plane must be repositioned to a valid location within the screen boundaries (5% down from the top edge).

4. **Preserved Game State:** The collision with the top boundary must not affect:
   - Current score
   - Game progression
   - Existing power/physics mechanics
   - Ring collection mechanics

5. **Multiple Collision Handling:** The system must handle repeated collisions with the top boundary without any cooldown period or penalties.

6. **Boundary Scope:** The collision system must only apply to the top boundary - existing behavior for bottom, left, and right boundaries must remain unchanged.

7. **Physics Integration:** The bounce mechanism must work seamlessly with the existing physics system without disrupting the plane's normal flight mechanics.

## Non-Goals (Out of Scope)

- Visual effects or animations for the bounce (can be added in future iterations)
- Audio feedback for boundary collisions
- Power loss or temporary control reduction mechanisms
- Collision effects for left, right, or bottom boundaries
- Score penalties or bonuses for hitting the top boundary
- Cooldown periods between boundary collisions
- Particle effects or screen shake
- Collision counters or analytics tracking

## Design Considerations

- The bounce should feel immediate and responsive
- The 5% downward movement should be calculated based on the current screen height to ensure consistency across different devices
- The collision detection should be precise to avoid the plane flickering in and out of the boundary
- Integration should work with the existing `PaperPlane.ts` object and `GameScene.ts`

## Technical Considerations

- Should integrate with the existing physics system in the GameScene
- May require modifications to the `PaperPlane.ts` class to handle boundary detection
- Boundary detection should be performed each frame during the game update loop
- The 5% calculation should use the current screen/game area dimensions
- Consider using Phaser's built-in collision detection or world bounds if applicable

## Success Metrics

- **Functional Success:** Players can no longer fly the plane off the top of the screen
- **User Experience:** Players can hit the top boundary multiple times without game interruption
- **Technical Success:** No performance impact on game framerate or physics
- **Stability:** No edge cases where the plane gets stuck at the boundary

## Open Questions

- Should the bounce distance (5%) be configurable for future adjustments?
- Are there any performance considerations for checking boundary collision every frame?
- Should this feature be toggleable for testing purposes? 