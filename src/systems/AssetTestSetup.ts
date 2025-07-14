/**
 * AssetTestSetup - Initialize the asset cleanup testing system
 * 
 * This file sets up the initial test configuration and provides
 * instructions for testing different stages.
 */

import { AssetTestingSwitcher } from './AssetTestingConfig'

/**
 * Initialize the asset testing system
 */
export function initializeAssetTesting(): void {
  // Start with BASELINE configuration (all fixes disabled)
  AssetTestingSwitcher.setStage('BASELINE')
  
  console.log('🧪 Asset Testing System Initialized!')
  console.log('📋 Available test stages:', AssetTestingSwitcher.getAvailableStages())
  console.log('')
  console.log('🔧 Testing Instructions:')
  console.log('1. Start with BASELINE - play multiple games to confirm asset glitching occurs')
  console.log('2. Switch to STAGE_1_GROUND_CLEANUP - test if ground decoration cleanup fixes the issue')
  console.log('3. If needed, progress through STAGE_2, STAGE_3, STAGE_4, STAGE_5')
  console.log('4. Use console: window.assetTest.setStage(\"STAGE_1_GROUND_CLEANUP\")')
  console.log('')
  console.log('🔍 Monitor the console for asset counts and cleanup activity')
  console.log('⚠️  Watch for warnings about high asset counts')
  console.log('')
  console.log('Current stage:', AssetTestingSwitcher.getCurrentStage())
}

/**
 * Test protocol for systematic issue identification
 */
export const TESTING_PROTOCOL = {
  BASELINE: {
    description: 'Confirm the asset glitching issue exists',
    steps: [
      'Play 3-5 games in a row',
      'Note any visual glitches (sprites not rendering, flickering, etc.)',
      'Watch console for high asset count warnings',
      'Record maximum asset counts reached'
    ],
    expectedResults: [
      'Asset counts should grow without bound',
      'Ground decorations should exceed 500+',
      'Visual glitches should occur between games',
      'Performance should degrade over time'
    ]
  },
  
  STAGE_1_GROUND_CLEANUP: {
    description: 'Test if ground decoration cleanup fixes the issue',
    steps: [
      'Enable: window.assetTest.setStage(\"STAGE_1_GROUND_CLEANUP\")',
      'Play 3-5 games in a row',
      'Monitor console for \"Cleaned up X ground decorations\" messages',
      'Check if asset counts stay reasonable (<500)',
      'Note any remaining visual glitches'
    ],
    expectedResults: [
      'Ground decoration count should stabilize',
      'Console should show cleanup activity',
      'Visual glitches should be reduced or eliminated',
      'Performance should remain stable'
    ]
  },
  
  STAGE_2_GAME_OBJECTS: {
    description: 'Test if ring/cloud cleanup is also needed',
    steps: [
      'Enable: window.assetTest.setStage(\"STAGE_2_GAME_OBJECTS\")',
      'Play 3-5 games in a row',
      'Monitor ring and cloud cleanup messages',
      'Check if this further improves stability'
    ],
    expectedResults: [
      'Ring and cloud counts should stabilize',
      'Further reduction in glitches (if any remained)',
      'Improved overall performance'
    ]
  },
  
  STAGE_3_BACKGROUND: {
    description: 'Test if background graphics cleanup helps',
    steps: [
      'Enable: window.assetTest.setStage(\"STAGE_3_BACKGROUND\")',
      'Play 3-5 games in a row',
      'Monitor background section cleanup',
      'Check memory usage stability'
    ],
    expectedResults: [
      'Background section count should stabilize',
      'Memory usage should remain constant',
      'No background rendering issues'
    ]
  },
  
  STAGE_4_SCENE_CLEANUP: {
    description: 'Test if scene cleanup prevents state leakage',
    steps: [
      'Enable: window.assetTest.setStage(\"STAGE_4_SCENE_CLEANUP\")',
      'Test game restarts and scene transitions',
      'Monitor scene cleanup messages',
      'Check for any state leakage between games'
    ],
    expectedResults: [
      'Clean scene transitions',
      'No state leakage between games',
      'Proper asset counter resets'
    ]
  },
  
  STAGE_5_COMPLETE: {
    description: 'Test complete fix package including proper restart',
    steps: [
      'Enable: window.assetTest.setStage(\"STAGE_5_COMPLETE\")',
      'Test all game functions extensively',
      'Use R key restart instead of page reload',
      'Verify all fixes work together'
    ],
    expectedResults: [
      'No asset glitching issues',
      'Stable performance over multiple games',
      'Proper restart without page reload',
      'All asset counts remain reasonable'
    ]
  }
}

/**
 * Utility function to log current test results
 */
export function logTestResults(): void {
  console.log('📊 Current Test Results:')
  console.log('Stage:', AssetTestingSwitcher.getCurrentStage())
  
  // Get asset counts from the counter
  import('./AssetCleanupConfig').then(({ AssetCounter }) => {
    const counter = AssetCounter.getInstance()
    const counts = counter.getAllCounts()
    
    console.log('Asset Counts:')
    for (const [type, count] of counts) {
      console.log(`  ${type}: ${count}`)
    }
    
    console.log('Recent Activity:')
    const recent = counter.getRecentCreations(30)
    const grouped = recent.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    for (const [type, count] of Object.entries(grouped)) {
      console.log(`  ${type}: ${count} created in last 30s`)
    }
  })
}