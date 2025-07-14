import Phaser from 'phaser'
import { PaperPlane } from '@objects/PaperPlane'
import { Ring } from '@objects/Ring'
import { Cloud } from '@objects/Cloud'
import { colors, typography } from '../ui/DesignTokens'
import { ScoreManager } from '../systems/ScoreManager'
import { AuthManager } from '../systems/AuthManager'
import type { GameScore } from '../systems/ScoreManager'
import { AssetCleanupManager, AssetCounter } from '@systems/AssetCleanupConfig'

/**
 * GameScene - Main gameplay scene
 * 
 * Handles:
 * - Paper plane physics and controls
 * - Ring collection system
 * - Cloud obstacle generation
 * - Dynamic world generation (ground, background, clouds)
 * - Score tracking and game over
 */
export class GameScene extends Phaser.Scene {
  // Game objects
  private plane!: PaperPlane
  private rings!: Phaser.Physics.Arcade.Group
  private clouds!: Phaser.Physics.Arcade.Group

  // Game state
  private score: number = 0
  private distance: number = 0
  private isLaunched: boolean = false
  private gameEnded: boolean = false
  
  // World tracking
  private groundLevel: number = 0
  private lastGroundX: number = 0
  private lastBackgroundX: number = 0
  private lastCloudX: number = 0
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text
  private distanceText!: Phaser.GameObjects.Text
  
  // Asset tracking and cleanup
  private cleanupManager!: AssetCleanupManager
  private assetCounter!: AssetCounter
  private groundDecorations: Phaser.GameObjects.GameObject[] = []
  private backgroundSections: Phaser.GameObjects.Graphics[] = []

  constructor() {
    super({ key: 'GameScene' })
  }

  public init(): void {
    // Reset game state
    this.score = 0
    this.distance = 0
    this.isLaunched = false
    this.gameEnded = false
    this.lastCloudX = 0
    
    // Initialize asset cleanup system
    this.cleanupManager = AssetCleanupManager.getInstance()
    this.assetCounter = AssetCounter.getInstance()
    
    // Reset asset tracking arrays
    this.groundDecorations = []
    this.backgroundSections = []
    
    // Start monitoring
    this.cleanupManager.startMonitoring()
    
    // Apply current test configuration
    this.cleanupManager.logDebug('GameScene initialized with current test stage')
  }

  public create(): void {
    this.setupWorld()
    this.setupGameObjects()
    this.setupInput()
    this.setupUI()
    this.spawnInitialContent()
  }

  /**
   * Setup the game world (background, ground, camera)
   */
  private setupWorld(): void {
    const { width, height } = this.cameras.main
    this.groundLevel = height - 60

    this.createInitialBackground(width, height)
    this.createInitialGround(width)
    this.setupCamera(width, height)
  }

  /**
   * Create initial background gradient
   */
  private createInitialBackground(width: number, height: number): void {
    this.lastBackgroundX = width * 3
    this.createBackgroundSection(0, this.lastBackgroundX, height)
  }

  /**
   * Create background gradient for specified range
   */
  private createBackgroundSection(startX: number, endX: number, height: number): void {
    const graphics = this.add.graphics()
    graphics.fillGradientStyle(
      parseInt(colors.skyTop.replace('#', ''), 16),
      parseInt(colors.skyTop.replace('#', ''), 16),
      parseInt(colors.skyBottom.replace('#', ''), 16),
      parseInt(colors.skyBottom.replace('#', ''), 16)
    )
    graphics.fillRect(startX, 0, endX - startX, height)
    
    // Track background section for cleanup
    this.backgroundSections.push(graphics)
    this.assetCounter.increment('background', startX)
    
    this.cleanupManager.logDebug(`Created background section at x=${startX}, total: ${this.backgroundSections.length}`)
  }

  /**
   * Create initial ground tiles
   */
  private createInitialGround(width: number): void {
    this.lastGroundX = 0
    this.extendGround(width * 3)
  }

  /**
   * Extend ground tiles with decorative elements
   */
  private extendGround(targetX: number): void {
    for (let x = this.lastGroundX; x < targetX; x += 100) {
      // Ground tile
      const groundTile = this.add.image(x, this.groundLevel, 'ground')
      groundTile.setOrigin(0, 0)
      groundTile.setScale(1, 1)
      
      // Add decorative elements
      this.addGroundDecorations(x)
    }
    this.lastGroundX = targetX
  }

  /**
   * Add trees, rocks, and grass to ground
   */
  private addGroundDecorations(x: number): void {
    // Trees (30% chance) - now using sprites
    if (Math.random() < 0.3) {
      this.addTreeSprite(x)
    }
    
    // Bushes (15% chance) - new decoration type
    if (Math.random() < 0.15) {
      this.addBushSprite(x)
    }
    
    // Rocks (20% chance)
    if (Math.random() < 0.2) {
      const rockWidth = 15 + Math.random() * 10
      const rockHeight = 8 + Math.random() * 6
      const rock = this.add.ellipse(
        x + 20 + Math.random() * 60,
        this.groundLevel - rockHeight/2,
        rockWidth,
        rockHeight,
        0x6B6B6B
      )
      
      // Track rock for cleanup
      this.groundDecorations.push(rock)
      this.assetCounter.increment('rock', x)
    }
    
    // Grass patches (40% chance)
    if (Math.random() < 0.4) {
      for (let g = 0; g < 3 + Math.random() * 3; g++) {
        const grassHeight = 4 + Math.random() * 4
        const grass = this.add.rectangle(
          x + Math.random() * 100,
          this.groundLevel - grassHeight/2,
          2,
          grassHeight,
          0x4A7C59
        )
        
        // Track grass for cleanup
        this.groundDecorations.push(grass)
        this.assetCounter.increment('grass', x)
      }
    }
  }

  /**
   * Add tree sprite to ground decoration
   */
  private addTreeSprite(x: number): void {
    // Randomly choose between tree1 and tree2
    const treeType = Math.random() < 0.5 ? 'tree1' : 'tree2'
    
    // Try to use sprite assets first, fallback to generated textures
    const spriteKey = this.textures.exists(treeType) ? treeType : `${treeType}-fallback`
    
    // Position the tree
    const treeX = x + 50 + Math.random() * 50
    const tree = this.add.image(treeX, this.groundLevel, spriteKey)
    
    // Scale down the large sprites to appropriate game size
    const scale = treeType === 'tree1' ? 0.12 : 0.14 // Adjusted for different tree sizes
    tree.setScale(scale)
    
    // Position properly on ground (anchor to bottom)
    tree.setOrigin(0.5, 1)
    tree.setY(this.groundLevel)
    
    // Track tree for cleanup
    this.groundDecorations.push(tree)
    this.assetCounter.increment('tree', treeX)
  }

  /**
   * Add bush sprite to ground decoration
   */
  private addBushSprite(x: number): void {
    // Try to use sprite asset first, fallback to generated texture
    const spriteKey = this.textures.exists('bush') ? 'bush' : 'bush-fallback'
    
    // Position the bush
    const bushX = x + 25 + Math.random() * 75
    const bush = this.add.image(bushX, this.groundLevel, spriteKey)
    
    // Scale down the bush sprite to appropriate size (342x217 original)
    const scale = 0.08
    bush.setScale(scale)
    
    // Position properly on ground (anchor to bottom)
    bush.setOrigin(0.5, 1)
    bush.setY(this.groundLevel)
    
    // Track bush for cleanup
    this.groundDecorations.push(bush)
    this.assetCounter.increment('bush', bushX)
  }

  /**
   * Setup camera bounds and properties
   */
  private setupCamera(width: number, height: number): void {
    this.cameras.main.setBounds(0, 0, width * 2, height)
  }

  /**
   * Setup game objects and physics
   */
  private setupGameObjects(): void {
    this.createPlane()
    this.createPhysicsGroups()
    this.setupCollisions()
  }

  /**
   * Create and position the paper plane
   */
  private createPlane(): void {
    const { width } = this.cameras.main
    const planeX = width * 0.15
    const planeY = this.groundLevel - 25
    
    this.plane = new PaperPlane(this, planeX, planeY)
    this.plane.resetCrash()
  }

  /**
   * Create physics groups for rings and clouds
   */
  private createPhysicsGroups(): void {
    this.rings = this.physics.add.group({
      classType: Ring,
      runChildUpdate: true
    })

    this.clouds = this.physics.add.group({
      classType: Cloud,
      runChildUpdate: true
    })
  }

  /**
   * Setup collision detection
   */
  private setupCollisions(): void {
    this.physics.add.overlap(this.plane, this.rings, this.collectRing, undefined, this)
    this.physics.add.overlap(this.plane, this.clouds, this.hitCloud, undefined, this)
  }

  /**
   * Setup input controls
   */
  private setupInput(): void {
    // Mouse/touch input
    this.input.on('pointerdown', () => this.handleTap())

    // Keyboard input
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-UP', () => this.handleTap())
      this.input.keyboard.on('keydown-SPACE', () => this.handleTap())
      this.input.keyboard.on('keydown-R', () => {
        if (this.gameEnded) {
          // Use proper restart mechanism
          this.restartGameProperly()
        }
      })
      
      // Additional keyboard shortcuts for game over navigation
      this.input.keyboard.on('keydown-H', () => {
        if (this.gameEnded) {
          this.goToStartScene()
        }
      })
      
      this.input.keyboard.on('keydown-ENTER', () => {
        if (this.gameEnded) {
          // Use proper restart mechanism
          this.restartGameProperly()
        }
      })
    }
  }

  /**
   * Setup UI elements (score, distance, instructions)
   */
  private setupUI(): void {
    this.createScoreDisplays()
    this.createInstructions()
  }

  /**
   * Create score and distance displays
   */
  private createScoreDisplays(): void {
    const textStyle = {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: colors.primary
    }

    this.scoreText = this.add.text(20, 20, 'Score: 0', textStyle)
    this.scoreText.setScrollFactor(0)
    this.scoreText.setDepth(1000)

    this.distanceText = this.add.text(20, 50, 'Distance: 0m', textStyle)
    this.distanceText.setScrollFactor(0)
    this.distanceText.setDepth(1000)
  }

  /**
   * Create instruction text
   */
  private createInstructions(): void {
    const instructions = this.add.text(
      this.cameras.main.width / 2, 
      this.cameras.main.height - 40, 
      'TAP SPACE/UP/CLICK TO LAUNCH • TAP TO FLAP\nCOLLECT RINGS: BRONZE(20) SILVER(50) GOLD(100) • R TO RESTART',
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: colors.primary,
        align: 'center'
      }
    )
    
    instructions.setOrigin(0.5, 1)
    instructions.setScrollFactor(0)
    instructions.setDepth(1000)
    
    // Auto-hide instructions
    this.time.delayedCall(5000, () => {
      if (!this.isLaunched) {
        instructions.setAlpha(0.5)
      } else {
        instructions.destroy()
      }
    })
  }

  /**
   * Spawn initial rings for collection
   */
  private spawnInitialContent(): void {
    const { width } = this.cameras.main
    
    // Spawn scattered rings
    for (let i = 0; i < 4; i++) {
      const x = width + i * 200 + Math.random() * 150
      const y = this.groundLevel - 80 - Math.random() * 300
      
      const ring = new Ring(this, x, y)
      this.rings.add(ring)
      
      // Track ring creation
      this.assetCounter.increment('ring', x)
    }
  }

  /**
   * Handle tap for launch or flap
   */
  private handleTap(): void {
    if (!this.isLaunched) {
      this.launchPlane()
    } else {
      this.plane.flap()
    }
  }

  /**
   * Launch the plane and start camera follow
   */
  private launchPlane(): void {
    this.plane.launch(-Math.PI / 6, 2.25) // 30 degrees up
    this.isLaunched = true
    
    // Start camera follow
    this.cameras.main.startFollow(this.plane, true, 0.1, 0.1)
    const cameraWidth = this.cameras.main.width
    this.cameras.main.setDeadzone(cameraWidth * 0.4, 100)
    this.cameras.main.setFollowOffset(-cameraWidth * 0.1, 0)
  }

  /**
   * Handle ring collection
   */
  private collectRing(_plane: any, ring: any): void {
    const ringObj = ring as Ring
    if (!ringObj.isCollected()) {
      const reward = ringObj.collect()
      this.score += reward.score
    }
  }

  /**
   * Handle cloud collision
   */
  private hitCloud(_plane: any, cloud: any): void {
    if (this.gameEnded) return
    
    cloud.onCollision()
    this.plane.crashIntoCloud()
    console.log('Plane hit cloud!')
  }

  /**
   * Main update loop
   */
  public update(_time: number, delta: number): void {
    if (this.gameEnded) return
    
    const deltaTime = delta / 1000

    if (this.isLaunched) {
      this.updateGameplay(deltaTime)
    } else {
      this.keepPlaneAtStart()
    }

    this.updateUI()
  }

  /**
   * Update gameplay when plane is launched
   */
  private updateGameplay(deltaTime: number): void {
    this.plane.updatePhysics(deltaTime)
    
    // Update distance
    if (this.plane.x > 0) {
      this.distance = Math.max(this.distance, this.plane.x / 10)
    }

    this.extendWorldIfNeeded()
    this.spawnContentAhead()
    
    // STAGE 1: Clean up off-screen assets
    this.cleanupOffScreenAssets()
    
    // Check for crash
    if ((this.plane.hasCrashed() || this.plane.hasCrashedFromAnySource()) && !this.gameEnded) {
      this.endGame().catch(error => {
        console.warn('Failed to end game properly:', error)
      })
    }
  }

  /**
   * Keep plane at starting position before launch
   */
  private keepPlaneAtStart(): void {
    this.plane.setVelocity(0, 0)
    
    const { width } = this.cameras.main
    this.plane.x = width * 0.15
    this.plane.y = this.groundLevel - 25
    this.plane.setRotation(0)
  }

  /**
   * Extend world bounds, background, and ground as needed
   */
  private extendWorldIfNeeded(): void {
    const currentBounds = this.cameras.main.getBounds()
    
    // Extend camera bounds
    if (this.plane.x > currentBounds.width - this.cameras.main.width * 2) {
      const newWidth = this.plane.x + this.cameras.main.width * 3
      this.cameras.main.setBounds(0, 0, newWidth, currentBounds.height)
    }

    // Extend background
    if (this.plane.x > this.lastBackgroundX - this.cameras.main.width * 2) {
      const targetX = this.plane.x + this.cameras.main.width * 3
      this.createBackgroundSection(this.lastBackgroundX, targetX, this.cameras.main.height)
      this.lastBackgroundX = targetX
    }

    // Extend ground
    if (this.plane.x > this.lastGroundX - this.cameras.main.width * 2) {
      this.extendGround(this.plane.x + this.cameras.main.width * 3)
    }
  }

  /**
   * Spawn rings and clouds ahead of plane
   */
  private spawnContentAhead(): void {
    this.spawnRingsAhead()
    this.spawnCloudObstacles()
  }

  /**
   * Spawn rings ahead of the plane
   */
  private spawnRingsAhead(): void {
    const planeX = this.plane.x
    
    // Check if we need more rings
    const ringsAhead = this.rings.children.entries.filter(ring => 
      (ring as Ring).x > planeX + 500
    ).length

    if (ringsAhead < 3) {
      this.spawnRingPattern(planeX + 700 + Math.random() * 400)
    }
  }

  /**
   * Spawn different ring patterns
   */
  private spawnRingPattern(spawnX: number): void {
    const pattern = Math.random()
    
    if (pattern < 0.4) {
      this.spawnScatteredRings(spawnX)
    } else if (pattern < 0.7) {
      this.spawnVerticalRings(spawnX)
    } else {
      this.spawnArcRings(spawnX)
    }
  }

  /**
   * Spawn scattered individual rings
   */
  private spawnScatteredRings(spawnX: number): void {
    for (let i = 0; i < 1 + Math.random() * 2; i++) {
      const x = spawnX + i * (120 + Math.random() * 80)
      const y = this.groundLevel - 80 - Math.random() * 300
      
      if (this.isPositionSafeFromClouds(x, y)) {
        const ring = new Ring(this, x, y)
        this.rings.add(ring)
        this.assetCounter.increment('ring', x)
      }
    }
  }

  /**
   * Spawn vertical line of rings
   */
  private spawnVerticalRings(spawnX: number): void {
    const startY = this.groundLevel - 120
    for (let i = 0; i < 2; i++) {
      const y = startY - i * 80
      
      if (this.isPositionSafeFromClouds(spawnX, y)) {
        const ring = new Ring(this, spawnX, y)
        this.rings.add(ring)
        this.assetCounter.increment('ring', spawnX)
      }
    }
  }

  /**
   * Spawn arc pattern of rings
   */
  private spawnArcRings(spawnX: number): void {
    const centerY = this.groundLevel - 200
    const radius = 80
    
    for (let i = 0; i < 3; i++) {
      const angle = (i / 2) * Math.PI - Math.PI / 2
      const x = spawnX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      if (this.isPositionSafeFromClouds(x, y)) {
        const ring = new Ring(this, x, y)
        this.rings.add(ring)
        this.assetCounter.increment('ring', x)
      }
    }
  }

  /**
   * Check if position is safe distance from clouds
   */
  private isPositionSafeFromClouds(x: number, y: number): boolean {
    const minSafeDistance = 150
    
    for (const cloudObj of this.clouds.children.entries) {
      const cloud = cloudObj as Cloud
      const distance = Phaser.Math.Distance.Between(x, y, cloud.x, cloud.y)
      if (distance < minSafeDistance) {
        return false
      }
    }
    
    return true
  }

  /**
   * Spawn cloud obstacles with progressive difficulty
   */
  private spawnCloudObstacles(): void {
    const planeX = this.plane.x
    
    // Calculate difficulty-based spawn parameters
    const baseDistance = 2000
    const maxDifficulty = 600
    const difficultyDistance = 4000
    
    const difficultyFactor = Math.min(planeX / difficultyDistance, 1)
    const currentSpawnDistance = baseDistance - (baseDistance - maxDifficulty) * difficultyFactor
    
    // Check if we need more clouds
    const cloudsAhead = this.clouds.children.entries.filter(cloud => 
      (cloud as Cloud).x > planeX + 400
    ).length
    
    const targetCloudsAhead = Math.floor(1 + difficultyFactor * 1)
    
    if (cloudsAhead < targetCloudsAhead && planeX > this.lastCloudX - currentSpawnDistance) {
      this.spawnSingleCloud(planeX + 800 + Math.random() * 400)
      this.lastCloudX = planeX + 800
    }
  }

  /**
   * Spawn a single cloud obstacle
   */
  private spawnSingleCloud(baseX: number): void {
    const skyHeight = this.groundLevel - 100
    const minCloudY = 120
    const maxCloudY = skyHeight - 120
    
    const x = baseX
    const y = minCloudY + Math.random() * (maxCloudY - minCloudY)
    
    const cloud = new Cloud(this, x, y)
    this.clouds.add(cloud)
    this.assetCounter.increment('cloud', x)
  }

  /**
   * Clean up off-screen assets to prevent memory leaks and glitching
   */
  private cleanupOffScreenAssets(): void {
    const cameraX = this.cameras.main.scrollX
    
    // STAGE 1: Ground decoration cleanup
    if (this.cleanupManager.shouldCleanupGroundDecorations()) {
      this.cleanupGroundDecorations(cameraX)
    }
    
    // STAGE 2: Ring and cloud cleanup (implemented later)
    if (this.cleanupManager.shouldCleanupRings()) {
      this.cleanupRings(cameraX)
    }
    
    if (this.cleanupManager.shouldCleanupClouds()) {
      this.cleanupClouds(cameraX)
    }
    
    // STAGE 3: Background cleanup (implemented later)
    if (this.cleanupManager.shouldCleanupBackground()) {
      this.cleanupBackgroundSections(cameraX)
    }
  }
  
  /**
   * STAGE 1: Clean up ground decorations that are off-screen
   */
  private cleanupGroundDecorations(cameraX: number): void {
    const cleanupDistance = this.cleanupManager.getGroundCleanupDistance()
    const cleanupThreshold = cameraX - cleanupDistance
    
    let cleanedCount = 0
    
    // Filter out decorations that are too far behind the camera
    this.groundDecorations = this.groundDecorations.filter(decoration => {
      const decorationObj = decoration as any
      if (decorationObj.x < cleanupThreshold) {
        // Determine asset type for counter
        let assetType = 'decoration'
        if (decorationObj.texture) {
          const textureKey = decorationObj.texture.key
          if (textureKey.includes('tree')) assetType = 'tree'
          else if (textureKey.includes('bush')) assetType = 'bush'
          else if (decoration instanceof Phaser.GameObjects.Ellipse) assetType = 'rock'
          else if (decoration instanceof Phaser.GameObjects.Rectangle) assetType = 'grass'
        }
        
        // Destroy the decoration
        decoration.destroy()
        this.assetCounter.decrement(assetType)
        cleanedCount++
        
        return false // Remove from array
      }
      return true // Keep in array
    })
    
    if (cleanedCount > 0) {
      this.cleanupManager.logDebug(`Cleaned up ${cleanedCount} ground decorations, remaining: ${this.groundDecorations.length}`)
    }
  }
  
  /**
   * STAGE 2: Clean up rings that are off-screen
   */
  private cleanupRings(cameraX: number): void {
    const cleanupDistance = this.cleanupManager.getGameObjectCleanupDistance()
    const cleanupThreshold = cameraX - cleanupDistance
    
    let cleanedCount = 0
    
    this.rings.children.entries.forEach(ring => {
      const ringObj = ring as Ring
      if (ringObj.x < cleanupThreshold) {
        ringObj.destroy()
        this.assetCounter.decrement('ring')
        cleanedCount++
      }
    })
    
    if (cleanedCount > 0) {
      this.cleanupManager.logDebug(`Cleaned up ${cleanedCount} rings, remaining: ${this.rings.children.size}`)
    }
  }
  
  /**
   * STAGE 2: Clean up clouds that are off-screen
   */
  private cleanupClouds(cameraX: number): void {
    const cleanupDistance = this.cleanupManager.getGameObjectCleanupDistance()
    const cleanupThreshold = cameraX - cleanupDistance
    
    let cleanedCount = 0
    
    this.clouds.children.entries.forEach(cloud => {
      const cloudObj = cloud as Cloud
      if (cloudObj.x < cleanupThreshold) {
        cloudObj.destroy()
        this.assetCounter.decrement('cloud')
        cleanedCount++
      }
    })
    
    if (cleanedCount > 0) {
      this.cleanupManager.logDebug(`Cleaned up ${cleanedCount} clouds, remaining: ${this.clouds.children.size}`)
    }
  }
  
  /**
   * STAGE 3: Clean up background sections that are off-screen
   */
  private cleanupBackgroundSections(cameraX: number): void {
    const cleanupDistance = this.cleanupManager.getBackgroundCleanupDistance()
    const cleanupThreshold = cameraX - cleanupDistance
    
    let cleanedCount = 0
    
    this.backgroundSections = this.backgroundSections.filter(section => {
      if (section.x < cleanupThreshold) {
        section.destroy()
        this.assetCounter.decrement('background')
        cleanedCount++
        return false
      }
      return true
    })
    
    if (cleanedCount > 0) {
      this.cleanupManager.logDebug(`Cleaned up ${cleanedCount} background sections, remaining: ${this.backgroundSections.length}`)
    }
  }

  /**
   * Update UI elements
   */
  private updateUI(): void {
    if (this.scoreText?.active) {
      this.scoreText.setText(`Score: ${this.score}`)
      this.scoreText.setPosition(20, 20)
    }
    
    if (this.distanceText?.active) {
      this.distanceText.setText(`Distance: ${Math.floor(this.distance)}m`)
      this.distanceText.setPosition(20, 50)
    }
  }

  /**
   * End the game and show results
   */
  private async endGame(): Promise<void> {
    if (this.gameEnded) return
    this.gameEnded = true
    
    // Calculate final score and save it
    const finalScore = this.score + Math.floor(this.distance)
    
    console.log(`Game ended! Final Score: ${finalScore}, Distance: ${Math.floor(this.distance)}m`)
    
    // Stop camera and show game over screen immediately
    this.cameras.main.stopFollow()
    this.cameras.main.setScroll(this.cameras.main.scrollX, this.cameras.main.scrollY)
    
    // Save score and show game over screen
    try {
      const savedScore = await ScoreManager.saveScore(finalScore, Math.floor(this.distance), 'normal')
      console.log(`Score saved with rank: ${savedScore.rank}`)
      this.showGameOverScreen(savedScore)
    } catch (error) {
      console.warn('Failed to save score:', error)
      // Show game over screen with a basic score object if save fails
      const basicScore = {
        score: finalScore,
        distance: Math.floor(this.distance),
        timestamp: Date.now(),
        rank: 0,
        gameMode: 'normal',
        syncedToCloud: false
      }
      this.showGameOverScreen(basicScore)
    }
  }

  /**
   * Display game over screen with final score
   */
  private showGameOverScreen(savedScore: GameScore): void {
    const { width, height } = this.cameras.main
    const finalScore = savedScore.score
    const isNewPersonalBest = ScoreManager.isNewPersonalBest(finalScore)
    const authManager = AuthManager.getInstance()
    const currentUser = authManager.getCurrentUser()
    
    // Background overlay
    const gameOverBg = this.add.graphics()
    gameOverBg.fillStyle(0x000000, 0.7)
    gameOverBg.fillRect(0, 0, width, height)
    gameOverBg.setScrollFactor(0)
    
    // Game over text
    const gameOverText = this.add.text(width / 2, height / 2 - 120, 'GAME OVER', {
      fontFamily: typography.primary,
      fontSize: '24px',
      color: colors.primary,
      align: 'center'
    })
    gameOverText.setOrigin(0.5)
    gameOverText.setScrollFactor(0)
    
    // Personal best indicator
    if (isNewPersonalBest) {
      const newBestText = this.add.text(width / 2, height / 2 - 90, '★ NEW PERSONAL BEST! ★', {
        fontFamily: typography.primary,
        fontSize: '14px',
        color: colors.accent,
        align: 'center'
      })
      newBestText.setOrigin(0.5)
      newBestText.setScrollFactor(0)
      
      // Flashing effect for new best
      this.tweens.add({
        targets: newBestText,
        alpha: 0.3,
        duration: 600,
        yoyo: true,
        repeat: 3
      })
    }
    
    // Score display with ranking
    const scoreText = this.add.text(width / 2, height / 2 - 60, `FINAL SCORE: ${finalScore}`, {
      fontFamily: typography.primary,
      fontSize: '16px',
      color: colors.accent,
      align: 'center'
    })
    scoreText.setOrigin(0.5)
    scoreText.setScrollFactor(0)
    
    // Ranking display
    if (savedScore.rank) {
      const rankText = this.add.text(width / 2, height / 2 - 35, `Personal Rank: #${savedScore.rank}`, {
        fontFamily: typography.primary,
        fontSize: '12px',
        color: colors.white,
        align: 'center'
      })
      rankText.setOrigin(0.5)
      rankText.setScrollFactor(0)
    }
    
    // Distance display
    const distanceText = this.add.text(width / 2, height / 2 - 10, `DISTANCE: ${Math.floor(this.distance)}m`, {
      fontFamily: typography.primary,
      fontSize: '16px',
      color: colors.accent,
      align: 'center'
    })
    distanceText.setOrigin(0.5)
    distanceText.setScrollFactor(0)
    
    // Authentication-aware messaging and buttons
    this.createAuthAwareUI(width, height, currentUser)
    
    // Show top 3 personal scores with current game highlighted
    this.showTopPersonalScores(width, height, savedScore)
    
    // Navigation buttons
    this.createGameOverButtons(width, height, currentUser)
  }
  
  /**
   * Create authentication-aware UI elements
   */
  private createAuthAwareUI(_width: number, _height: number, _currentUser: any): void {
    // UI elements removed - no status message needed on game over screen
  }
  
  /**
   * Create game over navigation buttons
   * TEMPORARY: Authentication button temporarily disabled for frontend
   */
  private createGameOverButtons(width: number, height: number, _currentUser: any): void {
    const buttonY = height / 2 + 160  // Increased from 100 to 160 for more space
    const buttonSpacing = 130
    
    // Calculate proper center positioning for button pair
    // Each button is 100px wide, with 130px spacing between centers
    // Total spread: 130px, so each button is 65px from the pair's center
    const buttonPairCenter = width / 2
    const halfSpacing = buttonSpacing / 2
    
    // HOME button (always visible) - positioned left of center
    const homeButton = this.createGameOverButton(
      buttonPairCenter - halfSpacing,
      buttonY,
      'HOME',
      colors.primary,
      () => this.goToStartScene()
    )
    
    // RESTART button (always visible) - positioned right of center
    const restartButton = this.createGameOverButton(
      buttonPairCenter + halfSpacing,
      buttonY,
      'RESTART',
      colors.accent,
      () => this.restartGame()
    )
    
    // TEMPORARY: Authentication button temporarily disabled for frontend
    // TODO: Uncomment the following block to restore authentication/scores navigation
    /*
    // Authentication-aware third button
    if (!currentUser || currentUser.isGuest) {
      // LOGIN button for guests
      const authButtonText = 'LOGIN'
      this.createGameOverButton(
        width / 2 + buttonSpacing,
        buttonY,
        authButtonText,
        '#4CAF50',
        () => this.goToLogin()
      )
    } else {
      // VIEW SCORES button for authenticated users
      this.createGameOverButton(
        width / 2 + buttonSpacing,
        buttonY,
        'SCORES',
        '#666666',
        () => this.goToScores()
      )
    }
    */
    
    // Add helper text
    const helpText = this.add.text(width / 2, height / 2 + 200, 'CLICK ANY BUTTON OR PRESS R/SPACE/ENTER', {
      fontFamily: typography.primary,
      fontSize: '9px',
      color: colors.white,
      align: 'center'
    })
    helpText.setOrigin(0.5)
    helpText.setScrollFactor(0)
    helpText.setAlpha(0.7)
    
    // Flashing effect for buttons
    this.tweens.add({
      targets: [homeButton, restartButton],
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1
    })
  }
  
  /**
   * Create a styled game over button
   */
  private createGameOverButton(x: number, y: number, text: string, color: string, onClick: () => void): Phaser.GameObjects.Container {
    const buttonContainer = this.add.container(x, y)
    
    // Button background
    const bg = this.add.graphics()
    bg.fillStyle(parseInt(color.replace('#', ''), 16), 0.9)
    bg.lineStyle(2, parseInt(colors.white.replace('#', ''), 16), 1)
    bg.fillRoundedRect(-50, -20, 100, 40, 8)
    bg.strokeRoundedRect(-50, -20, 100, 40, 8)
    
    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: typography.primary,
      fontSize: '12px',
      color: colors.white,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    })
    buttonText.setOrigin(0.5, 0.5)
    
    buttonContainer.add([bg, buttonText])
    buttonContainer.setSize(100, 40)
    buttonContainer.setInteractive()
    buttonContainer.setScrollFactor(0)
    
    // Hover effects
    buttonContainer.on('pointerover', () => {
      buttonContainer.setScale(1.1)
    })
    
    buttonContainer.on('pointerout', () => {
      buttonContainer.setScale(1.0)
    })
    
    // Click handler
    buttonContainer.on('pointerdown', onClick)
    
    return buttonContainer
  }
  
  /**
   * Navigation methods
   */
  private goToStartScene(): void {
    console.log('Navigating to start scene...')
    this.scene.start('StartScene')
  }
  
  private restartGame(): void {
    console.log('Restarting game...')
    
    // Use proper restart or fallback to page reload
    this.restartGameProperly()
  }
  
  /**
   * TEMPORARY: Login and scores navigation temporarily disabled for frontend
   * TODO: Uncomment the following methods to restore navigation functionality
   */
  /*
  private goToLogin(): void {
    console.log('Navigating to login...')
    // For now, go to start scene where login functionality exists
    this.scene.start('StartScene')
  }
  
  private goToScores(): void {
    console.log('Navigating to scores...')
    this.scene.start('ScoresScene')
  }
  */
  
  /**
   * Show top 3 personal scores plus current game's score on game over screen
   */
  private showTopPersonalScores(width: number, height: number, currentScore: GameScore): void {
    const allScores = ScoreManager.getAllScores().sort((a, b) => b.score - a.score)
    const topScores = allScores.slice(0, 3)
    
    if (allScores.length > 0) {
      const topScoresText = this.add.text(width / 2, height / 2 + 35, 'YOUR TOP SCORES:', {
        fontFamily: typography.primary,
        fontSize: '10px',
        color: colors.white,
        align: 'center'
      })
      topScoresText.setOrigin(0.5)
      topScoresText.setScrollFactor(0)
      
      // Display top 3 scores
      topScores.forEach((score, index) => {
        const isCurrentGame = score.timestamp === currentScore.timestamp
        const textColor = isCurrentGame ? colors.accent : '#CCCCCC'  // Highlight current game
        
        const scoreEntry = this.add.text(
          width / 2, 
          height / 2 + 50 + (index * 12), 
          `${index + 1}. ${score.score} pts (${score.distance}m)${isCurrentGame ? ' ← Latest' : ''}`, 
          {
            fontFamily: typography.primary,
            fontSize: '9px',
            color: textColor,
            align: 'center'
          }
        )
        scoreEntry.setOrigin(0.5)
        scoreEntry.setScrollFactor(0)
      })
      
      // If current game is not in top 3, show it separately
      const currentGameRank = allScores.findIndex(s => s.timestamp === currentScore.timestamp) + 1
      if (currentGameRank > 3) {
        const currentGameEntry = this.add.text(
          width / 2, 
          height / 2 + 50 + (3 * 12) + 6, // Extra spacing
          `${currentGameRank}. ${currentScore.score} pts (${currentScore.distance}m) ← Latest`, 
          {
            fontFamily: typography.primary,
            fontSize: '9px',
            color: colors.accent,  // Highlighted color for current game
            align: 'center'
          }
        )
        currentGameEntry.setOrigin(0.5)
        currentGameEntry.setScrollFactor(0)
      }
    } else {
      // Show "No previous scores" if this is the first game
      const noScoresText = this.add.text(width / 2, height / 2 + 50, 'No previous scores\nThis is your first game!', {
        fontFamily: typography.primary,
        fontSize: '9px',
        color: colors.white,
        align: 'center'
      })
      noScoresText.setOrigin(0.5)
      noScoresText.setScrollFactor(0)
    }
  }
  
  /**
   * STAGE 4: Proper scene cleanup
   */
  public shutdown(): void {
    if (this.cleanupManager.getConfig().enableSceneCleanup) {
      this.cleanupManager.logDebug('Performing full scene cleanup')
      
      // Stop monitoring
      this.cleanupManager.stopMonitoring()
      
      // Clean up all tracked assets
      this.groundDecorations.forEach(decoration => {
        if (decoration && decoration.active) {
          decoration.destroy()
        }
      })
      this.groundDecorations = []
      
      this.backgroundSections.forEach(section => {
        if (section && section.active) {
          section.destroy()
        }
      })
      this.backgroundSections = []
      
      // Reset counters
      this.assetCounter.reset()
      
      this.cleanupManager.logDebug('Scene cleanup completed')
    }
  }
  
  /**
   * STAGE 5: Proper restart without page reload
   */
  private restartGameProperly(): void {
    if (this.cleanupManager.shouldUseProperRestart()) {
      this.cleanupManager.logDebug('Using proper restart mechanism')
      
      // Perform full cleanup first
      this.shutdown()
      
      // Restart the scene
      this.scene.restart()
    } else {
      // Fall back to page reload
      this.cleanupManager.logDebug('Using page reload restart (fallback)')
      localStorage.setItem('startGameDirectly', 'true')
      window.location.reload()
    }
  }
} 