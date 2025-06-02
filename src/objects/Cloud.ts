import Phaser from 'phaser'

/**
 * Cloud Types - Available cloud variants
 */
export enum CloudType {
  CLOUD1 = 'cloud1',
  CLOUD2 = 'cloud2'
}

/**
 * Cloud configuration for different variants
 */
interface CloudConfig {
  imageKey: string
  opacity: number
  collisionScale: number // Collision box scale relative to visual size (for forgiving gameplay)
}

const CLOUD_CONFIGS: Record<CloudType, CloudConfig> = {
  [CloudType.CLOUD1]: {
    imageKey: 'cloud1',
    opacity: 0.85,
    collisionScale: 0.6 // 60% of visual size for forgiving collision
  },
  [CloudType.CLOUD2]: {
    imageKey: 'cloud2', 
    opacity: 0.85,
    collisionScale: 0.6
  }
}

/**
 * Cloud - Obstacle that causes plane crash on collision
 * 
 * Features:
 * - Uses custom pixel art cloud images with automatic fallback
 * - Precise collision detection with forgiving hitboxes
 * - Gentle floating animation for visual appeal
 * - Impact effects on collision
 */
export class Cloud extends Phaser.Physics.Arcade.Sprite {
  private readonly cloudType: CloudType
  private movementTween?: Phaser.Tweens.Tween
  private isDestroyed: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number, cloudType?: CloudType) {
    const type = cloudType || Cloud.getRandomCloudType()
    const config = CLOUD_CONFIGS[type]
    
    // Use cloud image asset with fallback to procedural if not available
    const textureKey = scene.textures.exists(config.imageKey) ? config.imageKey : 'cloud-fallback'
    super(scene, x, y, textureKey)
    
    this.cloudType = type
    this.setupPhysics(config)
    this.setupVisuals(config)
    this.startMovementAnimation()
  }

  /**
   * Configure physics body for collision detection
   */
  private setupPhysics(config: CloudConfig): void {
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    
    const body = this.body as Phaser.Physics.Arcade.Body
    if (body) {
      // Smaller collision box for forgiving gameplay (reduced by 10% overall)
      const collisionWidth = this.width * config.collisionScale * 0.10
      const collisionHeight = this.height * config.collisionScale * 0.10
      
      body.setSize(collisionWidth, collisionHeight)
      body.setOffset(
        (this.width - collisionWidth) / 2,
        (this.height - collisionHeight) / 2
      )
      
      body.setImmovable(true)
      body.setVelocity(0, 0)
    }
  }

  /**
   * Configure visual properties
   */
  private setupVisuals(config: CloudConfig): void {
    this.setOrigin(0.5, 0.5)
    this.setScale(0.2) // Reduced size (90% of original)
    this.setAlpha(config.opacity)
    this.setDepth(5) // Behind plane but above background
  }

  /**
   * Start gentle floating animation
   */
  private startMovementAnimation(): void {
    if (this.isDestroyed) return
    
    this.movementTween = this.scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 4000 + Math.random() * 3000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 1000
    })
  }

  /**
   * Handle collision with plane
   */
  public onCollision(): void {
    // No visual effects - silent collision
    return
  }

  /**
   * Get random cloud type for variety
   */
  public static getRandomCloudType(): CloudType {
    const types = Object.values(CloudType)
    return types[Math.floor(Math.random() * types.length)]
  }

  /**
   * Get this cloud's type
   */
  public getCloudType(): CloudType {
    return this.cloudType
  }

  /**
   * Clean up and destroy cloud
   */
  public destroy(fromScene?: boolean): void {
    if (this.isDestroyed) return
    this.isDestroyed = true
    
    if (this.movementTween) {
      this.movementTween.destroy()
      this.movementTween = undefined
    }
    
    super.destroy(fromScene)
  }
} 