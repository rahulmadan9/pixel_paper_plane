import Phaser from 'phaser'

/**
 * PaperPlane - The main player-controlled aircraft
 * 
 * Implements Flappy Bird-style physics:
 * - Constant forward movement
 * - Gravity pulls the plane down
 * - Tapping provides upward impulse (flapping)
 * - Rotation based on vertical velocity
 */
export class PaperPlane extends Phaser.Physics.Arcade.Sprite {
  // Physics constants
  private readonly flapForce: number = 350
  private readonly forwardSpeed: number = 200
  private readonly maxRotation: number = Math.PI / 3 // 60 degrees

  // State tracking
  private hasCrashedFlag: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Use sprite asset with fallback to generated texture
    const textureKey = scene.textures.exists('plane') ? 'plane' : 'plane-fallback'
    super(scene, x, y, textureKey)
    
    this.setupPhysics()
    this.setupVisuals()
  }

  /**
   * Configure physics properties
   */
  private setupPhysics(): void {
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(false)
    body.setGravityY(800) // Strong downward gravity
  }

  /**
   * Configure visual properties
   */
  private setupVisuals(): void {
    this.setOrigin(0.5, 0.5)
    this.setScale(0.06) // Small scale for Flappy Bird feel
    this.setDepth(10) // Render above rings and ground
  }

  /**
   * Launch the plane with initial velocity
   */
  public launch(angle: number, power: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Calculate launch velocities
    const velocityX = this.forwardSpeed + (power * 150)
    const velocityY = Math.sin(angle) * power * 800
    
    body.setVelocity(velocityX, velocityY)
    
    // Set initial rotation (constrained)
    const constrainedAngle = Math.max(-this.maxRotation, Math.min(this.maxRotation, angle))
    this.setRotation(constrainedAngle)
  }

  /**
   * Apply upward impulse (Flappy Bird-style flap)
   */
  public flap(): void {
    if (this.hasCrashedFlag) return
    
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setVelocityY(-this.flapForce)
  }

  /**
   * Update plane physics and rotation each frame
   */
  public updatePhysics(_deltaTime: number): void {
    if (this.hasCrashedFlag) return
    
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Check for top boundary collision and handle bounce
    this.checkTopBoundaryCollision()
    
    // Maintain constant forward speed
    body.setVelocityX(this.forwardSpeed)
    
    // Update rotation based on vertical velocity
    this.updateRotation(body.velocity.y)
  }

  /**
   * Update plane rotation based on vertical velocity
   */
  private updateRotation(verticalVelocity: number): void {
    let targetRotation = 0
    
    if (verticalVelocity < -100) {
      targetRotation = -this.maxRotation / 2 // Nose up when rising
    } else if (verticalVelocity > 200) {
      targetRotation = this.maxRotation / 2 // Nose down when falling
    } else {
      targetRotation = (verticalVelocity / 400) * this.maxRotation / 2
    }
    
    // Smooth rotation transition
    const rotationDiff = targetRotation - this.rotation
    this.setRotation(this.rotation + rotationDiff * 0.15)
  }

  /**
   * Check if plane has crashed into ground
   */
  public hasCrashed(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Only check if plane is moving
    if (body.velocity.x < 10) return false
    
    const scene = this.scene as any
    const groundLevel = scene.groundLevel || (scene.cameras.main.height - 60)
    
    const crashed = this.y >= groundLevel
    if (crashed && !this.hasCrashedFlag) {
      this.crashIntoGround()
    }
    
    return crashed
  }
 
  /**
   * Check for top boundary collision and handle bounce
   */
  private checkTopBoundaryCollision(): void {
    const scene = this.scene as any
    const screenHeight = scene.cameras.main.height
    
    // Check if plane has hit or exceeded the top boundary
    if (this.y <= 0) {
      this.handleTopBoundaryBounce(screenHeight)
    }
  }

  /**
   * Handle top boundary collision with immediate bounce down
   */
  private handleTopBoundaryBounce(screenHeight: number): void {
    // Calculate 5% of screen height for bounce distance
    const bounceDistance = screenHeight * 0.25
    
    // Immediately position the plane 5% down from the top edge
    this.y = bounceDistance
    
    // Note: We don't set hasCrashedFlag as this is a non-punitive bounce
    // Note: We don't modify velocity to maintain existing physics behavior
  }

  /**
   * Handle ground collision
   */
  private crashIntoGround(): void {
    this.hasCrashedFlag = true
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Stop movement and lock to ground
    body.setVelocity(0, 0)
    body.setAcceleration(0, 0)
    
    const scene = this.scene as any
    const groundLevel = scene.groundLevel || (scene.cameras.main.height - 60)
    this.y = groundLevel
    this.setRotation(this.maxRotation / 2) // Nose down
  }

  /**
   * Handle cloud collision - different from ground crash
   */
  public crashIntoCloud(): void {
    if (this.hasCrashedFlag) return
    
    this.hasCrashedFlag = true
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // Stop movement immediately
    body.setVelocity(0, 0)
    body.setAcceleration(0, 0)
    
    // Dramatic crash rotation
    this.setRotation(this.maxRotation)
  }

  /**
   * Check if plane has crashed from any source
   */
  public hasCrashedFromAnySource(): boolean {
    return this.hasCrashedFlag
  }

  /**
   * Reset crash state for new game
   */
  public resetCrash(): void {
    this.hasCrashedFlag = false
  }

  /**
   * Get current distance traveled
   */
  public getDistance(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
} 