import { createNoise2D } from 'simplex-noise'

/**
 * WindField generates procedural wind currents using Perlin noise
 * Provides wind force vectors at any position in the game world
 */
export class WindField {
  private noise2D: (x: number, y: number) => number
  private scale: number = 0.01
  private strength: number = 120
  private time: number = 0

  constructor() {
    this.noise2D = createNoise2D()
  }

  /**
   * Update the wind field over time for dynamic effects
   * @param deltaTime Time passed since last update in seconds
   */
  public update(deltaTime: number): void {
    this.time += deltaTime * 0.5 // Slow time progression for subtle changes
  }

  /**
   * Sample wind force at a given position
   * @param x World X coordinate
   * @param y World Y coordinate
   * @returns Vector2 representing wind force (px/s²)
   */
  public sample(x: number, y: number): { x: number; y: number } {
    // Sample noise at different offsets for x and y components
    const noiseX = this.noise2D(x * this.scale, y * this.scale + this.time)
    const noiseY = this.noise2D(x * this.scale + 1000, y * this.scale + this.time)

    // Convert noise (-1 to 1) to wind force
    return {
      x: noiseX * this.strength,
      y: noiseY * this.strength * 0.3 // Reduce vertical wind component
    }
  }

  /**
   * Get wind direction as angle in radians
   * @param x World X coordinate
   * @param y World Y coordinate
   * @returns Angle in radians
   */
  public getWindAngle(x: number, y: number): number {
    const wind = this.sample(x, y)
    return Math.atan2(wind.y, wind.x)
  }

  /**
   * Get wind magnitude at position
   * @param x World X coordinate
   * @param y World Y coordinate
   * @returns Wind strength magnitude
   */
  public getWindMagnitude(x: number, y: number): number {
    const wind = this.sample(x, y)
    return Math.sqrt(wind.x * wind.x + wind.y * wind.y)
  }
} 