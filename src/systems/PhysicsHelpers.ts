/**
 * Physics helper functions for aerodynamic calculations
 * Used by the PaperPlane for realistic flight physics
 */

export interface Vector2 {
  x: number
  y: number
}

/**
 * Calculate lift force based on velocity and attack angle
 * @param velocity Current velocity vector
 * @param attackAngle Angle between plane and wind direction (radians)
 * @param liftCoefficient Coefficient of lift (default: 0.016)
 * @returns Lift force vector
 */
export const calculateLift = (
  velocity: Vector2,
  attackAngle: number,
  liftCoefficient: number = 0.016
): Vector2 => {
  const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
  const liftMagnitude = liftCoefficient * velocityMagnitude * velocityMagnitude * Math.sin(attackAngle)
  
  // Lift is perpendicular to velocity direction
  const velocityAngle = Math.atan2(velocity.y, velocity.x)
  const liftAngle = velocityAngle + Math.PI / 2
  
  return {
    x: Math.cos(liftAngle) * liftMagnitude,
    y: Math.sin(liftAngle) * liftMagnitude
  }
}

/**
 * Calculate drag force opposing motion
 * @param velocity Current velocity vector
 * @param dragCoefficient Coefficient of drag (default: 0.03)
 * @returns Drag force vector (opposing velocity)
 */
export const calculateDrag = (
  velocity: Vector2,
  dragCoefficient: number = 0.03
): Vector2 => {
  const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
  const dragMagnitude = dragCoefficient * velocityMagnitude * velocityMagnitude
  
  if (velocityMagnitude === 0) {
    return { x: 0, y: 0 }
  }
  
  // Drag opposes velocity direction
  const dragDirection = {
    x: -velocity.x / velocityMagnitude,
    y: -velocity.y / velocityMagnitude
  }
  
  return {
    x: dragDirection.x * dragMagnitude,
    y: dragDirection.y * dragMagnitude
  }
}

/**
 * Calculate attack angle between plane heading and wind direction
 * @param planeAngle Current plane rotation (radians)
 * @param windAngle Wind direction angle (radians)
 * @returns Attack angle clamped to ±45 degrees
 */
export const calculateAttackAngle = (planeAngle: number, windAngle: number): number => {
  let attackAngle = planeAngle - windAngle
  
  // Normalize to -π to π
  while (attackAngle > Math.PI) attackAngle -= 2 * Math.PI
  while (attackAngle < -Math.PI) attackAngle += 2 * Math.PI
  
  // Clamp to ±45 degrees
  const maxAngle = Math.PI / 4 // 45 degrees
  return Math.max(-maxAngle, Math.min(maxAngle, attackAngle))
}

/**
 * Apply force to velocity with time step
 * @param velocity Current velocity
 * @param force Force to apply
 * @param deltaTime Time step in seconds
 * @param mass Object mass (default: 1)
 * @returns New velocity
 */
export const applyForce = (
  velocity: Vector2,
  force: Vector2,
  deltaTime: number,
  mass: number = 1
): Vector2 => {
  const acceleration = {
    x: force.x / mass,
    y: force.y / mass
  }
  
  return {
    x: velocity.x + acceleration.x * deltaTime,
    y: velocity.y + acceleration.y * deltaTime
  }
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export const toRadians = (degrees: number): number => {
  return degrees * Math.PI / 180
}

/**
 * Convert radians to degrees
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
export const toDegrees = (radians: number): number => {
  return radians * 180 / Math.PI
} 