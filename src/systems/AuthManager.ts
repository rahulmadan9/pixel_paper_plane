/**
 * AuthManager - Basic authentication state management
 * 
 * Handles:
 * - Guest/authenticated user state tracking
 * - Session-based authentication (Firebase integration in Phase 2)
 * - Authentication state persistence
 */

export interface User {
  id: string
  email?: string
  isGuest: boolean
  displayName?: string
}

export class AuthManager {
  private static instance: AuthManager
  private currentUser: User | null = null
  private authStateListeners: ((user: User | null) => void)[] = []
  
  private constructor() {
    this.loadAuthState()
  }
  
  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }
  
  /**
   * Get current user (null if not authenticated)
   */
  public getCurrentUser(): User | null {
    return this.currentUser
  }
  
  /**
   * Check if user is authenticated (guest or full account)
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null
  }
  
  /**
   * Check if current user is a guest
   */
  public isGuest(): boolean {
    return this.currentUser?.isGuest === true
  }
  
  /**
   * Create guest user session
   */
  public createGuestUser(): User {
    const guestUser: User = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isGuest: true,
      displayName: 'Guest Player'
    }
    
    this.setCurrentUser(guestUser)
    return guestUser
  }
  
  /**
   * Login with email/password (placeholder for Firebase integration)
   */
  public async login(email: string, _password: string): Promise<User> {
    // TODO: Implement Firebase authentication
    const user: User = {
      id: `user_${Date.now()}`,
      email,
      isGuest: false,
      displayName: email.split('@')[0]
    }
    
    this.setCurrentUser(user)
    return user
  }
  
  /**
   * Logout current user
   */
  public logout(): void {
    this.setCurrentUser(null)
  }
  
  /**
   * Add authentication state change listener
   */
  public onAuthStateChanged(callback: (user: User | null) => void): void {
    this.authStateListeners.push(callback)
  }
  
  /**
   * Remove authentication state change listener
   */
  public removeAuthStateListener(callback: (user: User | null) => void): void {
    const index = this.authStateListeners.indexOf(callback)
    if (index > -1) {
      this.authStateListeners.splice(index, 1)
    }
  }
  
  /**
   * Set current user and notify listeners
   */
  private setCurrentUser(user: User | null): void {
    this.currentUser = user
    this.saveAuthState()
    this.notifyAuthStateListeners()
  }
  
  /**
   * Notify all authentication state listeners
   */
  private notifyAuthStateListeners(): void {
    this.authStateListeners.forEach(callback => {
      callback(this.currentUser)
    })
  }
  
  /**
   * Save authentication state to localStorage
   */
  private saveAuthState(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem('pixelPaperPlane_auth', JSON.stringify(this.currentUser))
      } else {
        localStorage.removeItem('pixelPaperPlane_auth')
      }
    } catch (error) {
      console.warn('Failed to save auth state:', error)
    }
  }
  
  /**
   * Load authentication state from localStorage
   */
  private loadAuthState(): void {
    try {
      const stored = localStorage.getItem('pixelPaperPlane_auth')
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load auth state:', error)
      this.currentUser = null
    }
  }
} 