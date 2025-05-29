import Phaser from 'phaser'

/**
 * Ring types for different point values and rarity
 */
export enum RingType {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold'
}

/**
 * Ring configuration for different types
 */
interface RingConfig {
  points: number
  spriteKey: string
  rarity: number // Lower number = rarer (0-1)
}

const RING_CONFIGS: Record<RingType, RingConfig> = {
  [RingType.BRONZE]: { points: 20, spriteKey: 'ringBronze', rarity: 0.7 },   // 70% chance
  [RingType.SILVER]: { points: 50, spriteKey: 'ringSilver', rarity: 0.25 },  // 25% chance
  [RingType.GOLD]: { points: 100, spriteKey: 'ringGold', rarity: 0.05 }     // 5% chance
}

/**
 * SonicRing - Collectible rings inspired by Sonic the Hedgehog
 * Three types: Bronze (20pts), Silver (50pts), Gold (100pts)
 * Disappear when collected and provide points
 */
export class Ring extends Phaser.Physics.Arcade.Sprite {
  private ringType: RingType
  private scoreValue: number
  private collected: boolean = false
  private ringRadius: number = 300 // Collision radius should be relative to the original texture size.
  private rotationTween?: Phaser.Tweens.Tween
  private floatingTween?: Phaser.Tweens.Tween

  constructor(scene: Phaser.Scene, x: number, y: number, ringType?: RingType) {
    // Determine ring type (random if not specified)
    const selectedRingType = ringType || Ring.getRandomRingType()
    const config = RING_CONFIGS[selectedRingType]
    
    // Try to use the sprite asset, fallback to generated texture if not available
    let textureKey = config.spriteKey
    if (!scene.textures.exists(config.spriteKey)) {
      textureKey = config.spriteKey + '-fallback'
    }
    
    // Create sprite with the appropriate ring asset or fallback
    super(scene, x, y, textureKey)
    
    this.ringType = selectedRingType
    this.scoreValue = config.points
    
    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCircle(this.ringRadius)
    body.setImmovable(true)
    
    // Set visual properties
    this.setOrigin(0.5, 0.5)
    this.setScale(0.04) // Reduced to 5% of current size (was 0.8)
    
    // Set depth to render above background but below plane
    this.setDepth(5)
    
    // Add continuous rotation animation and store reference
    this.rotationTween = scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2,
      duration: 2000,
      repeat: -1,
      ease: 'none'
    })
    
    // Add subtle floating animation and store reference
    this.floatingTween = scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  /**
   * Get a random ring type based on rarity
   */
  private static getRandomRingTypeInternal(): RingType {
    const rand = Math.random()
    
    // Check from rarest to most common
    if (rand < RING_CONFIGS[RingType.GOLD].rarity) {
      return RingType.GOLD
    } else if (rand < RING_CONFIGS[RingType.GOLD].rarity + RING_CONFIGS[RingType.SILVER].rarity) {
      return RingType.SILVER
    } else {
      return RingType.BRONZE
    }
  }

  /**
   * Collect the ring - Sonic style
   * @returns Object with score value
   */
  public collect(): { score: number; stamina: number } {
    if (this.collected) return { score: 0, stamina: 0 }
    
    this.collected = true
    
    // Play collection sound effect (if available)
    // this.scene.sound.play('ring_collect')
    
    // Sonic-style collection animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.destroy()
      }
    })

    // Create sparkle effect
    this.createSparkleEffect()
    
    return {
      score: this.scoreValue,
      stamina: 0 // No stamina in new system
    }
  }

  /**
   * Create sparkle effect when ring is collected
   */
  private createSparkleEffect(): void {
    // Get color based on ring type
    let sparkleColor = 0xFFD700 // Default gold
    switch (this.ringType) {
      case RingType.BRONZE:
        sparkleColor = 0xCD7F32
        break
      case RingType.SILVER:
        sparkleColor = 0xC0C0C0
        break
      case RingType.GOLD:
        sparkleColor = 0xFFD700
        break
    }
    
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
   * Check if ring is collected
   */
  public isCollected(): boolean {
    return this.collected
  }

  /**
   * Get the score value of this ring
   */
  public getScoreValue(): number {
    return this.scoreValue
  }

  /**
   * Get the ring type
   */
  public getRingType(): RingType {
    return this.ringType
  }

  /**
   * Get stamina restore value (legacy compatibility)
   */
  public getStaminaRestore(): number {
    return 0 // No stamina system in Sonic-style rings
  }

  /**
   * Static method to get random ring type for spawning
   */
  public static getRandomRingType(): RingType {
    return Ring.getRandomRingTypeInternal()
  }

  /**
   * Override destroy method to properly clean up tweens
   */
  public destroy(fromScene?: boolean): void {
    // Clean up tweens to prevent flickering issues during scene restarts
    if (this.rotationTween && !this.rotationTween.isDestroyed()) {
      this.rotationTween.destroy()
      this.rotationTween = undefined
    }
    
    if (this.floatingTween && !this.floatingTween.isDestroyed()) {
      this.floatingTween.destroy()
      this.floatingTween = undefined
    }
    
    // Call parent destroy
    super.destroy(fromScene)
  }
} 