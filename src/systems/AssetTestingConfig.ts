/**
 * AssetTestingConfig - Predefined configurations for testing different fix stages
 * 
 * This file contains preset configurations for systematically testing
 * each stage of the asset cleanup fixes.
 */

import type { AssetCleanupConfig } from './AssetCleanupConfig'

/**
 * Test configurations for different stages
 */
export const ASSET_TEST_CONFIGURATIONS = {
  /**
   * BASELINE - All fixes disabled for comparison
   * Use this to establish baseline behavior and confirm the issue exists
   */
  BASELINE: {
    enableDebugLogging: true,
    enableAssetCounting: true,
    logInterval: 5000,
    
    enableGroundDecorationCleanup: false,
    groundCleanupDistance: 2000,
    
    enableRingCleanup: false,
    enableCloudCleanup: false,
    gameObjectCleanupDistance: 1500,
    
    enableBackgroundCleanup: false,
    backgroundCleanupDistance: 3000,
    
    enableSceneCleanup: false,
    enableProperRestart: false,
    
    maxGroundDecorations: 500,
    maxRings: 50,
    maxClouds: 20,
    maxBackgroundSections: 10
  } as AssetCleanupConfig,

  /**
   * STAGE_1 - Only ground decoration cleanup enabled
   * This tests our primary hypothesis that infinite ground decorations cause glitching
   */
  STAGE_1_GROUND_CLEANUP: {
    enableDebugLogging: true,
    enableAssetCounting: true,
    logInterval: 5000,
    
    enableGroundDecorationCleanup: true,  // ✅ ENABLED
    groundCleanupDistance: 2000,
    
    enableRingCleanup: false,
    enableCloudCleanup: false,
    gameObjectCleanupDistance: 1500,
    
    enableBackgroundCleanup: false,
    backgroundCleanupDistance: 3000,
    
    enableSceneCleanup: false,
    enableProperRestart: false,
    
    maxGroundDecorations: 500,
    maxRings: 50,
    maxClouds: 20,
    maxBackgroundSections: 10
  } as AssetCleanupConfig,

  /**
   * STAGE_2 - Ground cleanup + Ring/Cloud cleanup
   * This tests if game objects also contribute to the issue
   */
  STAGE_2_GAME_OBJECTS: {
    enableDebugLogging: true,
    enableAssetCounting: true,
    logInterval: 5000,
    
    enableGroundDecorationCleanup: true,
    groundCleanupDistance: 2000,
    
    enableRingCleanup: true,        // ✅ ENABLED
    enableCloudCleanup: true,       // ✅ ENABLED
    gameObjectCleanupDistance: 1500,
    
    enableBackgroundCleanup: false,
    backgroundCleanupDistance: 3000,
    
    enableSceneCleanup: false,
    enableProperRestart: false,
    
    maxGroundDecorations: 500,
    maxRings: 50,
    maxClouds: 20,
    maxBackgroundSections: 10
  } as AssetCleanupConfig,

  /**
   * STAGE_3 - Previous stages + Background cleanup
   * This tests if background graphics accumulation is also a factor
   */
  STAGE_3_BACKGROUND: {
    enableDebugLogging: true,
    enableAssetCounting: true,
    logInterval: 5000,
    
    enableGroundDecorationCleanup: true,
    groundCleanupDistance: 2000,
    
    enableRingCleanup: true,
    enableCloudCleanup: true,
    gameObjectCleanupDistance: 1500,
    
    enableBackgroundCleanup: true,  // ✅ ENABLED
    backgroundCleanupDistance: 3000,
    
    enableSceneCleanup: false,
    enableProperRestart: false,
    
    maxGroundDecorations: 500,
    maxRings: 50,
    maxClouds: 20,
    maxBackgroundSections: 10
  } as AssetCleanupConfig,

  /**
   * STAGE_4 - All cleanup + Scene cleanup methods
   * This tests if proper scene cleanup prevents state leakage
   */
  STAGE_4_SCENE_CLEANUP: {
    enableDebugLogging: true,
    enableAssetCounting: true,
    logInterval: 5000,
    
    enableGroundDecorationCleanup: true,
    groundCleanupDistance: 2000,
    
    enableRingCleanup: true,
    enableCloudCleanup: true,
    gameObjectCleanupDistance: 1500,
    
    enableBackgroundCleanup: true,
    backgroundCleanupDistance: 3000,
    
    enableSceneCleanup: true,       // ✅ ENABLED
    enableProperRestart: false,
    
    maxGroundDecorations: 500,
    maxRings: 50,
    maxClouds: 20,
    maxBackgroundSections: 10
  } as AssetCleanupConfig,

  /**
   * STAGE_5 - All fixes enabled including proper restart
   * This is the complete fix package
   */
  STAGE_5_COMPLETE: {
    enableDebugLogging: true,
    enableAssetCounting: true,
    logInterval: 5000,
    
    enableGroundDecorationCleanup: true,
    groundCleanupDistance: 2000,
    
    enableRingCleanup: true,
    enableCloudCleanup: true,
    gameObjectCleanupDistance: 1500,
    
    enableBackgroundCleanup: true,
    backgroundCleanupDistance: 3000,
    
    enableSceneCleanup: true,
    enableProperRestart: true,      // ✅ ENABLED
    
    maxGroundDecorations: 500,
    maxRings: 50,
    maxClouds: 20,
    maxBackgroundSections: 10
  } as AssetCleanupConfig,

  /**
   * PRODUCTION - Optimized settings for production use
   * Less logging, optimized cleanup distances
   */
  PRODUCTION: {
    enableDebugLogging: false,
    enableAssetCounting: false,
    logInterval: 30000,
    
    enableGroundDecorationCleanup: true,
    groundCleanupDistance: 1500,
    
    enableRingCleanup: true,
    enableCloudCleanup: true,
    gameObjectCleanupDistance: 1000,
    
    enableBackgroundCleanup: true,
    backgroundCleanupDistance: 2000,
    
    enableSceneCleanup: true,
    enableProperRestart: true,
    
    maxGroundDecorations: 300,
    maxRings: 30,
    maxClouds: 15,
    maxBackgroundSections: 5
  } as AssetCleanupConfig,

  /**
   * PRODUCTION_AGGRESSIVE - More aggressive cleanup for production deployment
   * Addresses Vercel/production-specific memory constraints
   */
  PRODUCTION_AGGRESSIVE: {
    enableDebugLogging: true,  // Keep logging for production debugging
    enableAssetCounting: true, // Keep monitoring for production issues
    logInterval: 10000,       // More frequent logging
    
    enableGroundDecorationCleanup: true,
    groundCleanupDistance: 1000,  // More aggressive - cleanup closer to camera
    
    enableRingCleanup: true,
    enableCloudCleanup: true,
    gameObjectCleanupDistance: 800,  // More aggressive cleanup
    
    enableBackgroundCleanup: true,
    backgroundCleanupDistance: 1200, // More aggressive background cleanup
    
    enableSceneCleanup: true,
    enableProperRestart: true,
    
    maxGroundDecorations: 200,  // Lower limits for production
    maxRings: 20,
    maxClouds: 10,
    maxBackgroundSections: 3
  } as AssetCleanupConfig
}

/**
 * Environment detection and auto-configuration
 */
export class EnvironmentDetector {
  public static isProduction(): boolean {
    // Check multiple indicators for production environment
    const indicators = [
      window.location.hostname.includes('vercel.app'),
      window.location.hostname.includes('netlify.app'),
      window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'),
      process.env.NODE_ENV === 'production',
      !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')
    ]
    
    return indicators.some(indicator => indicator)
  }
  
  public static getRecommendedConfiguration(): keyof typeof ASSET_TEST_CONFIGURATIONS {
    if (this.isProduction()) {
      return 'PRODUCTION_AGGRESSIVE'
    }
    return 'STAGE_1_GROUND_CLEANUP'  // Conservative default for local development
  }
}

/**
 * Quick configuration switcher for testing
 */
export class AssetTestingSwitcher {
  private static currentStage: string = 'BASELINE'
  
  public static setStage(stage: keyof typeof ASSET_TEST_CONFIGURATIONS): void {
    const config = ASSET_TEST_CONFIGURATIONS[stage]
    if (!config) {
      console.error(`❌ Unknown test stage: ${stage}`)
      return
    }
    
    this.currentStage = stage
    
    // Import and apply configuration
    import('./AssetCleanupConfig').then(({ AssetCleanupManager }) => {
      const manager = AssetCleanupManager.getInstance()
      manager.updateConfig(config)
      console.log(`🧪 Switched to test stage: ${stage}`)
      console.log('📋 Active features:', this.getActiveFeatures(config))
      
      if (EnvironmentDetector.isProduction()) {
        console.log('🚀 Production environment detected')
      }
    })
  }
  
  public static autoConfigureForEnvironment(): void {
    const recommendedStage = EnvironmentDetector.getRecommendedConfiguration()
    console.log(`🔧 Auto-configuring for ${EnvironmentDetector.isProduction() ? 'production' : 'development'} environment`)
    this.setStage(recommendedStage)
  }
  
  public static getCurrentStage(): string {
    return this.currentStage
  }
  
  public static getAvailableStages(): string[] {
    return Object.keys(ASSET_TEST_CONFIGURATIONS)
  }
  
  private static getActiveFeatures(config: AssetCleanupConfig): string[] {
    const active: string[] = []
    
    if (config.enableGroundDecorationCleanup) active.push('Ground Decoration Cleanup')
    if (config.enableRingCleanup) active.push('Ring Cleanup')
    if (config.enableCloudCleanup) active.push('Cloud Cleanup')
    if (config.enableBackgroundCleanup) active.push('Background Cleanup')
    if (config.enableSceneCleanup) active.push('Scene Cleanup')
    if (config.enableProperRestart) active.push('Proper Restart')
    
    return active
  }
}

/**
 * Console helper for easy stage switching during development
 */
declare global {
  interface Window {
    assetTest: {
      setStage: (stage: keyof typeof ASSET_TEST_CONFIGURATIONS) => void
      getCurrentStage: () => string
      getAvailableStages: () => string[]
      autoConfigureForEnvironment: () => void
      isProduction: () => boolean
    }
  }
}

// Make available globally for console testing
if (typeof window !== 'undefined') {
  window.assetTest = {
    setStage: AssetTestingSwitcher.setStage.bind(AssetTestingSwitcher),
    getCurrentStage: AssetTestingSwitcher.getCurrentStage.bind(AssetTestingSwitcher),
    getAvailableStages: AssetTestingSwitcher.getAvailableStages.bind(AssetTestingSwitcher),
    autoConfigureForEnvironment: AssetTestingSwitcher.autoConfigureForEnvironment.bind(AssetTestingSwitcher),
    isProduction: EnvironmentDetector.isProduction.bind(EnvironmentDetector)
  }
}