/**
 * ProductionOptimizer - Additional optimizations for production deployment
 * 
 * This module addresses production-specific issues like Vercel memory constraints,
 * WebGL context limits, and texture management issues that don't occur locally.
 */

import { AssetCleanupManager, AssetCounter } from './AssetCleanupConfig'
import { AssetTestingSwitcher, EnvironmentDetector } from './AssetTestingConfig'

/**
 * WebGL and texture management utilities
 */
export class WebGLOptimizer {
  private static textureCache = new Map<string, number>()
  
  /**
   * Monitor WebGL texture usage and clean up when needed
   */
  public static monitorTextureUsage(scene: Phaser.Scene): void {
    const renderer = scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer
    
    if (renderer && renderer.gl) {
      const gl = renderer.gl
      const maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
      
      // Log texture usage periodically in production
      if (EnvironmentDetector.isProduction()) {
        console.log('🖼️ WebGL Info:', {
          maxTextures,
          currentTextures: this.textureCache.size,
          memoryUsage: this.estimateTextureMemoryUsage()
        })
      }
      
      // Aggressive texture cleanup if approaching limits
      if (this.textureCache.size > maxTextures * 0.8) {
        console.warn('⚠️ High texture usage, triggering aggressive cleanup')
        this.forceTextureCleanup(scene)
      }
    }
  }
  
  /**
   * Force aggressive texture cleanup
   */
  public static forceTextureCleanup(scene: Phaser.Scene): void {
    // Clear unused textures from Phaser's texture manager
    const textureManager = scene.textures
    
    // Get list of textures that might be safe to remove
    const fallbackTextures = [
      'tree1-fallback', 'tree2-fallback', 'bush-fallback',
      'cloud1-fallback', 'cloud2-fallback', 'cloud-fallback',
      'ringBronze-fallback', 'ringSilver-fallback', 'ringGold-fallback',
      'plane-fallback'
    ]
    
    let cleanedCount = 0
    fallbackTextures.forEach(key => {
      if (textureManager.exists(key)) {
        textureManager.remove(key)
        this.textureCache.delete(key)
        cleanedCount++
      }
    })
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} fallback textures`)
    }
  }
  
  /**
   * Track texture creation
   */
  public static trackTexture(key: string, size: number = 1024): void {
    this.textureCache.set(key, size)
  }
  
  /**
   * Estimate texture memory usage
   */
  private static estimateTextureMemoryUsage(): string {
    let totalBytes = 0
    for (const size of this.textureCache.values()) {
      totalBytes += size * size * 4 // RGBA at 1 byte per channel
    }
    
    if (totalBytes > 1024 * 1024) {
      return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
    } else if (totalBytes > 1024) {
      return `${(totalBytes / 1024).toFixed(2)} KB`
    } else {
      return `${totalBytes} bytes`
    }
  }
}

/**
 * Production-specific memory optimizer
 */
export class MemoryOptimizer {
  private static memoryCheckInterval?: ReturnType<typeof setInterval>
  
  /**
   * Start memory monitoring for production
   */
  public static startMemoryMonitoring(): void {
    if (!EnvironmentDetector.isProduction()) {
      return // Only run in production
    }
    
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage()
    }, 15000) // Check every 15 seconds
    
    console.log('📊 Production memory monitoring started')
  }
  
  /**
   * Stop memory monitoring
   */
  public static stopMemoryMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
      this.memoryCheckInterval = undefined
      console.log('📊 Memory monitoring stopped')
    }
  }
  
  /**
   * Check current memory usage and trigger cleanup if needed
   */
  private static checkMemoryUsage(): void {
    // Use performance.memory if available (Chrome)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / (1024 * 1024)
      const totalMB = memory.totalJSHeapSize / (1024 * 1024)
      const limitMB = memory.jsHeapSizeLimit / (1024 * 1024)
      
      const usagePercent = (usedMB / limitMB) * 100
      
      console.log('🧠 Memory Usage:', {
        used: `${usedMB.toFixed(2)} MB`,
        total: `${totalMB.toFixed(2)} MB`,
        limit: `${limitMB.toFixed(2)} MB`,
        usage: `${usagePercent.toFixed(1)}%`
      })
      
      // Trigger aggressive cleanup if memory usage is high
      if (usagePercent > 75) {
        console.warn('⚠️ High memory usage detected, triggering cleanup')
        this.triggerAggressiveCleanup()
      }
    }
    
    // Also log asset counts
    const counter = AssetCounter.getInstance()
    counter.logCurrentState()
  }
  
  /**
   * Trigger aggressive cleanup when memory is high
   */
  private static triggerAggressiveCleanup(): void {
    const manager = AssetCleanupManager.getInstance()
    const currentConfig = manager.getConfig()
    
    // Temporarily reduce cleanup distances for more aggressive cleanup
    manager.updateConfig({
      groundCleanupDistance: Math.max(500, currentConfig.groundCleanupDistance * 0.5),
      gameObjectCleanupDistance: Math.max(400, currentConfig.gameObjectCleanupDistance * 0.5),
      backgroundCleanupDistance: Math.max(600, currentConfig.backgroundCleanupDistance * 0.5)
    })
    
    console.log('🚨 Applied emergency cleanup settings')
    
    // Restore normal settings after 30 seconds
    setTimeout(() => {
      manager.updateConfig({
        groundCleanupDistance: currentConfig.groundCleanupDistance,
        gameObjectCleanupDistance: currentConfig.gameObjectCleanupDistance,
        backgroundCleanupDistance: currentConfig.backgroundCleanupDistance
      })
      console.log('✅ Restored normal cleanup settings')
    }, 30000)
  }
}

/**
 * Production asset optimizer
 */
export class ProductionAssetOptimizer {
  /**
   * Initialize all production optimizations
   */
  public static initialize(scene?: Phaser.Scene): void {
    if (!EnvironmentDetector.isProduction()) {
      console.log('🛠️ Development mode - skipping production optimizations')
      return
    }
    
    console.log('🚀 Initializing production optimizations')
    
    // Auto-configure for aggressive cleanup
    AssetTestingSwitcher.setStage('PRODUCTION_AGGRESSIVE')
    
    // Start memory monitoring
    MemoryOptimizer.startMemoryMonitoring()
    
    // Monitor WebGL if scene is available
    if (scene) {
      WebGLOptimizer.monitorTextureUsage(scene)
      
      // Set up periodic WebGL monitoring
      setInterval(() => {
        WebGLOptimizer.monitorTextureUsage(scene)
      }, 20000) // Every 20 seconds
    }
    
    // Log production environment details
    this.logProductionEnvironment()
  }
  
  /**
   * Clean shutdown of production optimizations
   */
  public static shutdown(): void {
    MemoryOptimizer.stopMemoryMonitoring()
    console.log('🔧 Production optimizations shut down')
  }
  
  /**
   * Log production environment details for debugging
   */
  private static logProductionEnvironment(): void {
    console.log('🌐 Production Environment Details:', {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent.substring(0, 50) + '...',
      screenSize: `${screen.width}x${screen.height}`,
      devicePixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency,
      memory: 'memory' in performance ? `${((performance as any).memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(0)} MB limit` : 'unknown'
    })
  }
}

/**
 * Enhanced initialization for production environments
 */
export function initializeProductionOptimizations(): void {
  if (EnvironmentDetector.isProduction()) {
    console.log('🚀 Production environment detected')
    console.log('📋 Applying aggressive asset cleanup configuration')
    
    // Apply production configuration immediately
    AssetTestingSwitcher.setStage('PRODUCTION_AGGRESSIVE')
    
    // Log production-specific instructions
    console.log('')
    console.log('🔧 Production Debugging Commands:')
    console.log('• window.assetTest.setStage("BASELINE") - Test without cleanup')
    console.log('• window.assetTest.setStage("PRODUCTION_AGGRESSIVE") - Restore aggressive cleanup')
    console.log('• window.assetTest.logTestResults() - Check current asset status')
    console.log('• window.assetTest.isProduction() - Verify environment detection')
    console.log('')
    
    // Initialize production optimizations
    ProductionAssetOptimizer.initialize()
  } else {
    console.log('🛠️ Development environment - using standard configuration')
    AssetTestingSwitcher.setStage('STAGE_1_GROUND_CLEANUP')
  }
}

// Global exposure for production debugging
declare global {
  interface Window {
    productionOptimizer: {
      initialize: () => void
      shutdown: () => void
      forceMemoryCheck: () => void
      forceTextureCleanup: (scene: Phaser.Scene) => void
    }
  }
}

if (typeof window !== 'undefined') {
  window.productionOptimizer = {
    initialize: () => ProductionAssetOptimizer.initialize(),
    shutdown: () => ProductionAssetOptimizer.shutdown(),
    forceMemoryCheck: () => MemoryOptimizer['checkMemoryUsage'](),
    forceTextureCleanup: (scene: Phaser.Scene) => WebGLOptimizer.forceTextureCleanup(scene)
  }
}