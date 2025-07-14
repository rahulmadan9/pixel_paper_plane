/**
 * EmergencyDiagnostics - Deep diagnostic tools for persistent production glitching
 * 
 * This module provides emergency diagnostic capabilities to identify the root cause
 * of persistent asset glitching in production environments.
 */

import { EnvironmentDetector } from './AssetTestingConfig'

/**
 * Phaser-specific diagnostic tools
 */
export class PhaserDiagnostics {
  private static intervalId?: ReturnType<typeof setInterval>
  
  /**
   * Deep inspection of Phaser's internal state
   */
  public static inspectPhaserState(scene: Phaser.Scene): void {
    console.log('🔍 EMERGENCY PHASER DIAGNOSTICS')
    console.log('================================')
    
    // Game and renderer info
    const game = scene.game
    const renderer = game.renderer
    
    console.log('🎮 Game State:', {
      isBooted: game.isBooted,
      isRunning: game.isRunning,
      hasStarted: game.hasStarted,
      pendingDestroy: game.pendingDestroy,
      rendererType: renderer.type === 0 ? 'Canvas' : 'WebGL',
      width: game.config.width,
      height: game.config.height
    })
    
    // Scene manager analysis
    console.log('🎬 Scene Manager:', {
      activeScenes: game.scene.scenes.length,
      runningScenes: game.scene.scenes.filter(s => s.scene.isActive()).map(s => s.scene.key),
      sleepingScenes: game.scene.scenes.filter(s => s.scene.isSleeping()).map(s => s.scene.key),
      pausedScenes: game.scene.scenes.filter(s => s.scene.isPaused()).map(s => s.scene.key)
    })
    
    // Current scene details
    console.log('🎭 Current Scene:', {
      key: scene.scene.key,
      isActive: scene.scene.isActive(),
      isVisible: scene.scene.isVisible(),
      isSleeping: scene.scene.isSleeping(),
      isPaused: scene.scene.isPaused(),
      displayListLength: scene.children.length,
      updateListLength: scene.children.getChildren().filter(child => child.active).length
    })
    
    // Display list analysis
    this.analyzeDisplayList(scene)
    
    // Texture manager analysis  
    this.analyzeTextureManager(scene)
    
    // Cache analysis
    this.analyzeCaches(scene)
    
    // WebGL state if available
    if (renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
      this.analyzeWebGLState(renderer)
    }
    
    console.log('================================')
  }
  
  /**
   * Analyze scene display list for problematic objects
   */
  private static analyzeDisplayList(scene: Phaser.Scene): void {
    const children = scene.children.getChildren()
    const childrenByType = new Map<string, number>()
    const problematicObjects: any[] = []
    
    children.forEach(child => {
      const type = child.constructor.name
      childrenByType.set(type, (childrenByType.get(type) || 0) + 1)
      
      // Check for problematic states
      if (!child.texture || child.texture.key === '__MISSING') {
        problematicObjects.push({
          type,
          key: (child as any).texture?.key || 'unknown',
          x: (child as any).x,
          y: (child as any).y,
          issue: 'Missing texture'
        })
      }
      
      if ((child as any).alpha === 0) {
        problematicObjects.push({
          type,
          x: (child as any).x,
          y: (child as any).y,
          issue: 'Invisible (alpha=0)'
        })
      }
    })
    
    console.log('📊 Display List Analysis:', {
      totalObjects: children.length,
      objectTypes: Object.fromEntries(childrenByType),
      problematicObjects: problematicObjects.length,
      issues: problematicObjects
    })
  }
  
  /**
   * Analyze texture manager state
   */
  private static analyzeTextureManager(scene: Phaser.Scene): void {
    const textureManager = scene.textures
    const textureKeys = textureManager.getTextureKeys()
    
    const textureInfo = {
      totalTextures: textureKeys.length,
      missingTextures: 0,
      fallbackTextures: 0,
      spriteTextures: 0,
      generatedTextures: 0,
      problematicTextures: [] as string[]
    }
    
    textureKeys.forEach(key => {
      if (key === '__MISSING') {
        textureInfo.missingTextures++
        textureInfo.problematicTextures.push(key)
      } else if (key.includes('fallback')) {
        textureInfo.fallbackTextures++
      } else if (key.includes('plane') || key.includes('ring') || key.includes('cloud') || key.includes('tree') || key.includes('bush')) {
        textureInfo.spriteTextures++
      } else if (key.startsWith('__')) {
        textureInfo.generatedTextures++
      }
      
      const texture = textureManager.get(key)
      if (!texture.source || texture.source.length === 0) {
        textureInfo.problematicTextures.push(`${key} (no source)`)
      }
    })
    
    console.log('🖼️ Texture Manager Analysis:', textureInfo)
  }
  
  /**
   * Analyze various Phaser caches
   */
  private static analyzeCaches(scene: Phaser.Scene): void {
    const game = scene.game
    
    console.log('💾 Cache Analysis:', {
      audio: game.cache.audio.entries.size,
      binary: game.cache.binary.entries.size,
      bitmapFont: game.cache.bitmapFont.entries.size,
      html: game.cache.html.entries.size,
      json: game.cache.json.entries.size,
      obj: game.cache.obj.entries.size,
      physics: game.cache.physics.entries.size,
      shader: game.cache.shader.entries.size,
      text: game.cache.text.entries.size,
      tilemap: game.cache.tilemap.entries.size,
      video: game.cache.video.entries.size,
      xml: game.cache.xml.entries.size
    })
  }
  
  /**
   * Analyze WebGL renderer state
   */
  private static analyzeWebGLState(renderer: Phaser.Renderer.WebGL.WebGLRenderer): void {
    const gl = renderer.gl
    
    if (gl) {
      console.log('🖥️ WebGL State:', {
        contextLost: gl.isContextLost(),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
        maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
      })
      
      // Check for WebGL errors
      const error = gl.getError()
      if (error !== gl.NO_ERROR) {
        console.error('🚨 WebGL Error detected:', error)
      }
    }
  }
  
  /**
   * Start continuous monitoring for production debugging
   */
  public static startContinuousMonitoring(scene: Phaser.Scene): void {
    if (this.intervalId) {
      this.stopContinuousMonitoring()
    }
    
    this.intervalId = setInterval(() => {
      console.log('🔄 CONTINUOUS MONITORING CHECK')
      this.inspectPhaserState(scene)
    }, 30000) // Every 30 seconds
    
    console.log('📊 Started continuous Phaser monitoring')
  }
  
  /**
   * Stop continuous monitoring
   */
  public static stopContinuousMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
      console.log('⏹️ Stopped continuous monitoring')
    }
  }
}

/**
 * WebGL context loss detector and handler
 */
export class WebGLContextMonitor {
  private static contextLossDetected = false
  
  /**
   * Set up WebGL context loss detection
   */
  public static setupContextLossDetection(scene: Phaser.Scene): void {
    const renderer = scene.game.renderer
    
    if (renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer && renderer.gl) {
      const canvas = renderer.canvas
      
      canvas.addEventListener('webglcontextlost', (event) => {
        console.error('🚨 WebGL Context Lost!', event)
        this.contextLossDetected = true
        event.preventDefault()
        
        // Attempt immediate recovery
        this.handleContextLoss(scene)
      })
      
      canvas.addEventListener('webglcontextrestored', (event) => {
        console.log('✅ WebGL Context Restored!', event)
        this.contextLossDetected = false
        
        // Reinitialize resources
        this.handleContextRestore(scene)
      })
      
      console.log('🛡️ WebGL context loss detection enabled')
    }
  }
  
  /**
   * Handle WebGL context loss
   */
  private static handleContextLoss(scene: Phaser.Scene): void {
    console.log('🔧 Handling WebGL context loss...')
    
    // Force immediate cleanup of all assets
    this.emergencyAssetCleanup(scene)
  }
  
  /**
   * Handle WebGL context restoration
   */
  private static handleContextRestore(scene: Phaser.Scene): void {
    console.log('🔧 Handling WebGL context restoration...')
    
    // Reload critical textures
    this.reloadEssentialTextures(scene)
  }
  
  /**
   * Emergency cleanup of all assets
   */
  private static emergencyAssetCleanup(scene: Phaser.Scene): void {
    console.log('🚨 EMERGENCY ASSET CLEANUP')
    
    // Destroy all display list objects
    scene.children.removeAll(true)
    
    // Clear texture manager
    const textureManager = scene.textures
    const keys = textureManager.getTextureKeys()
    keys.forEach(key => {
      if (key !== '__DEFAULT' && key !== '__MISSING' && key !== '__WHITE') {
        textureManager.remove(key)
      }
    })
    
    console.log('🧹 Emergency cleanup completed')
  }
  
  /**
   * Reload essential textures after context restore
   */
  private static reloadEssentialTextures(scene: Phaser.Scene): void {
    console.log('🔄 Reloading essential textures...')
    
    // This would need to be customized based on your specific assets
    // For now, just recreate fallback textures
    scene.scene.restart()
  }
  
  /**
   * Check if context loss has been detected
   */
  public static hasContextLoss(): boolean {
    return this.contextLossDetected
  }
}

/**
 * Ultra-aggressive cleanup mode for emergency situations
 */
export class EmergencyCleanupMode {
  private static isActive = false
  
  /**
   * Activate ultra-aggressive cleanup mode
   */
  public static activate(scene: Phaser.Scene): void {
    if (this.isActive) return
    
    console.log('🚨 ACTIVATING EMERGENCY CLEANUP MODE')
    this.isActive = true
    
    // Extremely aggressive settings
    import('./AssetCleanupConfig').then(({ AssetCleanupManager }) => {
      const manager = AssetCleanupManager.getInstance()
      manager.updateConfig({
        enableDebugLogging: true,
        enableAssetCounting: true,
        logInterval: 5000, // Every 5 seconds
        
        enableGroundDecorationCleanup: true,
        groundCleanupDistance: 300, // Extremely close to camera
        
        enableRingCleanup: true,
        enableCloudCleanup: true,
        gameObjectCleanupDistance: 200, // Extremely close
        
        enableBackgroundCleanup: true,
        backgroundCleanupDistance: 400, // Very close
        
        enableSceneCleanup: true,
        enableProperRestart: true,
        
        maxGroundDecorations: 50, // Extremely low limits
        maxRings: 5,
        maxClouds: 3,
        maxBackgroundSections: 1
      })
      
      console.log('🚨 Emergency cleanup settings applied')
    })
    
    // Set up aggressive monitoring
    const emergencyInterval = setInterval(() => {
      this.performEmergencyCleanup(scene)
    }, 5000) // Every 5 seconds
    
    // Auto-deactivate after 2 minutes
    setTimeout(() => {
      clearInterval(emergencyInterval)
      this.deactivate()
    }, 120000)
  }
  
  /**
   * Perform emergency cleanup
   */
  private static performEmergencyCleanup(scene: Phaser.Scene): void {
    console.log('🚨 PERFORMING EMERGENCY CLEANUP')
    
    // Force destroy objects outside tiny radius
    const cameraX = scene.cameras.main.scrollX
    const cleanupRadius = 300
    
    scene.children.getChildren().forEach(child => {
      const gameObject = child as any
      if (gameObject.x && gameObject.x < cameraX - cleanupRadius) {
        console.log(`🗑️ Emergency destroying object at x=${gameObject.x}`)
        gameObject.destroy()
      }
    })
    
    // Force texture cleanup
    import('./ProductionOptimizer').then(({ WebGLOptimizer }) => {
      WebGLOptimizer.forceTextureCleanup(scene)
    })
  }
  
  /**
   * Deactivate emergency mode
   */
  public static deactivate(): void {
    if (!this.isActive) return
    
    console.log('✅ Deactivating emergency cleanup mode')
    this.isActive = false
    
    // Restore normal settings
    import('./AssetTestingConfig').then(({ AssetTestingSwitcher, EnvironmentDetector }) => {
      if (EnvironmentDetector.isProduction()) {
        AssetTestingSwitcher.setStage('PRODUCTION_AGGRESSIVE')
      } else {
        AssetTestingSwitcher.setStage('STAGE_1_GROUND_CLEANUP')
      }
    })
  }
  
  /**
   * Check if emergency mode is active
   */
  public static isEmergencyActive(): boolean {
    return this.isActive
  }
}

/**
 * Production glitching detective - tries to identify the exact cause
 */
export class GlitchingDetective {
  private static observations: Array<{timestamp: number, observation: string, data: any}> = []
  
  /**
   * Record an observation about potential glitching
   */
  public static recordObservation(observation: string, data: any = {}): void {
    this.observations.push({
      timestamp: Date.now(),
      observation,
      data
    })
    
    // Keep only last 50 observations
    if (this.observations.length > 50) {
      this.observations.shift()
    }
    
    console.log(`🕵️ GLITCH DETECTIVE: ${observation}`, data)
  }
  
  /**
   * Analyze patterns in observations
   */
  public static analyzePatterns(): void {
    console.log('🕵️ GLITCH DETECTIVE ANALYSIS')
    console.log('============================')
    
    const recentObservations = this.observations.filter(obs => 
      Date.now() - obs.timestamp < 300000 // Last 5 minutes
    )
    
    console.log(`📊 Analyzed ${recentObservations.length} recent observations`)
    
    // Group by observation type
    const grouped = recentObservations.reduce((acc, obs) => {
      acc[obs.observation] = (acc[obs.observation] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('📈 Observation frequency:', grouped)
    
    // Look for concerning patterns
    const concerning = Object.entries(grouped).filter(([_, count]) => count > 3)
    if (concerning.length > 0) {
      console.warn('⚠️ Concerning patterns detected:', concerning)
    }
    
    console.log('📝 Recent observations:', recentObservations.slice(-10))
  }
  
  /**
   * Get full observation log
   */
  public static getObservations(): Array<{timestamp: number, observation: string, data: any}> {
    return [...this.observations]
  }
  
  /**
   * Clear observation log
   */
  public static clearObservations(): void {
    this.observations = []
    console.log('🗑️ Cleared observation log')
  }
}

// Global access for emergency debugging
declare global {
  interface Window {
    emergencyDiagnostics: {
      inspectPhaser: (scene: Phaser.Scene) => void
      startMonitoring: (scene: Phaser.Scene) => void
      stopMonitoring: () => void
      activateEmergencyMode: (scene: Phaser.Scene) => void
      deactivateEmergencyMode: () => void
      analyzeGlitchPatterns: () => void
      recordGlitch: (description: string, data?: any) => void
    }
  }
}

if (typeof window !== 'undefined') {
  window.emergencyDiagnostics = {
    inspectPhaser: (scene: Phaser.Scene) => PhaserDiagnostics.inspectPhaserState(scene),
    startMonitoring: (scene: Phaser.Scene) => PhaserDiagnostics.startContinuousMonitoring(scene),
    stopMonitoring: () => PhaserDiagnostics.stopContinuousMonitoring(),
    activateEmergencyMode: (scene: Phaser.Scene) => EmergencyCleanupMode.activate(scene),
    deactivateEmergencyMode: () => EmergencyCleanupMode.deactivate(),
    analyzeGlitchPatterns: () => GlitchingDetective.analyzePatterns(),
    recordGlitch: (description: string, data?: any) => GlitchingDetective.recordObservation(description, data)
  }
}