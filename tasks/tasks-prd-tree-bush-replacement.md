## Relevant Files

- `src/scenes/BootScene.ts` - Modified to load tree and bush sprites, includes fallback texture generation
- `src/scenes/GameScene.ts` - Modified addGroundDecorations() with sprite-based tree/bush system
- `public/assets/sprites/tree1.png` - New asset file for first tree sprite (425x663)
- `public/assets/sprites/tree2.png` - New asset file for second tree sprite (490x625) 
- `public/assets/sprites/bush.png` - New asset file for bush sprite (342x217)
- `check-assets.js` - Updated to include tree and bush asset validation

### Notes

- Tree and bush assets should be placed in `public/assets/sprites/` directory following existing conventions
- The current procedural tree generation in `addGroundDecorations()` will be completely replaced
- Fallback generation should follow existing patterns used for other sprites in BootScene
- Asset scaling will be important given the large original dimensions (400+ pixels)

## Tasks

- [x] 1.0 Asset Setup and Loading System
  - [x] 1.1 Add tree1, tree2, and bush image loading calls to BootScene.ts
  - [x] 1.2 Update check-assets.js to include new tree and bush assets
  - [x] 1.3 Verify asset loading with proper error handling
- [x] 2.0 Fallback Asset Generation
  - [x] 2.1 Create fallback tree texture generation method
  - [x] 2.2 Create fallback bush texture generation method
  - [x] 2.3 Integrate fallback textures into existing system
- [x] 3.0 Ground Decoration System Replacement
  - [x] 3.1 Analyze current procedural tree generation in addGroundDecorations()
  - [x] 3.2 Replace tree generation with sprite-based system
  - [x] 3.3 Add bush spawning logic as new decoration type
- [x] 4.0 Asset Integration and Randomization
  - [x] 4.1 Implement proper scaling for large tree assets (425x663, 490x625)
  - [x] 4.2 Implement bush scaling and positioning (342x217)
  - [x] 4.3 Add randomization between tree1 and tree2 sprites
  - [x] 4.4 Balance spawn probabilities for trees and bushes
- [x] 5.0 Testing and Performance Optimization
  - [x] 5.1 Test asset loading with and without image files
  - [x] 5.2 Verify visual appearance and scaling in game
  - [x] 5.3 Test performance impact and optimize if needed 