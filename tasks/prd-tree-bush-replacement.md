# PRD: Tree and Bush Asset Replacement

## Introduction/Overview

Replace the current procedurally generated trees in the ground decoration system with custom pixel art tree and bush assets. The current system generates simple geometric trees (green circles on brown rectangles) that will be replaced with detailed 2D sprite assets to enhance the visual quality and artistic consistency of the game world.

The goal is to improve the visual appeal of the ground decorations while maintaining the same spawning behavior and performance characteristics as the existing system.

## Goals

1. **Visual Enhancement**: Replace basic procedural trees with high-quality pixel art sprites that match the game's aesthetic
2. **Asset Variety**: Implement variety in ground decorations using 2 different tree sprites and 1 bush sprite
3. **Performance Maintenance**: Ensure the new sprite-based system maintains or improves upon current performance
4. **Seamless Integration**: Replace the existing system without affecting gameplay mechanics or spawn rates
5. **Fallback Reliability**: Provide robust fallback to procedural generation if assets fail to load

## User Stories

- **As a player**, I want to see beautiful, detailed trees and bushes as I fly over the landscape so that the game world feels more immersive and visually appealing
- **As a player**, I want to see variety in the ground decorations so that the landscape doesn't feel repetitive during long flights
- **As a developer**, I want the new tree system to load reliably with proper fallbacks so that the game always displays ground decorations regardless of asset availability
- **As a developer**, I want the asset replacement to maintain existing performance so that the game continues to run smoothly on all devices

## Functional Requirements

1. **Asset Loading System**
   1.1. The system must load 3 new image assets: `tree1.png` (425x663), `tree2.png` (490x625), and `bush.png` (342x217)
   1.2. Assets must be loaded in the BootScene alongside existing sprites
   1.3. The system must generate fallback textures for each asset type if loading fails

2. **Ground Decoration Replacement**
   2.1. The system must replace the current procedural tree generation in `addGroundDecorations()` method
   2.2. Trees must maintain the existing 30% spawn probability
   2.3. The system must randomly select between tree1 and tree2 sprites when spawning trees
   2.4. Bush sprites must be spawned as a new decoration type with appropriate probability

3. **Asset Scaling and Positioning**
   3.1. Tree and bush sprites must be scaled appropriately to fit the game world proportions
   3.2. Sprites must be positioned correctly relative to the ground level
   3.3. The system must maintain consistent visual proportions with existing ground elements

4. **Variety and Randomization**
   4.1. The system must randomly select between the 2 tree types when spawning trees
   4.2. Bush decorations must be distributed randomly across the landscape
   4.3. The system should vary the horizontal positioning within each ground segment for natural placement

5. **Fallback Generation**
   5.1. If tree assets fail to load, the system must fall back to enhanced procedural tree generation
   5.2. If bush assets fail to load, the system must fall back to procedural bush shapes
   5.3. Fallback assets must visually approximate the intended pixel art style

6. **Performance Optimization**
   6.1. The system must implement appropriate object pooling if needed for performance
   6.2. Tree sprites must be efficiently rendered without impacting frame rate
   6.3. The system must limit concurrent tree sprites based on camera viewport

## Non-Goals (Out of Scope)

- **Animation**: Trees and bushes will remain static (no swaying or wind effects)
- **Collision Detection**: Trees and bushes remain decorative only (no collision with plane)
- **Interactive Elements**: No interactive features like destruction or particle effects
- **Dynamic Seasons**: No seasonal color changes or weather effects
- **Asset Editor**: No in-game tools for modifying tree placement or appearance
- **Multiple Art Styles**: Only the provided pixel art style will be supported

## Design Considerations

- **Asset Location**: Images should be placed in `public/assets/sprites/` directory following existing conventions
- **File Naming**: Use descriptive names: `tree1.png`, `tree2.png`, `bush.png`
- **Visual Consistency**: Sprites already match the existing pixel art aesthetic
- **Scale Relationships**: Trees should appear appropriately sized relative to the paper plane (smaller than original dimensions)
- **Ground Integration**: Sprites should appear naturally placed on the ground surface

## Technical Considerations

- **Asset Integration**: Integrate with existing BootScene asset loading system
- **Sprite Management**: Use Phaser's image system for efficient sprite rendering
- **Fallback System**: Extend existing fallback generation patterns used for other sprites
- **Memory Management**: Consider texture memory usage for larger sprite assets
- **Code Organization**: Modify existing `addGroundDecorations()` method in GameScene.ts
- **Performance**: Original assets are large (400+ pixels), will need appropriate scaling

## Success Metrics

- **Visual Quality**: Game world appears more detailed and visually appealing with custom tree assets
- **Performance Stability**: Frame rate remains stable at 60fps with new sprites
- **Asset Reliability**: Fallback system successfully handles missing assets 100% of the time
- **Loading Performance**: Game loading time increases by no more than 10% with new assets
- **Variety Achievement**: Players observe clear visual variety in ground decorations during gameplay

## Open Questions

1. **Optimal Scaling**: What scale factor should be applied to the large tree assets (425x663, 490x625) to fit appropriately in the game world?
2. **Bush Spawn Rate**: What spawn probability should be used for the new bush decoration type?
3. **Asset Compression**: Should the large tree assets be optimized/compressed before integration?
4. **Layering**: Should trees and bushes be rendered on different depth layers for visual hierarchy?
5. **Distribution Balance**: How should the spawning be balanced between tree1, tree2, and bush to achieve optimal visual variety? 