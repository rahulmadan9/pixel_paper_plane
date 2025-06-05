/**
 * Button - Reusable button component for consistent UI styling
 * 
 * Provides:
 * - Consistent button styling across the game
 * - Multiple button styles (primary, secondary, etc.)
 * - Hover effects and interactive feedback
 * - Accessible button interactions
 */

import { colors, typography } from './DesignTokens'

export interface ButtonConfig {
  x: number
  y: number
  text: string
  width?: number
  height?: number
  style?: 'primary' | 'secondary' | 'accent' | 'danger'
  fontSize?: number
  onClick: () => void
}

export class Button {
  private container: Phaser.GameObjects.Container
  private background!: Phaser.GameObjects.Graphics
  private textObject!: Phaser.GameObjects.Text
  private shadowContainer: Phaser.GameObjects.Container
  
  private config: ButtonConfig
  
  constructor(scene: Phaser.Scene, config: ButtonConfig) {
    this.config = {
      width: 200,
      height: 50,
      style: 'primary',
      fontSize: 16,
      ...config
    }
    
    this.container = scene.add.container(this.config.x, this.config.y)
    this.shadowContainer = scene.add.container(this.config.x + 2, this.config.y + 2)
    
    this.createButton()
    this.setupInteractivity()
  }
  
  /**
   * Create the button visual elements
   */
  private createButton(): void {
    const { width, height, text, fontSize } = this.config
    
    // Create shadow
    const shadowBg = this.container.scene.add.graphics()
    shadowBg.fillStyle(0x000000, 0.3)
    shadowBg.fillRoundedRect(-width!/2, -height!/2, width!, height!, 8)
    this.shadowContainer.add(shadowBg)
    this.shadowContainer.setDepth(-1)
    
    // Create main button background
    this.background = this.container.scene.add.graphics()
    this.updateButtonStyle()
    
    // Create button text
    this.textObject = this.container.scene.add.text(0, 0, text, {
      fontFamily: typography.primary,
      fontSize: `${fontSize}px`,
      color: colors.white,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    })
    this.textObject.setOrigin(0.5, 0.5)
    
    this.container.add([this.background, this.textObject])
  }
  
  /**
   * Update button visual style based on current style setting
   */
  private updateButtonStyle(): void {
    const { width, height, style } = this.config
    
    this.background.clear()
    
    let fillColor: string
    let strokeColor = colors.white
    
    switch (style) {
      case 'primary':
        fillColor = colors.primary
        break
      case 'secondary':
        fillColor = '#666666'
        break
      case 'accent':
        fillColor = colors.accent
        break
      case 'danger':
        fillColor = '#CC5500'
        break
      default:
        fillColor = colors.primary
    }
    
    this.background.fillStyle(parseInt(fillColor.replace('#', ''), 16), 0.9)
    this.background.lineStyle(3, parseInt(strokeColor.replace('#', ''), 16), 1)
    this.background.fillRoundedRect(-width!/2, -height!/2, width!, height!, 8)
    this.background.strokeRoundedRect(-width!/2, -height!/2, width!, height!, 8)
  }
  
  /**
   * Setup button interactivity
   */
  private setupInteractivity(): void {
    const { width, height, onClick } = this.config
    
    this.container.setSize(width!, height!)
    this.container.setInteractive()
    
    // Click handler
    this.container.on('pointerdown', onClick)
    
    // Hover effects
    this.container.on('pointerover', () => {
      this.container.setScale(1.05)
      this.shadowContainer.setScale(1.05)
    })
    
    this.container.on('pointerout', () => {
      this.container.setScale(1.0)
      this.shadowContainer.setScale(1.0)
    })
    
    // Press feedback
    this.container.on('pointerdown', () => {
      this.container.setScale(0.98)
      this.shadowContainer.setScale(0.98)
    })
    
    this.container.on('pointerup', () => {
      this.container.setScale(1.05) // Return to hover state
      this.shadowContainer.setScale(1.05)
    })
  }
  
  /**
   * Update button text
   */
  public setText(text: string): void {
    this.textObject.setText(text)
    this.config.text = text
  }
  
  /**
   * Update button style
   */
  public setStyle(style: 'primary' | 'secondary' | 'accent' | 'danger'): void {
    this.config.style = style
    this.updateButtonStyle()
  }
  
  /**
   * Set button position
   */
  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y)
    this.shadowContainer.setPosition(x + 2, y + 2)
    this.config.x = x
    this.config.y = y
  }
  
  /**
   * Set button visibility
   */
  public setVisible(visible: boolean): void {
    this.container.setVisible(visible)
    this.shadowContainer.setVisible(visible)
  }
  
  /**
   * Enable or disable button
   */
  public setEnabled(enabled: boolean): void {
    this.container.setInteractive(enabled)
    this.container.setAlpha(enabled ? 1.0 : 0.5)
    this.shadowContainer.setAlpha(enabled ? 1.0 : 0.5)
  }
  
  /**
   * Get the container for advanced manipulation
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container
  }
  
  /**
   * Destroy the button
   */
  public destroy(): void {
    this.container.destroy()
    this.shadowContainer.destroy()
  }
} 