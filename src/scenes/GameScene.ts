import Phaser from 'phaser'
import { PaperPlane } from '@objects/PaperPlane'
import { Ring, RingType } from '@objects/Ring'
import { colors } from '@ui/DesignTokens'

/**
 * GameScene - Main gameplay scene
 * Handles plane physics, Sonic-style ring collection, and scoring
 */
export class GameScene extends Phaser.Scene {
  private plane!: PaperPlane
  private rings!: Phaser.Physics.Arcade.Group
  private mountains!: Phaser.Physics.Arcade.StaticGroup
  private score: number = 0
  private distance: number = 0
  private isLaunched: boolean = false
  private launchPower: number = 0
  private launchAngle: number = 0
  private isCharging: boolean = false
  private chargingStartTime: number = 0
  private gameEnded: boolean = false
  private groundLevel: number = 0 // Track ground level
  private lastGroundX: number = 0 // Track last ground position for dynamic extension
  private lastBackgroundX: number = 0 // Track last background position for dynamic extension
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text
  private distanceText!: Phaser.GameObjects.Text
  private launchIndicator!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'GameScene' })
  }

  /**
   * Initialize scene - reset all values
   */
  public init(): void {
    // Reset all game state
    this.score = 0
    this.distance = 0
    this.isLaunched = false
    this.launchPower = 0
    this.launchAngle = 0
    this.isCharging = false
    this.chargingStartTime = 0
    this.gameEnded = false
  }

  /**
   * Create game objects and setup physics
   */
  public create(): void {
    this.setupBackground()
    this.setupGround()
    this.setupPhysics()
    this.setupInput()
    this.setupUI()
    this.spawnInitialRings()
  }

  /**
   * Setup gradient background across the entire game world
   */
  private setupBackground(): void {
    const { width, height } = this.cameras.main
    
    // Create initial background for a few screens
    this.lastBackgroundX = width * 3
    this.createBackground(0, this.lastBackgroundX, height)
  }

  /**
   * Create background gradient for specified range
   */
  private createBackground(startX: number, endX: number, height: number): void {
    const graphics = this.add.graphics()
    
    // Create background across the specified range
    graphics.fillGradientStyle(
      parseInt(colors.skyTop.replace('#', ''), 16),
      parseInt(colors.skyTop.replace('#', ''), 16),
      parseInt(colors.skyBottom.replace('#', ''), 16),
      parseInt(colors.skyBottom.replace('#', ''), 16)
    )
    graphics.fillRect(startX, 0, endX - startX, height)
  }

  /**
   * Setup ground tiles across the game world with proper alignment
   */
  private setupGround(): void {
    const { width, height } = this.cameras.main
    this.groundLevel = height - 60 // Ground collision boundary is 60px from bottom
    
    // Create initial ground tiles (only for the first few screens)
    this.lastGroundX = 0
    this.extendGround(width * 3) // Create initial ground for 3 screen widths
  }

  /**
   * Extend ground tiles to the specified x position
   */
  private extendGround(targetX: number): void {
    const { height } = this.cameras.main
    
    // Create ground tiles from lastGroundX to targetX
    for (let x = this.lastGroundX; x < targetX; x += 100) {
      const groundTile = this.add.image(x, this.groundLevel, 'ground')
      groundTile.setOrigin(0, 0) // Ground starts at groundLevel
      groundTile.setScale(1, 1)
      
      // Add ground variety every few tiles (only before mountains start at 800m)
      if (x < 8000 && Math.random() < 0.3) { // 8000px = 800m
        // Add trees - position them to sit ON the ground (groundLevel)
        const treeHeight = 40 + Math.random() * 30
        const tree = this.add.rectangle(
          x + 50 + Math.random() * 50, 
          this.groundLevel - treeHeight/2, // Tree bottom at groundLevel
          8, 
          treeHeight, 
          0x2D5016
        )
        
        // Tree top
        const treeTop = this.add.circle(
          tree.x, 
          tree.y - treeHeight/2 + 5, 
          12 + Math.random() * 8, 
          0x4A7C59
        )
      }
      
      // Add rocks occasionally - position them ON the ground (only before mountains)
      if (x < 8000 && Math.random() < 0.2) {
        const rockWidth = 15 + Math.random() * 10
        const rockHeight = 8 + Math.random() * 6
        const rock = this.add.ellipse(
          x + 20 + Math.random() * 60,
          this.groundLevel - rockHeight/2, // Rock bottom at groundLevel
          rockWidth,
          rockHeight,
          0x6B6B6B
        )
      }
      
      // Add grass patches - position them just above the ground (only before mountains)
      if (x < 8000 && Math.random() < 0.4) {
        for (let g = 0; g < 3 + Math.random() * 3; g++) {
          const grassHeight = 4 + Math.random() * 4
          const grass = this.add.rectangle(
            x + Math.random() * 100,
            this.groundLevel - grassHeight/2, // Grass bottom at groundLevel
            2,
            grassHeight,
            0x4A7C59
          )
        }
      }
    }
    
    this.lastGroundX = targetX
  }

  /**
   * Setup physics world and objects
   */
  private setupPhysics(): void {
    // Create paper plane on the ground - make sure it's visible and properly sized
    const { width, height } = this.cameras.main
    
    this.plane = new PaperPlane(this, width * 0.15, this.groundLevel - 25)
    
    // Reset crash state for fresh start
    this.plane.resetCrash()
    
    // Set initial camera bounds - will be extended dynamically as plane progresses
    this.cameras.main.setBounds(0, 0, width * 2, height)

    // Create rings group
    this.rings = this.physics.add.group({
      classType: Ring,
      runChildUpdate: true
    })

    // Create mountains group for obstacles
    this.mountains = this.physics.add.staticGroup()

    // Setup collision detection
    this.physics.add.overlap(this.plane, this.rings, this.collectRing, undefined, this)
    this.physics.add.overlap(this.plane, this.mountains, this.hitMountain, undefined, this)
  }

  /**
   * Setup input handling for launch and flap (Flappy Bird style)
   */
  private setupInput(): void {
    // Mouse/touch input for launch and flap
    this.input.on('pointerdown', this.startCharging, this)
    this.input.on('pointerup', this.handleRelease, this)
    this.input.on('pointermove', this.updateLaunchAngle, this)

    // Enhanced keyboard input for desktop - simplified for Flappy Bird style
    if (this.input.keyboard) {
      // Primary flap controls - single keydown events for instant flap
      this.input.keyboard.on('keydown-UP', () => {
        if (this.isLaunched) {
          this.plane.flap()
        }
      })
      
      this.input.keyboard.on('keydown-SPACE', () => {
        if (this.isLaunched) {
          this.plane.flap()
        }
      })

      // W key for alternative WASD users
      this.input.keyboard.on('keydown-W', () => {
        if (this.isLaunched) {
          this.plane.flap()
        }
      })

      // R key for quick restart after game over
      this.input.keyboard.on('keydown-R', () => {
        if (this.gameEnded) {
          this.scene.restart()
        }
      })

      // ESC key for pause (future feature)
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.isLaunched && !this.gameEnded) {
          // Pause functionality to be implemented
          console.log('Pause requested (ESC)')
        }
      })
    }
  }

  /**
   * Setup UI elements
   */
  private setupUI(): void {
    // Score display
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: colors.primary
    })
    this.scoreText.setScrollFactor(0) // Keep fixed to camera
    this.scoreText.setDepth(1000) // Ensure it's always on top

    // Distance display
    this.distanceText = this.add.text(20, 50, 'Distance: 0m', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: colors.primary
    })
    this.distanceText.setScrollFactor(0) // Keep fixed to camera
    this.distanceText.setDepth(1000) // Ensure it's always on top

    // Launch indicator
    this.launchIndicator = this.add.graphics()
    
    // Instructions - updated for new mechanics
    const instructions = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 40, 
      'DRAG TO AIM & LAUNCH • TAP TO FLAP\nCOLLECT RINGS: BRONZE(20) SILVER(50) GOLD(100) • R TO RESTART', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: colors.primary,
      align: 'center'
    })
    instructions.setOrigin(0.5, 1)
    instructions.setScrollFactor(0)
    instructions.setDepth(1000) // Ensure instructions are also on top
    
    // Hide instructions after launch
    this.time.delayedCall(5000, () => {
      if (!this.isLaunched) {
        instructions.setAlpha(0.5)
      } else {
        instructions.destroy()
      }
    })
  }

  /**
   * Spawn initial Sonic-style rings for collection
   */
  private spawnInitialRings(): void {
    const { width } = this.cameras.main
    
    // Spawn scattered rings in the sky at various heights (reduced to 25% of previous)
    for (let i = 0; i < 4; i++) { // Reduced from 15 to 4
      const x = width + i * 200 + Math.random() * 150 // More spread out
      const y = this.groundLevel - 80 - Math.random() * 300 // 80-380px above ground
      
      // Use random ring type based on rarity - keeping this random for gameplay variety
      const ring = new Ring(this, x, y)
      this.rings.add(ring)
    }
  }

  /**
   * Start charging launch power or flap during flight
   */
  private startCharging(pointer: Phaser.Input.Pointer): void {
    if (!this.isLaunched) {
      // Start charging for launch
      this.isCharging = true
      this.chargingStartTime = this.time.now
      this.launchAngle = this.calculateLaunchAngle(pointer)
    } else {
      // Flap during flight
      this.plane.flap()
    }
  }

  /**
   * Handle pointer release for launch or flap
   */
  private handleRelease(): void {
    if (this.isCharging && !this.isLaunched) {
      // Launch the plane
      this.launchPower = Math.min((this.time.now - this.chargingStartTime) / 1000, 2) / 2 // Max 2 seconds
      this.plane.launch(this.launchAngle, this.launchPower)
      this.isLaunched = true
      this.isCharging = false
      this.launchIndicator.clear()
      
      // Start following the plane with camera positioned at 40% from left
      this.cameras.main.startFollow(this.plane, true, 0.1, 0.1)
      // Set deadzone so plane appears at 40% from left (40% of screen width from center)
      const cameraWidth = this.cameras.main.width
      this.cameras.main.setDeadzone(cameraWidth * 0.4, 100)
      this.cameras.main.setFollowOffset(-cameraWidth * 0.1, 0) // Offset to position plane at 40%
    } else if (this.isLaunched) {
      // In Flappy Bird style, flapping is instantaneous - no need to stop
      // The flap happens on pointerdown, not pointer release
    }
  }

  /**
   * Update launch angle based on pointer position
   */
  private updateLaunchAngle(pointer: Phaser.Input.Pointer): void {
    if (this.isCharging) {
      this.launchAngle = this.calculateLaunchAngle(pointer)
    }
  }

  /**
   * Calculate launch angle from plane to pointer
   */
  private calculateLaunchAngle(pointer: Phaser.Input.Pointer): number {
    const dx = pointer.x - this.plane.x
    const dy = pointer.y - this.plane.y
    return Math.atan2(dy, dx)
  }

  /**
   * Handle ring collection - updated for new ring system
   */
  private collectRing(_plane: any, ring: any): void {
    const ringObj = ring as Ring
    if (!ringObj.isCollected()) {
      const reward = ringObj.collect()
      this.score += reward.score
      // No more stamina restoration
    }
  }

  /**
   * Handle mountain collision - game over
   */
  private hitMountain(_plane: any, _mountain: any): void {
    if (!this.gameEnded) {
      this.endGame()
    }
  }

  /**
   * Update game state
   */
  public update(_time: number, delta: number): void {
    // Don't update if game ended
    if (this.gameEnded) return
    
    const deltaTime = delta / 1000

    if (this.isLaunched) {
      // In Flappy Bird style, flapping is handled by keydown/pointerdown events
      // No continuous input handling needed here

      // Update plane physics
      this.plane.updatePhysics(deltaTime)

      // Update distance - only if plane is moving forward
      if (this.plane.x > 0) {
        this.distance = Math.max(this.distance, this.plane.x / 10) // Convert to meters
      }

      // Dynamically extend camera bounds as plane progresses
      const currentBounds = this.cameras.main.getBounds()
      if (this.plane.x > currentBounds.width - this.cameras.main.width * 2) {
        // Extend bounds by 2 screen widths when plane gets close to the edge
        const newWidth = this.plane.x + this.cameras.main.width * 3
        this.cameras.main.setBounds(0, 0, newWidth, currentBounds.height)
      }

      // Dynamically extend background as plane progresses
      if (this.plane.x > this.lastBackgroundX - this.cameras.main.width * 2) {
        const targetX = this.plane.x + this.cameras.main.width * 3
        this.createBackground(this.lastBackgroundX, targetX, this.cameras.main.height)
        this.lastBackgroundX = targetX
      }

      // Dynamically extend ground as plane progresses
      if (this.plane.x > this.lastGroundX - this.cameras.main.width * 2) {
        this.extendGround(this.plane.x + this.cameras.main.width * 3)
      }

      // Spawn mountains starting from 800m (8000px)
      this.spawnMountains()

      // Check for crash - only if game hasn't ended
      if (this.plane.hasCrashed() && !this.gameEnded) {
        this.endGame()
      }

      // Spawn more rings as needed
      this.spawnRingsAhead()
    } else {
      // If not launched, keep plane at initial position and zero velocity
      const { width } = this.cameras.main
      this.plane.setVelocity(0, 0)
      this.plane.x = width * 0.15
      this.plane.y = this.groundLevel - 25
    }

    // Update UI
    this.updateUI()

    // Draw launch indicator
    if (this.isCharging && !this.isLaunched) {
      this.drawLaunchIndicator()
    }
  }

  /**
   * Spawn Sonic-style rings ahead of the plane
   */
  private spawnRingsAhead(): void {
    const planeX = this.plane.x
    
    // Check if we need more rings ahead (reduced to 25% of previous)
    const ringsAhead = this.rings.children.entries.filter(ring => 
      (ring as Ring).x > planeX + 500
    ).length

    if (ringsAhead < 3) { // Reduced from 12 to 3
      // Spawn rings in various patterns (reduced quantities)
      const spawnX = planeX + 700 + Math.random() * 400
      
      // Different spawn patterns with fewer rings
      const pattern = Math.random()
      
      if (pattern < 0.4) {
        // Scattered individual rings (fewer)
        for (let i = 0; i < 1 + Math.random() * 2; i++) { // 1-2 rings instead of 3-5
          const x = spawnX + i * (120 + Math.random() * 80)
          const y = this.groundLevel - 80 - Math.random() * 300
          
          const ring = new Ring(this, x, y)
          this.rings.add(ring)
        }
      } else if (pattern < 0.7) {
        // Vertical line of rings (shorter)
        const x = spawnX
        const startY = this.groundLevel - 120
        for (let i = 0; i < 2; i++) { // 2 rings instead of 4
          const y = startY - i * 80
          const ring = new Ring(this, x, y)
          this.rings.add(ring)
        }
      } else {
        // Arc pattern (smaller)
        const centerX = spawnX
        const centerY = this.groundLevel - 200
        const radius = 80
        for (let i = 0; i < 3; i++) { // 3 rings instead of 5
          const angle = (i / 2) * Math.PI - Math.PI / 2 // Smaller arc
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          
          const ring = new Ring(this, x, y)
          this.rings.add(ring)
        }
      }
    }
    
    // Spawn sky obstacles periodically
    this.spawnSkyObstacles()
  }

  /**
   * Spawn obstacles in the sky
   */
  private spawnSkyObstacles(): void {
    const planeX = this.plane.x
    
    // Check if we need more obstacles
    const lastObstacle = this.children.list
      .filter(child => child.getData && child.getData('type') === 'obstacle')
      .sort((a, b) => (b as any).x - (a as any).x)[0]
    
    const lastObstacleX = lastObstacle ? (lastObstacle as any).x : 0
    
    if (planeX > lastObstacleX - 800) {
      // Spawn cloud obstacles
      const obstacleX = planeX + 800 + Math.random() * 200
      const obstacleY = this.groundLevel - 80 - Math.random() * 200
      
      // Create cloud obstacle (visual only for now)
      const cloud = this.add.ellipse(obstacleX, obstacleY, 120, 60, 0xFFFFFF, 0.6)
      cloud.setData('type', 'obstacle')
      
      // Add slight movement to clouds
      this.tweens.add({
        targets: cloud,
        x: cloud.x - 20,
        duration: 8000 + Math.random() * 4000,
        repeat: -1,
        yoyo: true
      })
    }
  }

  /**
   * Spawn mountain obstacles starting from 800m with progressive difficulty
   */
  private spawnMountains(): void {
    const planeX = this.plane.x
    
    // Only spawn mountains after 800m (8000px)
    if (planeX < 7500) return // Start spawning when approaching 800m
    
    // Check if we need more mountains ahead
    const mountainsAhead = this.mountains.children.entries.filter(mountain => 
      (mountain as any).x > planeX + 500
    ).length

    if (mountainsAhead < 2) {
      // Calculate difficulty based on distance (progressive difficulty)
      const distanceInKm = (planeX / 10) / 1000 // Convert to kilometers
      const difficulty = Math.min(distanceInKm - 0.8, 3) // Start at 0.8km, max difficulty at 3.8km
      
      // Spawn mountain ahead of plane
      const spawnX = planeX + 600 + Math.random() * 400
      
      // Different mountain patterns based on difficulty
      if (difficulty < 0.5) {
        // Easy: Single small mountain
        this.createMountain(spawnX, 80 + Math.random() * 40, 120 + Math.random() * 60)
      } else if (difficulty < 1.5) {
        // Medium: Larger mountain or double mountain
        if (Math.random() < 0.6) {
          this.createMountain(spawnX, 120 + Math.random() * 60, 150 + Math.random() * 80)
        } else {
          // Double mountain
          this.createMountain(spawnX, 100 + Math.random() * 40, 100 + Math.random() * 40)
          this.createMountain(spawnX + 200 + Math.random() * 100, 80 + Math.random() * 40, 120 + Math.random() * 40)
        }
      } else {
        // Hard: Complex mountain ranges
        const mountainCount = 2 + Math.floor(Math.random() * 3) // 2-4 mountains
        for (let i = 0; i < mountainCount; i++) {
          const x = spawnX + i * (100 + Math.random() * 80)
          const height = 60 + Math.random() * 120
          const width = 80 + Math.random() * 100
          this.createMountain(x, height, width)
        }
      }
    }
  }

  /**
   * Create a triangular mountain obstacle
   */
  private createMountain(x: number, height: number, width: number): void {
    // Create triangular mountain graphic
    const mountain = this.add.graphics()
    mountain.fillStyle(0x8B4513) // Brown color for mountains
    mountain.beginPath()
    mountain.moveTo(x - width/2, this.groundLevel) // Bottom left
    mountain.lineTo(x + width/2, this.groundLevel) // Bottom right
    mountain.lineTo(x, this.groundLevel - height) // Top peak
    mountain.closePath()
    mountain.fillPath()
    
    // Add snow cap for taller mountains
    if (height > 100) {
      mountain.fillStyle(0xFFFFFF)
      const snowHeight = height * 0.3
      mountain.beginPath()
      mountain.moveTo(x - width/6, this.groundLevel - height + snowHeight)
      mountain.lineTo(x + width/6, this.groundLevel - height + snowHeight)
      mountain.lineTo(x, this.groundLevel - height)
      mountain.closePath()
      mountain.fillPath()
    }
    
    // Create physics body for collision
    const mountainBody = this.add.zone(x, this.groundLevel - height/2, width, height)
    this.physics.add.existing(mountainBody, true) // true = static body
    mountainBody.setData('type', 'mountain')
    
    // Add to mountains group
    this.mountains.add(mountainBody)
    
    // Set depth so mountains appear behind plane but above ground
    mountain.setDepth(5)
  }

  /**
   * Update UI elements - removed stamina bar
   */
  private updateUI(): void {
    // Ensure UI elements exist and are visible
    if (this.scoreText && this.scoreText.active) {
      this.scoreText.setText(`Score: ${this.score}`)
      this.scoreText.setVisible(true)
      this.scoreText.setAlpha(1)
      // Ensure position stays fixed to top-left
      this.scoreText.setPosition(20, 20)
    }
    
    if (this.distanceText && this.distanceText.active) {
      this.distanceText.setText(`Distance: ${Math.floor(this.distance)}m`)
      this.distanceText.setVisible(true)
      this.distanceText.setAlpha(1)
      // Ensure position stays fixed to top-left
      this.distanceText.setPosition(20, 50)
    }
    
    // Stamina bar removed - no longer needed in Sonic-style system
  }

  /**
   * Draw launch power and angle indicator
   */
  private drawLaunchIndicator(): void {
    this.launchIndicator.clear()
    
    const chargeDuration = this.time.now - this.chargingStartTime
    const power = Math.min(chargeDuration / 1000, 2) / 2 // Max 2 seconds
    
    // Draw launch line
    this.launchIndicator.lineStyle(3, parseInt(colors.primary.replace('#', ''), 16))
    const lineLength = 100 * power
    const endX = this.plane.x + Math.cos(this.launchAngle) * lineLength
    const endY = this.plane.y + Math.sin(this.launchAngle) * lineLength
    
    this.launchIndicator.lineBetween(this.plane.x, this.plane.y, endX, endY)
    
    // Draw power circle
    this.launchIndicator.lineStyle(2, parseInt(colors.accent.replace('#', ''), 16))
    this.launchIndicator.strokeCircle(this.plane.x, this.plane.y, 20 + power * 30)

    // Add a visible arrow from the plane to the pointer when aiming
    const pointer = this.input.activePointer
    this.launchIndicator.lineStyle(4, 0xFFD447, 1)
    this.launchIndicator.beginPath()
    this.launchIndicator.moveTo(this.plane.x, this.plane.y)
    this.launchIndicator.lineTo(pointer.x, pointer.y)
    this.launchIndicator.strokePath()
  }

  /**
   * End the game and show results
   */
  private endGame(): void {
    // Prevent multiple calls
    if (this.gameEnded) return
    this.gameEnded = true
    
    // Stop camera follow immediately and lock it in place
    this.cameras.main.stopFollow()
    this.cameras.main.setScroll(this.cameras.main.scrollX, this.cameras.main.scrollY)
    
    // Show game over screen
    const { width, height } = this.cameras.main
    const gameOverBg = this.add.graphics()
    gameOverBg.fillStyle(0x000000, 0.7)
    gameOverBg.fillRect(0, 0, width, height)
    gameOverBg.setScrollFactor(0)
    
    const finalScore = this.score + Math.floor(this.distance)
    
    const gameOverText = this.add.text(width / 2, height / 2 - 60, 'GAME OVER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: colors.primary,
      align: 'center'
    })
    gameOverText.setOrigin(0.5)
    gameOverText.setScrollFactor(0)
    
    const scoreText = this.add.text(width / 2, height / 2 - 20, `FINAL SCORE: ${finalScore}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: colors.accent,
      align: 'center'
    })
    scoreText.setOrigin(0.5)
    scoreText.setScrollFactor(0)
    
    const distanceText = this.add.text(width / 2, height / 2 + 10, `DISTANCE: ${Math.floor(this.distance)}m`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: colors.accent,
      align: 'center'
    })
    distanceText.setOrigin(0.5)
    distanceText.setScrollFactor(0)
    
    const restartText = this.add.text(width / 2, height / 2 + 50, 'CLICK TO RESTART', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: colors.primary,
      align: 'center'
    })
    restartText.setOrigin(0.5)
    restartText.setScrollFactor(0)
    
    // Flashing restart text
    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    })
    
    // Enable restart on click - add delay to prevent immediate restart
    this.time.delayedCall(1000, () => {
      console.log('Restart functionality enabled')
      
      // CRITICAL FIX: Instead of scene.restart(), use window.location.reload()
      // This mimics the fresh page load behavior that works perfectly
      const restartGame = () => {
        console.log('Restarting game via page reload...')
        window.location.reload()
      }
      
      // Mouse/touch restart
      this.input.once('pointerdown', restartGame)
      
      // Keyboard restart (R key)
      if (this.input.keyboard) {
        this.input.keyboard.once('keydown-R', restartGame)
        this.input.keyboard.once('keydown-SPACE', restartGame)
        this.input.keyboard.once('keydown-ENTER', restartGame)
      }
    })
    
    console.log(`Game Over! Score: ${finalScore}, Distance: ${Math.floor(this.distance)}m`)
  }
} 