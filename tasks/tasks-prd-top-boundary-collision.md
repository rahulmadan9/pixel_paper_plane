# Task List: Top Boundary Collision System Implementation

## Relevant Files

- `src/objects/PaperPlane.ts` - **MODIFIED** - Added top boundary collision detection and bounce-back mechanism.
- `src/scenes/GameScene.ts` - Main game scene where collision detection is integrated via the existing update loop.
- `src/main.ts` - Contains game configuration with screen dimensions (1024x576 base).

### Current Plane Movement Mechanics & Physics Integration Documentation

**Physics System Overview:**
- Uses Phaser.Physics.Arcade.Sprite with gravity-based flight mechanics
- Constant forward speed: 200px/s (`forwardSpeed`)
- Downward gravity: 800 units (`setGravityY(800)`)
- Flap force: 350 units upward (`flapForce`)
- World bounds collision: **DISABLED** (`setCollideWorldBounds(false)`)

**Position & Movement Tracking:**
- Position: `this.x`, `this.y` properties (inherited from Phaser.Sprite)
- Velocity: `body.velocity.x`, `body.velocity.y` (Arcade.Body properties)
- Rotation: Dynamic based on vertical velocity (`updateRotation()` method)

**Update Loop Integration:**
- `GameScene.update()` → `updateGameplay()` → `plane.updatePhysics(deltaTime)`
- Plane physics updated every frame when `isLaunched = true`
- Maintains constant X velocity, applies gravity to Y velocity

**Current Collision Systems:**
- Ground collision: `hasCrashed()` method checks `y >= groundLevel`
- Cloud collision: Via `setupCollisions()` with overlap detection
- Ring collection: Via overlap detection with physics groups

**Screen Dimension Access:**
- Scene level: `this.cameras.main.width/height`
- From PaperPlane: `this.scene.cameras.main.height`
- Ground level: `scene.cameras.main.height - 60`

**Integration Points for Top Boundary:**
- **Detection Location**: `updatePhysics()` method in PaperPlane.ts
- **Screen Access**: `(this.scene as any).cameras.main.height`
- **5% Bounce**: `height * 0.05` downward from top edge
- **No Game State Impact**: Boundary collision should not set `hasCrashedFlag`

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `PaperPlane.test.ts` and `GameScene.test.ts` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Analyze Current Codebase and Plane Physics System
  - [x] 1.1 Review PaperPlane.ts to understand current position tracking and physics implementation
  - [x] 1.2 Review GameScene.ts to understand the update loop and existing collision systems
  - [x] 1.3 Identify how screen/viewport dimensions are accessed and calculated
  - [x] 1.4 Document current plane movement mechanics and physics integration
- [x] 2.0 Implement Top Boundary Detection Logic
  - [x] 2.1 Add method to detect when plane y-position reaches or exceeds screen top
  - [x] 2.2 Calculate 5% of screen height for bounce distance
  - [x] 2.3 Implement boundary collision detection logic in PaperPlane class
- [x] 3.0 Implement Bounce-Back Mechanism
  - [x] 3.1 Implement immediate position reset to 5% down from top edge
  - [x] 3.2 Ensure bounce mechanism doesn't interfere with existing physics
  - [x] 3.3 Test bounce positioning accuracy and responsiveness
- [x] 4.0 Integrate Collision System with Game Loop
  - [x] 4.1 Add boundary check to GameScene update loop
  - [x] 4.2 Ensure collision detection runs every frame without performance impact
  - [x] 4.3 Verify integration maintains existing game flow and mechanics
- [x] 5.0 Test and Validate Functionality
  - [x] 5.1 Test multiple boundary hits in rapid succession
  - [x] 5.2 Verify no impact on score, rings, or other game state
  - [x] 5.3 Test functionality across different screen sizes and resolutions
  - [x] 5.4 Verify bottom, left, and right boundaries still work as expected 