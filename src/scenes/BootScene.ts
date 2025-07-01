import Phaser from 'phaser'
import { colors } from '@ui/DesignTokens'

/**
 * BootScene - Handles initial asset loading with progress bar
 * 
 * Features:
 * - Loading screen with progress bar
 * - Asset loading with fallback generation
 * - Google Fonts loading
 * - Error handling for missing assets
 */
export class BootScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics
  private progressBox!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'BootScene' })
  }

  public preload(): void {
    this.createLoadingScreen()
    this.setupLoadingEvents()
    this.loadAssets()
  }

  /**
   * Create visual loading screen
   */
  private createLoadingScreen(): void {
    const { width, height } = this.cameras.main

    this.createBackground(width, height)
    this.createProgressBar(width, height)
    this.createLoadingText(width, height)
  }

  /**
   * Create gradient background
   */
  private createBackground(width: number, height: number): void {
    const graphics = this.add.graphics()
    graphics.fillGradientStyle(
      parseInt(colors.skyTop.replace('#', ''), 16),
      parseInt(colors.skyTop.replace('#', ''), 16),
      parseInt(colors.skyBottom.replace('#', ''), 16),
      parseInt(colors.skyBottom.replace('#', ''), 16)
    )
    graphics.fillRect(0, 0, width, height)
  }

  /**
   * Create progress bar elements
   */
  private createProgressBar(width: number, height: number): void {
    // Progress bar background
    this.progressBox = this.add.graphics()
    this.progressBox.fillStyle(parseInt(colors.uiBg.replace('#', '').slice(0, 3), 16), 0.8)
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)

    // Progress bar fill
    this.loadingBar = this.add.graphics()
  }

  /**
   * Create loading text
   */
  private createLoadingText(width: number, height: number): void {
    this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: colors.primary
    }).setOrigin(0.5)
  }

  /**
   * Load all game assets
   */
  private loadAssets(): void {
    this.setupAssetErrorHandling()
    this.loadSpriteAssets()
    this.createFallbackAssets()
    this.loadWebFont()
  }

  /**
   * Setup error handling for missing assets
   */
  private setupAssetErrorHandling(): void {
    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load asset: ${file.key} from ${file.url}`)
    })
  }

  /**
   * Load sprite assets
   */
  private loadSpriteAssets(): void {
    // Plane sprite
    this.load.image('plane', 'assets/sprites/plane_right.png')
    
    // Ring sprites
    this.load.image('ringGold', 'assets/sprites/ring_gold.png')
    this.load.image('ringSilver', 'assets/sprites/ring_silver.png')
    this.load.image('ringBronze', 'assets/sprites/ring_bronze.png')
    
    // Cloud sprites
    this.load.image('cloud1', 'assets/sprites/cloud1.png')
    this.load.image('cloud2', 'assets/sprites/cloud2.png')
    
    // Tree and bush sprites
    this.load.image('tree1', 'assets/sprites/tree1.png')
    this.load.image('tree2', 'assets/sprites/tree2.png')
    this.load.image('bush', 'assets/sprites/bush.png')
  }

  /**
   * Create fallback assets programmatically
   */
  private createFallbackAssets(): void {
    this.createFallbackPlane()
    this.createFallbackRings()
    this.createFallbackClouds()
    this.createFallbackTrees()
    this.createGroundTexture()
  }

  /**
   * Create fallback plane sprite
   */
  private createFallbackPlane(): void {
    const graphics = this.add.graphics()
    graphics.fillStyle(0x377DFF)
    
    // Draw plane shape
    graphics.beginPath()
    graphics.moveTo(20, 0)      // nose (pointing right)
    graphics.lineTo(-10, 12)    // bottom wing
    graphics.lineTo(-5, 3)      // bottom wing tip
    graphics.lineTo(-5, -3)     // top wing tip  
    graphics.lineTo(-10, -12)   // top wing
    graphics.lineTo(20, 0)      // back to nose
    graphics.closePath()
    graphics.fillPath()
    
    // Add white centerline
    graphics.lineStyle(2, 0xFFFFFF)
    graphics.beginPath()
    graphics.moveTo(20, 0)
    graphics.lineTo(-8, 0)
    graphics.strokePath()
    
    graphics.generateTexture('plane-fallback', 50, 30)
    graphics.destroy()
  }

  /**
   * Create fallback ring textures
   */
  private createFallbackRings(): void {
    this.createFallbackRing('ringBronze-fallback', 0xCD7F32)
    this.createFallbackRing('ringSilver-fallback', 0xC0C0C0)
    this.createFallbackRing('ringGold-fallback', 0xFFD700)
  }

  /**
   * Create individual fallback ring
   */
  private createFallbackRing(key: string, color: number): void {
    const graphics = this.add.graphics()
    
    // Outer ring
    graphics.lineStyle(4, color, 1)
    graphics.strokeCircle(0, 0, 15)
    
    // Inner highlight for 3D effect
    graphics.lineStyle(2, 0xFFFFFF, 0.8)
    graphics.strokeCircle(0, 0, 12)
    
    // Inner shadow for depth
    graphics.lineStyle(2, 0x000000, 0.4)
    graphics.strokeCircle(0, 0, 8)
    
    graphics.generateTexture(key, 32, 32)
    graphics.destroy()
  }

  /**
   * Create fallback cloud textures
   */
  private createFallbackClouds(): void {
    this.createFallbackCloud('cloud1-fallback', 'small')
    this.createFallbackCloud('cloud2-fallback', 'wide')
    this.createFallbackCloud('cloud-fallback', 'small') // Generic fallback
  }

  /**
   * Create individual fallback cloud
   */
  private createFallbackCloud(key: string, variant: 'small' | 'wide'): void {
    const graphics = this.add.graphics()
    graphics.fillStyle(0xFFFFFF, 0.8)
    
    if (variant === 'small') {
      this.drawSmallCloud(graphics)
      graphics.generateTexture(key, 80, 50)
    } else {
      this.drawWideCloud(graphics)
      graphics.generateTexture(key, 100, 40)
    }
    
    graphics.destroy()
  }

  /**
   * Draw small puffy cloud shape
   */
  private drawSmallCloud(graphics: Phaser.GameObjects.Graphics): void {
    graphics.beginPath()
    // Main body
    graphics.arc(40, 30, 18, 0, Math.PI * 2)
    // Left puff
    graphics.arc(25, 25, 12, 0, Math.PI * 2)
    // Right puff  
    graphics.arc(55, 25, 12, 0, Math.PI * 2)
    // Top puff
    graphics.arc(40, 15, 10, 0, Math.PI * 2)
    // Bottom extensions
    graphics.arc(35, 35, 8, 0, Math.PI * 2)
    graphics.arc(45, 35, 8, 0, Math.PI * 2)
    graphics.fill()
  }

  /**
   * Draw wide flat cloud shape
   */
  private drawWideCloud(graphics: Phaser.GameObjects.Graphics): void {
    graphics.beginPath()
    // Main body
    graphics.arc(50, 25, 20, 0, Math.PI * 2)
    // Left section
    graphics.arc(25, 25, 15, 0, Math.PI * 2)
    // Right section
    graphics.arc(75, 25, 15, 0, Math.PI * 2)
    // Top bumps
    graphics.arc(35, 15, 8, 0, Math.PI * 2)
    graphics.arc(50, 12, 10, 0, Math.PI * 2)
    graphics.arc(65, 15, 8, 0, Math.PI * 2)
    graphics.fill()
  }

  /**
   * Create fallback tree and bush textures
   */
  private createFallbackTrees(): void {
    this.createFallbackTree('tree1-fallback', 'tall')
    this.createFallbackTree('tree2-fallback', 'wide')
    this.createFallbackBush('bush-fallback')
  }

  /**
   * Create individual fallback tree
   */
  private createFallbackTree(key: string, variant: 'tall' | 'wide'): void {
    const graphics = this.add.graphics()
    
    if (variant === 'tall') {
      // Tall tree (425x663 style)
      this.drawTallTree(graphics)
      graphics.generateTexture(key, 60, 100)
    } else {
      // Wide tree (490x625 style)
      this.drawWideTree(graphics)
      graphics.generateTexture(key, 70, 90)
    }
    
    graphics.destroy()
  }

  /**
   * Draw tall tree shape
   */
  private drawTallTree(graphics: Phaser.GameObjects.Graphics): void {
    // Tree trunk
    graphics.fillStyle(0x654321) // Brown trunk
    graphics.fillRect(25, 70, 10, 30)
    
    // Tree foliage layers (from bottom to top)
    graphics.fillStyle(0x2D5016) // Dark green
    graphics.fillEllipse(30, 65, 35, 25)
    
    graphics.fillStyle(0x4A7C59) // Medium green
    graphics.fillEllipse(30, 50, 30, 20)
    
    graphics.fillStyle(0x6FAB80) // Light green
    graphics.fillEllipse(30, 35, 25, 15)
    
    // Tree top
    graphics.fillStyle(0x4A7C59)
    graphics.fillEllipse(30, 25, 20, 12)
  }

  /**
   * Draw wide tree shape
   */
  private drawWideTree(graphics: Phaser.GameObjects.Graphics): void {
    // Tree trunk
    graphics.fillStyle(0x654321) // Brown trunk
    graphics.fillRect(30, 65, 12, 25)
    
    // Wide canopy layers
    graphics.fillStyle(0x2D5016) // Dark green
    graphics.fillEllipse(35, 60, 45, 20)
    
    graphics.fillStyle(0x4A7C59) // Medium green
    graphics.fillEllipse(35, 50, 40, 18)
    
    graphics.fillStyle(0x6FAB80) // Light green
    graphics.fillEllipse(35, 40, 35, 15)
    
    // Side branches
    graphics.fillStyle(0x4A7C59)
    graphics.fillEllipse(20, 55, 15, 8)
    graphics.fillEllipse(50, 55, 15, 8)
  }

  /**
   * Create fallback bush texture
   */
  private createFallbackBush(key: string): void {
    const graphics = this.add.graphics()
    
    this.drawBush(graphics)
    graphics.generateTexture(key, 50, 30)
    graphics.destroy()
  }

  /**
   * Draw bush shape
   */
  private drawBush(graphics: Phaser.GameObjects.Graphics): void {
    // Bush base
    graphics.fillStyle(0x4A7C59) // Medium green
    graphics.fillEllipse(25, 20, 40, 15)
    
    // Bush clusters
    graphics.fillStyle(0x6FAB80) // Light green
    graphics.fillEllipse(15, 15, 18, 12)
    graphics.fillEllipse(35, 15, 18, 12)
    
    // Top details
    graphics.fillStyle(0x2D5016) // Dark green accents
    graphics.fillEllipse(12, 12, 8, 6)
    graphics.fillEllipse(25, 10, 10, 7)
    graphics.fillEllipse(38, 12, 8, 6)
  }

  /**
   * Create ground texture
   */
  private createGroundTexture(): void {
    const graphics = this.add.graphics()
    
    // Draw ground pattern with dirt texture
    graphics.fillStyle(0x8B4513) // Brown dirt
    graphics.fillRect(0, 0, 100, 60)
    
    // Add texture lines
    graphics.lineStyle(1, 0x654321, 0.6)
    for (let i = 0; i < 8; i++) {
      graphics.beginPath()
      graphics.moveTo(Math.random() * 100, Math.random() * 60)
      graphics.lineTo(Math.random() * 100, Math.random() * 60)
      graphics.strokePath()
    }
    
    // Add small stones
    graphics.fillStyle(0x696969, 0.8)
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 100
      const y = Math.random() * 60
      graphics.fillCircle(x, y, 1 + Math.random() * 2)
    }
    
    graphics.generateTexture('ground', 100, 60)
    graphics.destroy()
  }

  /**
   * Load Google Fonts
   */
  private loadWebFont(): void {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js')
  }

  /**
   * Setup loading progress events
   */
  private setupLoadingEvents(): void {
    this.load.on('progress', (progress: number) => {
      this.updateProgressBar(progress)
    })

    this.load.on('complete', () => {
      this.handleLoadComplete()
    })
  }

  /**
   * Update progress bar visual
   */
  private updateProgressBar(progress: number): void {
    this.loadingBar.clear()
    this.loadingBar.fillStyle(parseInt(colors.primary.replace('#', ''), 16))
    this.loadingBar.fillRect(
      this.cameras.main.width / 2 - 150,
      this.cameras.main.height / 2 - 15,
      300 * progress,
      30
    )
  }

  /**
   * Handle loading completion
   */
  private handleLoadComplete(): void {
    this.loadWebFontAndStart()
  }

  /**
   * Load web font and start game
   */
  private loadWebFontAndStart(): void {
    if (typeof (window as any).WebFont !== 'undefined') {
      (window as any).WebFont.load({
        google: {
          families: ['Press Start 2P']
        },
        active: () => this.startGame(),
        inactive: () => this.startGame() // Start anyway if font fails
      })
    } else {
      this.startGame()
    }
  }

  /**
   * Start the main game scene
   */
  private startGame(): void {
    this.time.delayedCall(500, () => {
      this.scene.start('StartScene')
    })
  }
} 