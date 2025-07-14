# Asset Glitching Fix - Testing Strategy

## Overview
This document outlines the multi-staged testing approach to fix the recurring asset glitching issue in the Pixel Paper Plane game.

## Problem Analysis
The game was experiencing asset glitching between games, affecting:
- Paper plane sprites
- Tree and bush decorations
- Ring collectibles
- Cloud obstacles

## Root Cause Hypotheses
1. **Infinite ground decoration accumulation** (most likely)
2. **Ring/cloud objects not cleaned up off-screen**
3. **Background graphics accumulation**
4. **Improper scene cleanup causing state leakage**
5. **Page reload workaround masking deeper issues**

## Testing Strategy

### Phase 1: Baseline Testing
**Configuration**: `BASELINE` (all fixes disabled)
**Purpose**: Confirm the issue exists and establish baseline metrics

**Steps**:
1. Load the game
2. Play 3-5 games consecutively
3. Monitor console for asset count warnings
4. Note any visual glitches or performance issues
5. Record maximum asset counts reached

**Expected Results**:
- Asset counts should grow without bound
- Ground decorations should exceed 500+
- Visual glitches should occur
- Performance should degrade

### Phase 2: Stage 1 - Ground Decoration Cleanup
**Configuration**: `STAGE_1_GROUND_CLEANUP`
**Purpose**: Test if ground decoration cleanup fixes the main issue

**Steps**:
1. Switch configuration: `window.assetTest.setStage('STAGE_1_GROUND_CLEANUP')`
2. Play 3-5 games consecutively
3. Monitor console for cleanup messages
4. Check if asset counts stabilize
5. Note any remaining issues

**Expected Results**:
- Ground decoration count should stabilize under 500
- Console should show \"Cleaned up X ground decorations\" messages
- Visual glitches should be reduced or eliminated
- Performance should remain stable

### Phase 3: Stage 2 - Game Object Cleanup
**Configuration**: `STAGE_2_GAME_OBJECTS`
**Purpose**: Test if ring/cloud cleanup is also needed

**Steps**:
1. Switch configuration: `window.assetTest.setStage('STAGE_2_GAME_OBJECTS')`
2. Play 3-5 games consecutively
3. Monitor ring and cloud cleanup messages
4. Check for further improvements

**Expected Results**:
- Ring and cloud counts should stabilize
- Further reduction in glitches (if any remained)
- Improved overall performance

### Phase 4: Stage 3 - Background Cleanup
**Configuration**: `STAGE_3_BACKGROUND`
**Purpose**: Test if background graphics cleanup helps

**Steps**:
1. Switch configuration: `window.assetTest.setStage('STAGE_3_BACKGROUND')`
2. Play 3-5 games consecutively
3. Monitor background section cleanup
4. Check memory usage stability

**Expected Results**:
- Background section count should stabilize
- Memory usage should remain constant
- No background rendering issues

### Phase 5: Stage 4 - Scene Cleanup
**Configuration**: `STAGE_4_SCENE_CLEANUP`
**Purpose**: Test if scene cleanup prevents state leakage

**Steps**:
1. Switch configuration: `window.assetTest.setStage('STAGE_4_SCENE_CLEANUP')`
2. Test game restarts and scene transitions
3. Monitor scene cleanup messages
4. Check for state leakage between games

**Expected Results**:
- Clean scene transitions
- No state leakage between games
- Proper asset counter resets

### Phase 6: Stage 5 - Complete Fix Package
**Configuration**: `STAGE_5_COMPLETE`
**Purpose**: Test complete fix package including proper restart

**Steps**:
1. Switch configuration: `window.assetTest.setStage('STAGE_5_COMPLETE')`
2. Test all game functions extensively
3. Use R key restart instead of page reload
4. Verify all fixes work together

**Expected Results**:
- No asset glitching issues
- Stable performance over multiple games
- Proper restart without page reload
- All asset counts remain reasonable

## Console Commands

### Configuration Switching
```javascript
// Switch to different test stages
window.assetTest.setStage('BASELINE')
window.assetTest.setStage('STAGE_1_GROUND_CLEANUP')
window.assetTest.setStage('STAGE_2_GAME_OBJECTS')
window.assetTest.setStage('STAGE_3_BACKGROUND')
window.assetTest.setStage('STAGE_4_SCENE_CLEANUP')
window.assetTest.setStage('STAGE_5_COMPLETE')

// Check current stage
window.assetTest.getCurrentStage()

// Get available stages
window.assetTest.getAvailableStages()
```

### Monitoring
```javascript
// Check current asset counts
// (This is logged automatically every 5 seconds)

// Manual logging of test results
import('./src/systems/AssetTestSetup').then(m => m.logTestResults())
```

## Monitoring Features

### Asset Counting
- **Trees**: Tracked when created and destroyed
- **Bushes**: Tracked when created and destroyed
- **Rocks**: Tracked when created and destroyed
- **Grass**: Tracked when created and destroyed
- **Rings**: Tracked when created and destroyed
- **Clouds**: Tracked when created and destroyed
- **Background Sections**: Tracked when created and destroyed

### Console Logging
- Asset counts logged every 5 seconds
- Cleanup activity logged in real-time
- Warnings when asset counts exceed thresholds
- Debug messages for configuration changes

### Warning Thresholds
- Ground decorations: 500+
- Rings: 50+
- Clouds: 20+
- Background sections: 10+

## Implementation Details

### Files Added
- `src/systems/AssetCleanupConfig.ts` - Core configuration and management
- `src/systems/AssetTestingConfig.ts` - Test configurations and switcher
- `src/systems/AssetTestSetup.ts` - Initialization and utilities

### Files Modified
- `src/scenes/GameScene.ts` - Added asset tracking and cleanup mechanisms
- `src/scenes/BootScene.ts` - Added test system initialization

### Key Features
1. **Configurable cleanup distances** - Adjustable thresholds for different asset types
2. **Real-time monitoring** - Live asset counting and logging
3. **Staged testing** - Enable/disable fixes individually
4. **Proper restart mechanism** - Alternative to page reload
5. **Scene cleanup** - Proper resource management

## Testing Protocol

1. **Start with BASELINE** - Confirm issue exists
2. **Enable Stage 1** - Test ground decoration cleanup
3. **If fixed, stop there** - Don't over-engineer
4. **If not fixed, continue** - Progress through stages
5. **Document results** - Record which stage(s) fix the issue
6. **Optimize settings** - Adjust distances and thresholds
7. **Move to production** - Apply minimal necessary fixes

## Success Criteria

### Primary Success (Issue Fixed)
- No visual glitches between games
- Stable asset counts over multiple games
- Consistent performance
- No memory leaks

### Secondary Success (Optimization)
- Proper restart without page reload
- Clean scene transitions
- Efficient resource usage
- No console warnings

## Next Steps

1. **Run baseline tests** to confirm the issue
2. **Test Stage 1** to see if ground decoration cleanup solves it
3. **Document results** and determine minimum viable fix
4. **Optimize configuration** for production use
5. **Remove testing code** once fix is confirmed

## Notes

- The page reload workaround (`window.location.reload()`) has been preserved as fallback
- All fixes are optional and can be disabled for comparison
- Testing system adds minimal overhead and can be removed for production
- Console commands are available for easy configuration switching during development