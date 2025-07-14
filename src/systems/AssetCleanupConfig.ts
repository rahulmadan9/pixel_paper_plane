/**
 * AssetCleanupConfig - Configuration flags for testing asset cleanup fixes
 * 
 * This system allows us to enable/disable different cleanup stages individually
 * to test which fixes actually solve the asset glitching issue.
 */

export interface AssetCleanupConfig {
  // Debugging and monitoring
  enableDebugLogging: boolean
  enableAssetCounting: boolean
  logInterval: number // milliseconds
  
  // Stage 1: Ground decoration cleanup
  enableGroundDecorationCleanup: boolean
  groundCleanupDistance: number // pixels behind camera to start cleanup
  
  // Stage 2: Ring/cloud off-screen removal
  enableRingCleanup: boolean
  enableCloudCleanup: boolean
  gameObjectCleanupDistance: number // pixels behind camera
  
  // Stage 3: Background graphics cleanup
  enableBackgroundCleanup: boolean
  backgroundCleanupDistance: number
  
  // Stage 4: Scene cleanup methods
  enableSceneCleanup: boolean
  
  // Stage 5: Proper restart mechanism
  enableProperRestart: boolean
  
  // Safety settings
  maxGroundDecorations: number
  maxRings: number
  maxClouds: number
  maxBackgroundSections: number
}

/**
 * Default configuration - start with baseline (all fixes disabled)
 */
export const DEFAULT_ASSET_CLEANUP_CONFIG: AssetCleanupConfig = {
  // Debugging - always enabled for testing
  enableDebugLogging: true,
  enableAssetCounting: true,
  logInterval: 5000, // Log every 5 seconds
  
  // Stage 1: Ground decoration cleanup - MOST CRITICAL
  enableGroundDecorationCleanup: false, // Start disabled for baseline
  groundCleanupDistance: 2000, // 2 screen widths behind camera
  
  // Stage 2: Ring/cloud cleanup
  enableRingCleanup: false,
  enableCloudCleanup: false,
  gameObjectCleanupDistance: 1500,
  
  // Stage 3: Background cleanup
  enableBackgroundCleanup: false,
  backgroundCleanupDistance: 3000,
  
  // Stage 4: Scene cleanup
  enableSceneCleanup: false,
  
  // Stage 5: Proper restart
  enableProperRestart: false,
  
  // Safety limits (will warn when exceeded)
  maxGroundDecorations: 500,
  maxRings: 50,
  maxClouds: 20,
  maxBackgroundSections: 10
}

/**
 * Asset counter for monitoring object creation/destruction
 */
export class AssetCounter {
  private static instance: AssetCounter
  private counts: Map<string, number> = new Map()
  private creationLog: Array<{type: string, timestamp: number, x?: number}> = []
  
  public static getInstance(): AssetCounter {
    if (!AssetCounter.instance) {
      AssetCounter.instance = new AssetCounter()
    }
    return AssetCounter.instance
  }
  
  public increment(type: string, x?: number): void {
    const current = this.counts.get(type) || 0
    this.counts.set(type, current + 1)
    
    this.creationLog.push({
      type,
      timestamp: Date.now(),
      x
    })
    
    // Keep only last 1000 entries
    if (this.creationLog.length > 1000) {
      this.creationLog.shift()
    }
  }
  
  public decrement(type: string): void {
    const current = this.counts.get(type) || 0
    this.counts.set(type, Math.max(0, current - 1))
  }
  
  public getCount(type: string): number {
    return this.counts.get(type) || 0
  }
  
  public getAllCounts(): Map<string, number> {
    return new Map(this.counts)
  }
  
  public getRecentCreations(seconds: number = 10): Array<{type: string, timestamp: number, x?: number}> {
    const cutoff = Date.now() - (seconds * 1000)
    return this.creationLog.filter(entry => entry.timestamp > cutoff)
  }
  
  public reset(): void {
    this.counts.clear()
    this.creationLog = []
  }
  
  public logCurrentState(): void {
    console.log('🔧 Asset Counts:', Object.fromEntries(this.counts))
    
    // Check for concerning numbers
    const trees = this.getCount('tree')
    const bushes = this.getCount('bush')
    const rocks = this.getCount('rock')
    const grass = this.getCount('grass')
    const rings = this.getCount('ring')
    const clouds = this.getCount('cloud')
    const backgrounds = this.getCount('background')
    
    const totalDecorations = trees + bushes + rocks + grass
    
    if (totalDecorations > DEFAULT_ASSET_CLEANUP_CONFIG.maxGroundDecorations) {
      console.warn(`⚠️  High ground decoration count: ${totalDecorations}`)
    }
    
    if (rings > DEFAULT_ASSET_CLEANUP_CONFIG.maxRings) {
      console.warn(`⚠️  High ring count: ${rings}`)
    }
    
    if (clouds > DEFAULT_ASSET_CLEANUP_CONFIG.maxClouds) {
      console.warn(`⚠️  High cloud count: ${clouds}`)
    }
    
    if (backgrounds > DEFAULT_ASSET_CLEANUP_CONFIG.maxBackgroundSections) {
      console.warn(`⚠️  High background section count: ${backgrounds}`)
    }
  }
}

/**
 * Asset cleanup manager for coordinating all cleanup strategies
 */
export class AssetCleanupManager {
  private static instance: AssetCleanupManager
  private config: AssetCleanupConfig
  private counter: AssetCounter
  private logTimer?: ReturnType<typeof setInterval>
  
  private constructor() {
    this.config = { ...DEFAULT_ASSET_CLEANUP_CONFIG }
    this.counter = AssetCounter.getInstance()
  }
  
  public static getInstance(): AssetCleanupManager {
    if (!AssetCleanupManager.instance) {
      AssetCleanupManager.instance = new AssetCleanupManager()
    }
    return AssetCleanupManager.instance
  }
  
  public updateConfig(newConfig: Partial<AssetCleanupConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('🔧 Asset cleanup config updated:', newConfig)
  }
  
  public getConfig(): AssetCleanupConfig {
    return { ...this.config }
  }
  
  public startMonitoring(): void {
    if (this.config.enableAssetCounting && !this.logTimer) {
      this.logTimer = setInterval(() => {
        this.counter.logCurrentState()
      }, this.config.logInterval)
      
      console.log('🔧 Asset monitoring started')
    }
  }
  
  public stopMonitoring(): void {
    if (this.logTimer) {
      clearInterval(this.logTimer)
      this.logTimer = undefined
      console.log('🔧 Asset monitoring stopped')
    }
  }
  
  public resetCounters(): void {
    this.counter.reset()
    console.log('🔧 Asset counters reset')
  }
  
  public logDebug(message: string): void {
    if (this.config.enableDebugLogging) {
      console.log(`🔧 ${message}`)
    }
  }
  
  public shouldCleanupGroundDecorations(): boolean {
    return this.config.enableGroundDecorationCleanup
  }
  
  public shouldCleanupRings(): boolean {
    return this.config.enableRingCleanup
  }
  
  public shouldCleanupClouds(): boolean {
    return this.config.enableCloudCleanup
  }
  
  public shouldCleanupBackground(): boolean {
    return this.config.enableBackgroundCleanup
  }
  
  public shouldUseProperRestart(): boolean {
    return this.config.enableProperRestart
  }
  
  public getGroundCleanupDistance(): number {
    return this.config.groundCleanupDistance
  }
  
  public getGameObjectCleanupDistance(): number {
    return this.config.gameObjectCleanupDistance
  }
  
  public getBackgroundCleanupDistance(): number {
    return this.config.backgroundCleanupDistance
  }
}