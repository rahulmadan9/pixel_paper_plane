/**
 * ScoreManager - Handles score persistence and ranking
 * Session-based storage with localStorage backup
 */

export interface GameScore {
  score: number
  distance: number
  timestamp: number
  rank?: number
  sessionId?: string // For guest session tracking
}

export interface ScoreStats {
  personalBest: number
  totalGames: number
  averageScore: number
  topScores: GameScore[]
}

export interface SessionData {
  sessionId: string
  scores: GameScore[]
  startTime: number
}

export class ScoreManager {
  private static readonly STORAGE_KEY = 'pixelPaperPlane_scores'
  private static readonly SESSION_KEY = 'pixelPaperPlane_session'
  private static readonly MAX_STORED_SCORES = 50
  private static sessionData: SessionData | null = null
  
  /**
   * Initialize or get current session with validation
   */
  public static initializeSession(): SessionData {
    if (this.sessionData && this.isValidSessionData(this.sessionData)) {
      return this.sessionData
    }
    
    try {
      const stored = sessionStorage.getItem(this.SESSION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (this.isValidSessionData(parsed)) {
          this.sessionData = parsed
          return this.sessionData!
        } else {
          console.warn('Invalid session data found, creating new session')
        }
      }
    } catch (error) {
      console.warn('Failed to load session data:', error)
    }
    
    // Create new session
    this.sessionData = {
      sessionId: this.generateSessionId(),
      scores: [],
      startTime: Date.now()
    }
    
    this.saveSessionData()
    return this.sessionData
  }
  
  /**
   * Generate a unique session ID
   */
  private static generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
  }
  
  /**
   * Save session data to sessionStorage
   */
  private static saveSessionData(): void {
    if (!this.sessionData) return
    
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(this.sessionData))
    } catch (error) {
      console.warn('Failed to save session data:', error)
    }
  }
  
  /**
   * Get current session scores
   */
  public static getSessionScores(): GameScore[] {
    const session = this.initializeSession()
    return session.scores
  }
  
  /**
   * Save a new score to localStorage and session
   */
  public static saveScore(score: number, distance: number): GameScore {
    // Validate input
    const validatedScore = this.validateScoreInput(score, distance)
    if (!validatedScore.isValid) {
      console.warn('Invalid score input:', validatedScore.error)
      return {
        score: 0,
        distance: 0,
        timestamp: Date.now(),
        rank: 0
      }
    }
    
    const session = this.initializeSession()
    
    const newScore: GameScore = {
      score: validatedScore.score,
      distance: validatedScore.distance,
      timestamp: Date.now(),
      sessionId: session.sessionId
    }
    
    // Add to session
    session.scores.push(newScore)
    this.saveSessionData()
    
    // Save to persistent storage
    const scores = this.getAllScores()
    scores.push(newScore)
    
    // Sort by score descending and limit storage
    const sortedScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, this.MAX_STORED_SCORES)
    
    // Add ranking to scores
    const rankedScores = sortedScores.map((scoreEntry, index) => ({
      ...scoreEntry,
      rank: index + 1
    }))
    
    this.saveToStorage(rankedScores)
    
    // Return the saved score with its rank
    const savedScore = rankedScores.find(s => s.timestamp === newScore.timestamp)
    return savedScore || newScore
  }
  
  /**
   * Validate score input parameters
   */
  private static validateScoreInput(score: number, distance: number): {
    isValid: boolean
    score: number
    distance: number
    error?: string
  } {
    // Check for valid numbers
    if (typeof score !== 'number' || typeof distance !== 'number') {
      return { isValid: false, score: 0, distance: 0, error: 'Score and distance must be numbers' }
    }
    
    // Check for NaN or infinite values
    if (!isFinite(score) || !isFinite(distance)) {
      return { isValid: false, score: 0, distance: 0, error: 'Score and distance must be finite numbers' }
    }
    
    // Check for negative values
    if (score < 0 || distance < 0) {
      return { isValid: false, score: 0, distance: 0, error: 'Score and distance cannot be negative' }
    }
    
    // Check for reasonable upper bounds (prevent cheating/corruption)
    const MAX_REASONABLE_SCORE = 1000000 // 1 million points
    const MAX_REASONABLE_DISTANCE = 100000 // 100km in meters
    
    if (score > MAX_REASONABLE_SCORE) {
      return { 
        isValid: false, 
        score: 0, 
        distance: 0, 
        error: `Score too high (max: ${MAX_REASONABLE_SCORE})` 
      }
    }
    
    if (distance > MAX_REASONABLE_DISTANCE) {
      return { 
        isValid: false, 
        score: 0, 
        distance: 0, 
        error: `Distance too high (max: ${MAX_REASONABLE_DISTANCE})` 
      }
    }
    
    // Round to integers to prevent float precision issues
    return {
      isValid: true,
      score: Math.floor(score),
      distance: Math.floor(distance)
    }
  }
  
  /**
   * Transfer session scores to persistent storage (for guest account upgrade)
   */
  public static transferSessionScores(): GameScore[] {
    const sessionScores = this.getSessionScores()
    if (sessionScores.length === 0) {
      return []
    }
    
    const existingScores = this.getAllScores()
    const allScores = [...existingScores, ...sessionScores]
    
    // Sort and limit
    const sortedScores = allScores
      .sort((a, b) => b.score - a.score)
      .slice(0, this.MAX_STORED_SCORES)
    
    // Add ranking
    const rankedScores = sortedScores.map((score, index) => ({
      ...score,
      rank: index + 1
    }))
    
    this.saveToStorage(rankedScores)
    
    // Clear session after transfer
    this.clearSession()
    
    return sessionScores
  }
  
  /**
   * Clear current session
   */
  public static clearSession(): void {
    this.sessionData = null
    try {
      sessionStorage.removeItem(this.SESSION_KEY)
    } catch (error) {
      console.warn('Failed to clear session data:', error)
    }
  }
  
  /**
   * Get session statistics
   */
  public static getSessionStats(): ScoreStats {
    const sessionScores = this.getSessionScores()
    
    if (sessionScores.length === 0) {
      return {
        personalBest: 0,
        totalGames: 0,
        averageScore: 0,
        topScores: []
      }
    }
    
    const personalBest = Math.max(...sessionScores.map(s => s.score))
    const totalGames = sessionScores.length
    const averageScore = Math.round(sessionScores.reduce((sum, s) => sum + s.score, 0) / totalGames)
    const topScores = sessionScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((score, index) => ({ ...score, rank: index + 1 }))
    
    return {
      personalBest,
      totalGames,
      averageScore,
      topScores
    }
  }
  
  /**
   * Get all scores from localStorage with validation
   */
  public static getAllScores(): GameScore[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []
      
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) {
        console.warn('Stored scores data is not an array, clearing storage')
        this.clearAllScores()
        return []
      }
      
      // Validate each score entry
      const validScores = parsed.filter(this.isValidGameScore)
      
      // If we filtered out invalid scores, save the cleaned data
      if (validScores.length !== parsed.length) {
        console.warn(`Removed ${parsed.length - validScores.length} invalid score entries`)
        this.saveToStorage(validScores)
      }
      
      return validScores
    } catch (error) {
      console.warn('Failed to load scores from localStorage:', error)
      this.clearAllScores() // Clear potentially corrupt data
      return []
    }
  }
  
  /**
   * Validate a GameScore object
   */
  private static isValidGameScore(score: any): score is GameScore {
    if (!score || typeof score !== 'object') return false
    
    // Check required properties
    if (typeof score.score !== 'number' || typeof score.distance !== 'number' || typeof score.timestamp !== 'number') {
      return false
    }
    
    // Check for valid values
    if (!isFinite(score.score) || !isFinite(score.distance) || !isFinite(score.timestamp)) {
      return false
    }
    
    // Check for reasonable values
    if (score.score < 0 || score.distance < 0 || score.timestamp < 0) {
      return false
    }
    
    // Check timestamp is not in future (with some tolerance)
    const maxFutureTime = Date.now() + (24 * 60 * 60 * 1000) // 24 hours tolerance
    if (score.timestamp > maxFutureTime) {
      return false
    }
    
    return true
  }
  
  /**
   * Get top N scores
   */
  public static getTopScores(limit: number = 10): GameScore[] {
    return this.getAllScores()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((score, index) => ({ ...score, rank: index + 1 }))
  }
  
  /**
   * Get personal ranking for a given score
   */
  public static getPersonalRank(targetScore: number): number {
    const scores = this.getAllScores()
    const betterScores = scores.filter(score => score.score > targetScore)
    return betterScores.length + 1
  }
  
  /**
   * Get score statistics
   */
  public static getScoreStats(): ScoreStats {
    const scores = this.getAllScores()
    
    if (scores.length === 0) {
      return {
        personalBest: 0,
        totalGames: 0,
        averageScore: 0,
        topScores: []
      }
    }
    
    const personalBest = Math.max(...scores.map(s => s.score))
    const totalGames = scores.length
    const averageScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalGames)
    const topScores = this.getTopScores(3)
    
    return {
      personalBest,
      totalGames,
      averageScore,
      topScores
    }
  }
  
  /**
   * Clear all scores (for testing or reset)
   */
  public static clearAllScores(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear scores from localStorage:', error)
    }
  }
  
  /**
   * Check if a score qualifies as a new personal best
   */
  public static isNewPersonalBest(score: number): boolean {
    const stats = this.getScoreStats()
    return score > stats.personalBest
  }
  
  /**
   * Private helper to save scores to localStorage
   */
  private static saveToStorage(scores: GameScore[]): void {
    try {
      // Check storage quota before saving
      this.checkStorageQuota()
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scores))
    } catch (error) {
      console.warn('Failed to save scores to localStorage:', error)
      
      // If quota exceeded, try to save fewer scores
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        try {
          const reducedScores = scores.slice(0, Math.floor(this.MAX_STORED_SCORES * 0.5))
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reducedScores))
          console.warn(`Reduced score storage due to quota limit (${reducedScores.length} scores saved)`)
        } catch (secondError) {
          console.error('Failed to save reduced scores:', secondError)
        }
      }
    }
  }
  
  /**
   * Validate session data structure
   */
  private static isValidSessionData(data: any): data is SessionData {
    if (!data || typeof data !== 'object') return false
    
    if (typeof data.sessionId !== 'string' || typeof data.startTime !== 'number') {
      return false
    }
    
    if (!Array.isArray(data.scores)) return false
    
    // Validate all scores in session
    return data.scores.every(this.isValidGameScore)
  }
  
  /**
   * Check storage quota and manage data if needed
   */
  private static checkStorageQuota(): void {
    try {
      // Try to estimate storage usage
      const currentData = localStorage.getItem(this.STORAGE_KEY)
      if (currentData && currentData.length > 50000) { // ~50KB
        console.warn('Score storage getting large, trimming to top scores only')
        const scores = this.getAllScores()
        const trimmedScores = scores.slice(0, Math.floor(this.MAX_STORED_SCORES * 0.8))
        this.saveToStorage(trimmedScores)
      }
    } catch (error) {
      console.warn('Error checking storage quota:', error)
    }
  }
} 