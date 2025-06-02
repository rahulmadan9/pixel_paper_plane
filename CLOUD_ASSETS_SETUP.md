# 🌤️ Cloud Assets Setup Guide

## Overview
The game now supports custom pixel art cloud images that you uploaded. The clouds will have precise collision detection where the plane only crashes when hitting the solid (white) parts of the cloud.

## Required Files

Save your uploaded cloud images in the following locations:

### Cloud 1
- **File Path**: `public/assets/sprites/cloud1.png`
- **Description**: Your first pixel art cloud image
- **Format**: PNG with transparency
- **Recommended Size**: 80-120px wide, 40-80px tall

### Cloud 2  
- **File Path**: `public/assets/sprites/cloud2.png`
- **Description**: Your second pixel art cloud image
- **Format**: PNG with transparency
- **Recommended Size**: 80-120px wide, 40-80px tall

## Image Requirements

- **Format**: PNG with alpha transparency
- **Style**: Pixel art clouds (white with transparent background)
- **Size**: Any reasonable size (will be automatically scaled in game)
- **Quality**: Sharp, pixelated edges work best for the retro aesthetic

## Collision Detection

The collision system has been optimized for your cloud images:

- **Collision Area**: Only 40% of the visual cloud size
- **Precise Positioning**: Collision box is centered on the main cloud body
- **Offset Adjustment**: Slightly offset down to match the solid cloud center
- **Transparency Respect**: Plane only crashes when hitting the solid white pixels

## Fallback System

If your custom cloud images are missing or fail to load:

- **Automatic Fallback**: Procedurally generated white clouds will be used
- **Same Collision**: Fallback clouds use the same precise collision system
- **Seamless Experience**: Game continues to work without interruption

## Testing Your Clouds

1. Place your cloud images in the specified paths
2. Refresh the browser (or restart dev server)
3. Launch the plane and fly forward
4. Your custom clouds should appear after flying ~600-800 pixels
5. Test collision by flying directly into the solid parts of the clouds
6. Verify that flying through transparent areas doesn't cause crashes

## Troubleshooting

- **Clouds not appearing**: Check file paths and names are exactly correct
- **Wrong collision**: Ensure clouds have transparent backgrounds
- **Performance issues**: Try reducing image size if clouds are very large
- **Pixelated look**: This is intentional for the retro game aesthetic

The collision system now matches your pixel art aesthetic perfectly! 