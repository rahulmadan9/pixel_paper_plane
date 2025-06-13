/**
 * ScoreManager - Handles score persistence and ranking with Firebase integration
 * Local storage with cloud sync for authenticated users
 */

import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore'
import type { Firestore, QuerySnapshot, DocumentData, Timestamp } from 'firebase/firestore'
import { AuthManager } from './AuthManager'
import type { User } from './AuthManager'

export interface GameScore {
  score: number
  distance: number
  timestamp: number
  rank?: number
  sessionId?: string // For guest session tracking
  userId?: string // For Firebase sync
  id?: string // Firestore document ID
  gameMode?: string // Normal, challenge, etc.
  syncedToCloud?: boolean // Whether this score is saved to Firestore
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

export interface CloudSyncResult {
  success: boolean
  syncedCount: number
  errors: string[]
}

export class ScoreManager {
  private static readonly STORAGE_KEY = 'pixelPaperPlane_scores'
  private static readonly SESSION_KEY = 'pixelPaperPlane_session'
  private static readonly MAX_STORED_SCORES = 50
  private static sessionData: SessionData | null = null
  private static firestore: Firestore | null = null
  private static authManager: AuthManager = AuthManager.getInstance()
  private static isInitialized = false
  private static isOnline = navigator.onLine
  private static pendingSyncScores: GameScore[] = []
  
  /**
   * Initialize Firestore connection
   */
  private static async initializeFirestore(): Promise<void> {
    if (this.isInitialized || !this.authManager.isFirebaseAvailable()) {
      return
    }
    
    try {
      // Get Firebase app from AuthManager
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "paper-plane-c713f.firebaseapp.com",
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "paper-plane-c713f",
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "paper-plane-c713f.appspot.com",
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
        appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo-app-id"
      }
      
      const app = initializeApp(firebaseConfig)
      this.firestore = getFirestore(app)
      
      // Monitor online/offline status
      window.addEventListener('online', () => {
        this.isOnline = true
        this.syncPendingScores()
      })
      
      window.addEventListener('offline', () => {
        this.isOnline = false
      })
      
      this.isInitialized = true
      console.log('ScoreManager: Firestore initialized')
      
      // Sync any pending scores
      this.syncPendingScores()
      
    } catch (error) {
      console.warn('ScoreManager: Failed to initialize Firestore:', error)
    }
  }
  
  /**
   * Sync pending scores to Firestore when online
   */
  private static async syncPendingScores(): Promise<void> {
    if (!this.isOnline || !this.firestore || this.pendingSyncScores.length === 0) {
      return
    }

    const user = this.authManager.getCurrentUser()
    if (!user || user.isGuest) {
      return // Only sync for authenticated users
    }

    try {
      const batch = writeBatch(this.firestore)
      const syncedScores: GameScore[] = []

      for (const score of this.pendingSyncScores) {
        const scoreData = {
          score: score.score,
          distance: score.distance,
          timestamp: new Date(score.timestamp),
          userId: user.id,
          gameMode: score.gameMode || 'normal',
          sessionId: score.sessionId
        }

        const docRef = doc(collection(this.firestore, 'scores'))
        batch.set(docRef, scoreData)
        syncedScores.push({ ...score, id: docRef.id, syncedToCloud: true })
      }

      await batch.commit()
      
      // Update local storage to mark scores as synced
      this.updateLocalScoresSync(syncedScores)
      
      // Clear pending scores
      this.pendingSyncScores = []
      
      console.log(`ScoreManager: Synced ${syncedScores.length} scores to Firestore`)
    } catch (error) {
      console.warn('ScoreManager: Failed to sync scores:', error)
    }
  }

  /**
   * Update local scores to mark them as synced
   */
  private static updateLocalScoresSync(syncedScores: GameScore[]): void {
    const allScores = this.getAllScores()
    const updatedScores = allScores.map(localScore => {
      const synced = syncedScores.find(s => s.timestamp === localScore.timestamp)
      return synced ? { ...localScore, syncedToCloud: true, id: synced.id } : localScore
    })
    this.saveToStorage(updatedScores)
  }

  /**
   * Save score to Firestore
   */
  private static async saveScoreToFirestore(score: GameScore): Promise<GameScore | null> {
    if (!this.firestore || !this.isOnline) {
      return null
    }

    const user = this.authManager.getCurrentUser()
    if (!user || user.isGuest) {
      return null // Only save to Firestore for authenticated users
    }

    try {
      const scoreData = {
        score: score.score,
        distance: score.distance,
        timestamp: new Date(score.timestamp),
        userId: user.id,
        gameMode: score.gameMode || 'normal',
        sessionId: score.sessionId
      }

      const docRef = await addDoc(collection(this.firestore, 'scores'), scoreData)
      
      return {
        ...score,
        id: docRef.id,
        userId: user.id,
        syncedToCloud: true
      }
    } catch (error) {
      console.warn('ScoreManager: Failed to save score to Firestore:', error)
      return null
    }
  }

  /**
   * Load scores from Firestore for current user
   */
  public static async loadUserScoresFromFirestore(): Promise<GameScore[]> {
    await this.initializeFirestore()
    
    if (!this.firestore || !this.isOnline) {
      return []
    }

    const user = this.authManager.getCurrentUser()
    if (!user || user.isGuest) {
      return []
    }

    try {
      const q = query(
        collection(this.firestore, 'scores'),
        where('userId', '==', user.id),
        orderBy('score', 'desc'),
        limit(this.MAX_STORED_SCORES)
      )

      const querySnapshot = await getDocs(q)
      const cloudScores: GameScore[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        cloudScores.push({
          id: doc.id,
          score: data.score,
          distance: data.distance,
          timestamp: data.timestamp?.toDate?.()?.getTime() || data.timestamp?.toMillis?.() || Date.now(),
          userId: data.userId,
          gameMode: data.gameMode || 'normal',
          sessionId: data.sessionId,
          syncedToCloud: true
        })
      })

      return cloudScores
    } catch (error) {
      console.warn('ScoreManager: Failed to load scores from Firestore:', error)
      return []
    }
  }

  /**
   * Transfer local scores to Firebase when user creates account
   */
  public static async transferLocalScoresToFirestore(): Promise<CloudSyncResult> {
    await this.initializeFirestore()
    
    const result: CloudSyncResult = {
      success: false,
      syncedCount: 0,
      errors: []
    }

    if (!this.firestore || !this.isOnline) {
      result.errors.push('Firestore not available or offline')
      return result
    }

    const user = this.authManager.getCurrentUser()
    if (!user || user.isGuest) {
      result.errors.push('User must be authenticated to sync scores')
      return result
    }

    try {
      const localScores = this.getAllScores().filter(score => !score.syncedToCloud)
      
      if (localScores.length === 0) {
        result.success = true
        return result
      }

      const batch = writeBatch(this.firestore)
      
      for (const score of localScores) {
        const scoreData = {
          score: score.score,
          distance: score.distance,
          timestamp: new Date(score.timestamp),
          userId: user.id,
          gameMode: score.gameMode || 'normal',
          sessionId: score.sessionId
        }

        const docRef = doc(collection(this.firestore, 'scores'))
        batch.set(docRef, scoreData)
      }

      await batch.commit()
      
      // Update local scores to mark as synced
      const updatedScores = localScores.map(score => ({
        ...score,
        syncedToCloud: true,
        userId: user.id
      }))
      
      this.updateLocalScoresSync(updatedScores)
      
      result.success = true
      result.syncedCount = localScores.length
      
      console.log(`ScoreManager: Transferred ${localScores.length} local scores to Firestore`)
      
    } catch (error: any) {
      result.errors.push(error.message || 'Failed to transfer scores')
      console.error('ScoreManager: Score transfer failed:', error)
    }

    return result
  }

  /**
   * Set up authentication state listener for automatic score syncing
   */
  private static setupAuthListener(): void {
    this.authManager.onAuthStateChanged(async (user) => {
      if (user && !user.isGuest) {
        // User just logged in or was upgraded from guest
        console.log('ScoreManager: User authenticated, syncing scores...')
        await this.transferLocalScoresToFirestore()
      }
    })
  }

  /**
   * Initialize or get current session with validation
   */
  public static initializeSession(): SessionData {
    if (this.sessionData && this.isValidSessionData(this.sessionData)) {
      return this.sessionData
    }
    
    // Set up auth state listener for score syncing
    this.setupAuthListener()
    
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
   * Manually trigger sync of all scores with Firestore
   */
  public static async syncWithFirestore(): Promise<CloudSyncResult> {
    await this.initializeFirestore()
    
    const result: CloudSyncResult = {
      success: false,
      syncedCount: 0,
      errors: []
    }

    const user = this.authManager.getCurrentUser()
    if (!user || user.isGuest) {
      result.errors.push('User must be authenticated to sync')
      return result
    }

    try {
      // First, transfer any local scores that haven't been synced
      const transferResult = await this.transferLocalScoresToFirestore()
      result.syncedCount += transferResult.syncedCount
      result.errors.push(...transferResult.errors)

      // Then, load and merge cloud scores
      const cloudScores = await this.loadUserScoresFromFirestore()
      if (cloudScores.length > 0) {
        const localScores = this.getAllScores()
        const mergedScores = this.mergeLocalAndCloudScores(localScores, cloudScores)
        this.saveToStorage(mergedScores)
      }

      result.success = transferResult.success
      console.log(`ScoreManager: Sync completed. ${result.syncedCount} scores synced.`)
      
    } catch (error: any) {
      result.errors.push(error.message || 'Sync failed')
      console.error('ScoreManager: Sync failed:', error)
    }

    return result
  }

  /**
   * Merge local and cloud scores, removing duplicates and maintaining sync status
   */
  private static mergeLocalAndCloudScores(localScores: GameScore[], cloudScores: GameScore[]): GameScore[] {
    const merged = [...cloudScores] // Start with cloud scores

    // Add local scores that aren't in the cloud
    localScores.forEach(localScore => {
      const existsInCloud = cloudScores.some(cloudScore => 
        cloudScore.timestamp === localScore.timestamp ||
        (cloudScore.score === localScore.score && 
         cloudScore.distance === localScore.distance &&
         Math.abs(cloudScore.timestamp - localScore.timestamp) < 5000) // Within 5 seconds
      )

      if (!existsInCloud) {
        merged.push(localScore)
      }
    })

    // Sort by score and add rankings
    return merged
      .sort((a, b) => b.score - a.score)
      .slice(0, this.MAX_STORED_SCORES)
      .map((score, index) => ({
        ...score,
        rank: index + 1
      }))
  }
  
  /**
   * Save a new score to localStorage, session, and Firebase
   */
  public static async saveScore(score: number, distance: number, gameMode: string = 'normal'): Promise<GameScore> {
    // Initialize Firestore if needed
    await this.initializeFirestore()
    
    // Validate input
    const validatedScore = this.validateScoreInput(score, distance)
    if (!validatedScore.isValid) {
      console.warn('Invalid score input:', validatedScore.error)
      return {
        score: 0,
        distance: 0,
        timestamp: Date.now(),
        rank: 0,
        gameMode,
        syncedToCloud: false
      }
    }
    
    const session = this.initializeSession()
    const user = this.authManager.getCurrentUser()
    
    const newScore: GameScore = {
      score: validatedScore.score,
      distance: validatedScore.distance,
      timestamp: Date.now(),
      sessionId: session.sessionId,
      gameMode,
      userId: user?.id,
      syncedToCloud: false
    }
    
    // Add to session
    session.scores.push(newScore)
    this.saveSessionData()
    
    // Save to persistent storage first (ensures we don't lose the score)
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
    
    // Get the saved score with its rank
    let savedScore = rankedScores.find(s => s.timestamp === newScore.timestamp) || newScore
    
    // Try to save to Firestore for authenticated users
    if (user && !user.isGuest) {
      const cloudScore = await this.saveScoreToFirestore(savedScore)
      if (cloudScore) {
        // Update local storage with cloud sync info
        savedScore = cloudScore
        const updatedScores = rankedScores.map(s => 
          s.timestamp === savedScore.timestamp ? savedScore : s
        )
        this.saveToStorage(updatedScores)
      } else {
        // Add to pending sync if save failed
        this.pendingSyncScores.push(savedScore)
      }
    }
    
    return savedScore
  }

  /**
   * Save a new score (backward compatibility - sync version)
   */
  public static saveSyncScore(score: number, distance: number, gameMode: string = 'normal'): GameScore {
    // For immediate compatibility, we'll use the async version but return a basic score
    this.saveScore(score, distance, gameMode).catch(error => {
      console.warn('ScoreManager: Async save failed:', error)
    })
    
    // Return a basic score immediately for backward compatibility
    const session = this.initializeSession()
    const user = this.authManager.getCurrentUser()
    
    return {
      score,
      distance,
      timestamp: Date.now(),
      sessionId: session.sessionId,
      gameMode,
      userId: user?.id,
      syncedToCloud: false
    }
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