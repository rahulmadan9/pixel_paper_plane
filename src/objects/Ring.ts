import Phaser from 'phaser'

/**
 * Ring Types - Different point values and rarity levels
 */
export enum RingType {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold'
}

/**
 * Ring configuration for each type
 */
interface RingConfig {
  points: number
  spriteKey: string
  rarity: number // Spawn probability (0-1)
}

const RING_CONFIGS: Record<RingType, RingConfig> = {
  [RingType.BRONZE]: { points: 20, spriteKey: 'ringBronze', rarity: 0.7 },   // 70% chance
  [RingType.SILVER]: { points: 50, spriteKey: 'ringSilver', rarity: 0.25 },  // 25% chance
  [RingType.GOLD]: { points: 100, spriteKey: 'ringGold', rarity: 0.05 }      // 5% chance
}

/**
 * Ring - Collectible rings that provide points when collected
 * 
 * Features:
 * - Three types: Bronze (20pts), Silver (50pts), Gold (100pts)
 * - Sonic-style collection animation
 * - Floating and rotation animations
 * - Sparkle effects on collection
 */
export class Ring extends Phaser.Physics.Arcade.Sprite {
  private readonly ringType: RingType
  private readonly scoreValue: number
  private collected: boolean = false
  private rotationTween?: Phaser.Tweens.Tween
  private floatingTween?: Phaser.Tweens.Tween

  constructor(scene: Phaser.Scene, x: number, y: number, ringType?: RingType) {
    const selectedRingType = ringType || Ring.getRandomRingType()
    const config = RING_CONFIGS[selectedRingType]
    
    // Use sprite asset with fallback to generated texture
    const textureKey = scene.textures.exists(config.spriteKey) 
      ? config.spriteKey 
      : config.spriteKey + '-fallback'
    
    super(scene, x, y, textureKey)
    
    this.ringType = selectedRingType
    this.scoreValue = config.points
    
    this.setupPhysics()
    this.setupVisuals()
    this.startAnimations()
  }

  /**
   * Configure physics body for collection
   */
  private setupPhysics(): void {
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    
    const body = this.body as Phaser.Physics.Arcade.Body
    if (body) {
      // Circular collision area
      const radius = 300 * this.scaleX
      body.setCircle(radius)
    }
  }

  /**
   * Configure visual properties
   */
  private setupVisuals(): void {
    this.setScale(0.04) // Small scale for collectible rings
    this.setDepth(5) // Behind plane but above background
  }

  /**
   * Start floating and rotation animations
   */
  private startAnimations(): void {
    // Floating animation
    this.floatingTween = this.scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Rotation animation
    this.rotationTween = this.scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2,
      duration: 2000,
      repeat: -1,
      ease: 'none'
    })
  }

  /**
   * Get random ring type based on rarity
   */
  private static getRandomRingTypeInternal(): RingType {
    const rand = Math.random()
    
    if (rand < RING_CONFIGS[RingType.GOLD].rarity) {
      return RingType.GOLD
    } else if (rand < RING_CONFIGS[RingType.GOLD].rarity + RING_CONFIGS[RingType.SILVER].rarity) {
      return RingType.SILVER
    } else {
      return RingType.BRONZE
    }
  }

  /**
   * Collect the ring - Sonic-style animation and scoring
   */
  public collect(): { score: number } {
    if (this.collected) return { score: 0 }
    
    this.collected = true
    
    // Sonic-style collection animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => this.destroy()
    })

    this.createSparkleEffect()
    
    return { score: this.scoreValue }
  }

  /**
   * Create sparkle effect on collection
   */
  private createSparkleEffect(): void {
    const sparkleColors = {
      [RingType.BRONZE]: 0xCD7F32,
      [RingType.SILVER]: 0xC0C0C0,
      [RingType.GOLD]: 0xFFD700
    }
    
    const sparkleColor = sparkleColors[this.ringType]
    
    // Create sparkle particles
    for (let i = 0; i < 6; i++) {
      const sparkle = this.scene.add.circle(
        this.x + (Math.random() - 0.5) * 10,
        this.y + (Math.random() - 0.5) * 10,
        2,
        sparkleColor
      )
      sparkle.setDepth(10)
      
      // Animate sparkles
      this.scene.tweens.add({
        targets: sparkle,
        scale: 0,
        alpha: 0,
        x: sparkle.x + (Math.random() - 0.5) * 30,
        y: sparkle.y + (Math.random() - 0.5) * 30,
        duration: 300 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => sparkle.destroy()
      })
    }
  }

  /**
   * Public API methods
   */
  public isCollected(): boolean {
    return this.collected
  }

  public getScoreValue(): number {
    return this.scoreValue
  }

  public getRingType(): RingType {
    return this.ringType
  }

  public static getRandomRingType(): RingType {
    return Ring.getRandomRingTypeInternal()
  }

  /**
   * Clean up animations and destroy
   */
  public destroy(fromScene?: boolean): void {
    if (this.rotationTween) {
      this.rotationTween.destroy()
      this.rotationTween = undefined
    }
    
    if (this.floatingTween) {
      this.floatingTween.destroy()
      this.floatingTween = undefined
    }
    
    super.destroy(fromScene)
  }
} 