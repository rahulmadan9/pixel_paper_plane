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
  } as AssetCleanupConfig,

  /**
   * ULTRA_AGGRESSIVE - Emergency mode for problematic devices
   * Extremely aggressive cleanup for devices still experiencing glitching
   */
  ULTRA_AGGRESSIVE: {
    enableDebugLogging: true,
    enableAssetCounting: true,
    logInterval: 3000,        // Very frequent logging
    
    enableGroundDecorationCleanup: true,
    groundCleanupDistance: 400,  // Extremely close to camera
    
    enableRingCleanup: true,
    enableCloudCleanup: true,
    gameObjectCleanupDistance: 300,  // Extremely aggressive
    
    enableBackgroundCleanup: true,
    backgroundCleanupDistance: 500,  // Very aggressive background cleanup
    
    enableSceneCleanup: true,
    enableProperRestart: true,
    
    maxGroundDecorations: 50,   // Extremely low limits
    maxRings: 5,
    maxClouds: 3,
    maxBackgroundSections: 1
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
  
  public static isProblematicDevice(): boolean {
    // Detect devices/browsers that might need ultra-aggressive cleanup
    const userAgent = navigator.userAgent.toLowerCase()
    const problematicIndicators = [
      // Mobile devices with limited memory
      /android.*chrome.*mobile/i.test(userAgent),
      /iphone.*safari/i.test(userAgent),
      /ipad.*safari/i.test(userAgent),
      // Older browsers
      /chrome\/[6-8][0-9]\./i.test(userAgent), // Chrome 60-89
      /firefox\/[6-8][0-9]\./i.test(userAgent), // Firefox 60-89
      // Low memory indicators
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4,
      (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4, // 4GB or less
      // WebGL limitations
      this.hasWebGLLimitations()
    ]
    
    return problematicIndicators.some(indicator => indicator)
  }
  
  private static hasWebGLLimitations(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) return true
      
      const webglContext = gl as WebGLRenderingContext
      const maxTextures = webglContext.getParameter(webglContext.MAX_TEXTURE_IMAGE_UNITS)
      const maxTextureSize = webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE)
      
      // Consider limited if less than 16 texture units or 2048 max texture size
      return maxTextures < 16 || maxTextureSize < 2048
    } catch (e) {
      return true // Assume limitations if we can't check
    }
  }
  
  public static getRecommendedConfiguration(): keyof typeof ASSET_TEST_CONFIGURATIONS {
    if (this.isProduction()) {
      if (this.isProblematicDevice()) {
        console.warn('🚨 Problematic device detected - using ULTRA_AGGRESSIVE cleanup')
        return 'ULTRA_AGGRESSIVE'
      }
      return 'PRODUCTION_AGGRESSIVE'
    }
    return 'STAGE_1_GROUND_CLEANUP'  // Conservative default for local development
  }
  
  public static logDeviceInfo(): void {
    console.log('📱 Device Information:', {
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      platform: navigator.platform,
      screenSize: `${screen.width}x${screen.height}`,
      devicePixelRatio: window.devicePixelRatio,
      isProblematic: this.isProblematicDevice()
    })
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
      isProblematicDevice: () => boolean
      logDeviceInfo: () => void
      enableUltraAggressive: () => void
      enableEmergencyMode: () => void
      logTestResults?: () => void
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
    isProduction: EnvironmentDetector.isProduction.bind(EnvironmentDetector),
    isProblematicDevice: EnvironmentDetector.isProblematicDevice.bind(EnvironmentDetector),
    logDeviceInfo: EnvironmentDetector.logDeviceInfo.bind(EnvironmentDetector),
    // Quick emergency modes
    enableUltraAggressive: () => AssetTestingSwitcher.setStage('ULTRA_AGGRESSIVE'),
    enableEmergencyMode: () => {
      console.log('🚨 ACTIVATING EMERGENCY MODE')
      EnvironmentDetector.logDeviceInfo()
      AssetTestingSwitcher.setStage('ULTRA_AGGRESSIVE')
    }
  }
}