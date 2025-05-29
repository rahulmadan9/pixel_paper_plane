import Phaser from 'phaser'

/**
 * PaperPlane - The main player-controlled aircraft
 * Simple Flappy Bird-style physics with gravity and tap-to-flap mechanics
 */
export class PaperPlane extends Phaser.Physics.Arcade.Sprite {
  private flapForce: number = 350 // Upward impulse when flapping
  private forwardSpeed: number = 200 // Constant forward movement speed
  private hasCrashedFlag: boolean = false // Track crash state
  private maxRotation: number = Math.PI / 3 // Maximum rotation (60 degrees)

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number
  ) {
    // Try to use the sprite asset, fallback to generated texture if not available
    const textureKey = scene.textures.exists('plane') ? 'plane' : 'plane-fallback'
    super(scene, x, y, textureKey)
    
    // Add to scene and enable physics
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(false)
    body.setGravityY(800) // Strong downward gravity like Flappy Bird
    
    // Set collision area to match sprite (assuming 50x30 texture before scaling)
    // The setScale call will then scale this body down with the sprite.
    body.setSize(50, 50) 
    
    // Dynamically set scale so plane never exceeds 10% of screen area
    const cam = scene.cameras.main;
    const maxArea = cam.width * cam.height * 0.10;
    const planeArea = 50 * 30; // Texture size
    let scale = Math.sqrt(maxArea / planeArea);
    // Clamp scale to a reasonable range
    scale = Math.max(0.5, Math.min(scale, 2));
    
    // Reduce to 2.5% of current size
    scale = scale * 0.03;
    
    this.setScale(scale);
    this.setOrigin(0.5, 0.5);
    
    // Make sure plane is visible
    this.setDepth(10) // Render above background
  }

  /**
   * Launch the plane with initial velocity
   * @param angle Launch angle in radians
   * @param power Launch power (0-1)
   */
  public launch(angle: number, power: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Set initial forward speed and vertical velocity based on launch
    const baseSpeed = this.forwardSpeed
    const maxVerticalSpeed = 400
    
    // Apply forward momentum and vertical component
    const velocityX = baseSpeed + (power * 100) // Boost forward speed based on power
    const velocityY = Math.sin(angle) * power * maxVerticalSpeed // Vertical component
    
    body.setVelocity(velocityX, velocityY)
    
    // Set initial rotation based on launch angle, but constrained
    const constrainedAngle = Math.max(-this.maxRotation, Math.min(this.maxRotation, angle))
    this.setRotation(constrainedAngle)
  }

  /**
   * Flap - gives upward impulse (Flappy Bird style)
   */
  public flap(): void {
    if (this.hasCrashedFlag) return
    
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Give upward impulse (negative Y velocity)
    body.setVelocityY(-this.flapForce)
  }

  /**
   * Update plane physics - Flappy Bird style
   * @param deltaTime Time step in seconds
   */
  public updatePhysics(deltaTime: number): void {
    // Don't update physics if crashed
    if (this.hasCrashedFlag) return
    
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Maintain constant forward speed (rightward movement)
    body.setVelocityX(this.forwardSpeed)
    
    // Simple rotation based on vertical velocity (Flappy Bird style)
    const verticalVelocity = body.velocity.y
    
    // Calculate rotation based on vertical velocity
    // Positive Y velocity (falling) = nose down
    // Negative Y velocity (rising) = nose up
    let targetRotation = 0
    
    if (verticalVelocity < -100) {
      // Rising fast - nose up
      targetRotation = -this.maxRotation / 2 // 30 degrees up
    } else if (verticalVelocity > 200) {
      // Falling fast - nose down
      targetRotation = this.maxRotation / 2 // 30 degrees down
    } else {
      // Moderate speed - slight tilt based on velocity
      targetRotation = (verticalVelocity / 400) * this.maxRotation / 2
    }
    
    // Smooth rotation transition
    const currentRotation = this.rotation
    const rotationDiff = targetRotation - currentRotation
    
    // Apply rotation with smoothing
    const rotationSpeed = 0.15
    this.setRotation(currentRotation + rotationDiff * rotationSpeed)
  }

  /**
   * Get current distance traveled
   * @returns Distance from start position
   */
  public getDistance(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  /**
   * Check if plane has crashed (hit ground or obstacle)
   * @returns True if crashed
   */
  public hasCrashed(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Only check for crash if plane has been launched and is moving
    if (body.velocity.x < 10) return false // Don't crash if not moving
    
    const scene = this.scene as any
    // Use actual groundLevel from scene instead of camera height
    const groundLevel = scene.groundLevel || (scene.cameras.main.height - 60)
    
    // Check if plane hit the ground (plane bottom touches ground)
    const crashed = this.y >= groundLevel
    
    if (crashed && !this.hasCrashedFlag) {
      this.crash()
    }
    
    return crashed
  }

  /**
   * Handle crash - stop all physics and lock plane position
   */
  private crash(): void {
    this.hasCrashedFlag = true
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Stop all movement
    body.setVelocity(0, 0)
    body.setAcceleration(0, 0)
    
    // Lock plane at ground level
    const scene = this.scene as any
    const groundLevel = scene.groundLevel || (scene.cameras.main.height - 60)
    this.y = groundLevel
    
    // Set crashed rotation (nose down)
    this.setRotation(this.maxRotation / 2) // 30 degrees down
  }

  /**
   * Reset crash state for new game
   */
  public resetCrash(): void {
    this.hasCrashedFlag = false
  }

  // Legacy methods for compatibility - simplified or removed

  /**
   * Legacy method - now calls flap() for compatibility
   */
  public elevate(deltaTime: number): void {
    this.flap()
  }

  /**
   * Legacy method - no longer needed for Flappy Bird style
   */
  public stopElevating(): void {
    // No longer needed - flapping is instantaneous
  }

  /**
   * Legacy method - stamina system removed
   */
  public restoreStamina(amount: number): void {
    // Stamina system removed for simplicity
  }

  /**
   * Legacy method - stamina system removed
   */
  public getStaminaPercent(): number {
    return 1.0 // Always full stamina in Flappy Bird style
  }
} 