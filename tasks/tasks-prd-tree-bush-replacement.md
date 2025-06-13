## Relevant Files

- `src/scenes/BootScene.ts` - Contains asset loading system, needs modification to load tree and bush sprites
- `src/scenes/GameScene.ts` - Contains `addGroundDecorations()` method that needs replacement with sprite-based system
- `public/assets/sprites/tree1.png` - New asset file for first tree sprite (425x663)
- `public/assets/sprites/tree2.png` - New asset file for second tree sprite (490x625) 
- `public/assets/sprites/bush.png` - New asset file for bush sprite (342x217)
- `check-assets.js` - Asset validation script that may need updates for new assets

### Notes

- Tree and bush assets should be placed in `public/assets/sprites/` directory following existing conventions
- The current procedural tree generation in `addGroundDecorations()` will be completely replaced
- Fallback generation should follow existing patterns used for other sprites in BootScene
- Asset scaling will be important given the large original dimensions (400+ pixels)

## Tasks

- [ ] 1.0 Asset Setup and Loading System
- [ ] 2.0 Fallback Asset Generation
- [ ] 3.0 Ground Decoration System Replacement  
- [ ] 4.0 Asset Integration and Randomization
- [ ] 5.0 Testing and Performance Optimization 