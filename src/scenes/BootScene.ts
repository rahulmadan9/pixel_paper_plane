import Phaser from 'phaser'
import { colors } from '@ui/DesignTokens'

/**
 * BootScene - Handles initial asset loading with progress bar
 * Loads sprites, sounds, and fonts before starting the game
 */
export class BootScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics
  private progressBox!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'BootScene' })
  }

  /**
   * Preload all game assets
   */
  public preload(): void {
    this.createLoadingScreen()
    this.setupLoadingEvents()
    this.loadAssets()
  }

  /**
   * Create visual loading screen with progress bar
   */
  private createLoadingScreen(): void {
    const { width, height } = this.cameras.main

    // Background gradient
    const graphics = this.add.graphics()
    graphics.fillGradientStyle(
      parseInt(colors.skyTop.replace('#', ''), 16),
      parseInt(colors.skyTop.replace('#', ''), 16),
      parseInt(colors.skyBottom.replace('#', ''), 16),
      parseInt(colors.skyBottom.replace('#', ''), 16)
    )
    graphics.fillRect(0, 0, width, height)

    // Progress bar background
    this.progressBox = this.add.graphics()
    this.progressBox.fillStyle(parseInt(colors.uiBg.replace('#', '').slice(0, 3), 16), 0.8)
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)

    // Progress bar fill
    this.loadingBar = this.add.graphics()

    // Loading text
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
    // Add error handling for missing assets
    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load asset: ${file.key} from ${file.url}`)
    })

    // ✨ Try to load the sprite assets first
    this.load.image("plane", "assets/sprites/plane_right.png");
    this.load.image("ringGold", "assets/sprites/ring_gold.png");
    this.load.image("ringSilver", "assets/sprites/ring_silver.png");
    this.load.image("ringBronze", "assets/sprites/ring_bronze.png");
    
    // Create fallback assets in case sprites are missing
    this.createFallbackAssets()
    
    // Load Google Fonts
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js')
  }

  /**
   * Create fallback assets programmatically
   */
  private createFallbackAssets(): void {
    // Create fallback plane sprite
    const planeGraphics = this.add.graphics()
    planeGraphics.fillStyle(0x377DFF) // Primary blue color
    planeGraphics.beginPath()
    planeGraphics.moveTo(20, 0)      // nose (pointing right)
    planeGraphics.lineTo(-10, 12)    // bottom wing
    planeGraphics.lineTo(-5, 3)      // bottom wing tip
    planeGraphics.lineTo(-5, -3)     // top wing tip  
    planeGraphics.lineTo(-10, -12)   // top wing
    planeGraphics.lineTo(20, 0)      // back to nose
    planeGraphics.closePath()
    planeGraphics.fillPath()
    
    // Add white details
    planeGraphics.lineStyle(2, 0xFFFFFF)
    planeGraphics.beginPath()
    planeGraphics.moveTo(20, 0)
    planeGraphics.lineTo(-8, 0)
    planeGraphics.strokePath()
    
    // Generate fallback plane texture
    planeGraphics.generateTexture('plane-fallback', 50, 30)
    planeGraphics.destroy()

    // Create fallback ring textures
    this.createFallbackRing('ringBronze-fallback', 0xCD7F32) // Bronze
    this.createFallbackRing('ringSilver-fallback', 0xC0C0C0) // Silver  
    this.createFallbackRing('ringGold-fallback', 0xFFD700)   // Gold
    
    // Create ground texture
    this.createGroundTexture()
  }

  /**
   * Create a fallback ring texture
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
    
    // Generate texture
    graphics.generateTexture(key, 32, 32)
    graphics.destroy()
  }

  /**
   * Create ground texture
   */
  private createGroundTexture(): void {
    const graphics = this.add.graphics()
    
    // Draw ground pattern
    graphics.fillStyle(0x4A5D23) // Dark green for ground
    graphics.fillRect(0, 0, 100, 50)
    
    // Add some texture dots
    graphics.fillStyle(0x5D7129) // Lighter green dots
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 100
      const y = Math.random() * 50
      graphics.fillCircle(x, y, 2)
    }
    
    // Generate texture
    graphics.generateTexture('ground', 100, 50)
    graphics.destroy()
  }

  /**
   * Setup loading progress events
   */
  private setupLoadingEvents(): void {
    this.load.on('progress', (value: number) => {
      this.loadingBar.clear()
      this.loadingBar.fillStyle(parseInt(colors.primary.replace('#', ''), 16))
      this.loadingBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 - 15,
        300 * value,
        30
      )
    })

    this.load.on('complete', () => {
      this.loadingBar.destroy()
      this.progressBox.destroy()
      this.loadWebFont()
    })
  }

  /**
   * Load web font and start game
   */
  private loadWebFont(): void {
    const WebFont = (window as any).WebFont
    
    if (WebFont) {
      WebFont.load({
        google: {
          families: ['Press Start 2P']
        },
        active: () => {
          this.startGame()
        },
        inactive: () => {
          // Fallback if font fails to load
          this.startGame()
        }
      })
    } else {
      this.startGame()
    }
  }

  /**
   * Start the main game
   */
  private startGame(): void {
    this.scene.start('GameScene')
  }
} 