/**
 * AuthManager - Complete authentication state management with Firebase integration
 * 
 * Handles:
 * - Guest/authenticated user state tracking
 * - Firebase Authentication integration
 * - Authentication state persistence
 * - Real-time auth state monitoring
 * - Offline support
 */

import { initializeApp } from 'firebase/app'
import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  connectAuthEmulator
} from 'firebase/auth'
import type { Auth, User as FirebaseUser } from 'firebase/auth'

// Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Check if Firebase configuration is complete
const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.apiKey !== "demo-api-key"
  )
}

export interface User {
  id: string
  email?: string
  isGuest: boolean
  displayName?: string
  createdAt?: Date
  lastLoginAt?: Date
}

export interface AuthError {
  code: string
  message: string
}

export class AuthManager {
  private static instance: AuthManager
  private currentUser: User | null = null
  private authStateListeners: ((user: User | null) => void)[] = []
  private firebaseApp: FirebaseApp | null = null
  private auth: Auth | null = null
  private isInitialized = false
  private initializationPromise: Promise<void> | null = null
  
  private constructor() {
    // Initialize Firebase when first used
    this.initializeFirebase()
  }
  
  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  /**
   * Initialize Firebase and Auth with retry capability
   */
  private async initializeFirebase(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this._initializeFirebase()
    try {
      return await this.initializationPromise
    } catch (error) {
      // Reset initialization promise on failure so we can retry
      this.initializationPromise = null
      throw error
    }
  }

  private async _initializeFirebase(): Promise<void> {
    try {
      // Check if Firebase is configured
      if (!isFirebaseConfigured()) {
        console.warn('Firebase configuration incomplete. Running in local-only mode.')
        console.warn('To enable Firebase, create a .env.local file with Firebase configuration.')
        console.warn('See FIREBASE_CONFIG.md for setup instructions.')
        this.loadAuthState()
        return
      }

      // Initialize Firebase app
      this.firebaseApp = initializeApp(firebaseConfig)
      this.auth = getAuth(this.firebaseApp)

      // Use emulator in development if available
      if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
        try {
          connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true })
          console.log('Connected to Firebase Auth emulator')
        } catch (error) {
          console.warn('Firebase Auth emulator connection failed:', error)
        }
      }

      // Set up auth state listener
      onAuthStateChanged(this.auth, (firebaseUser) => {
        this.handleFirebaseAuthStateChange(firebaseUser)
      })

      this.isInitialized = true
      console.log('Firebase Auth initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Firebase:', error)
      console.warn('Falling back to local-only authentication mode')
      // Fallback to local-only mode
      this.loadAuthState()
    }
  }

  /**
   * Handle Firebase auth state changes
   */
  private handleFirebaseAuthStateChange(firebaseUser: FirebaseUser | null): void {
    if (firebaseUser) {
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        isGuest: firebaseUser.isAnonymous,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous Player',
        createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : undefined,
        lastLoginAt: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : undefined
      }
      this.setCurrentUser(user)
    } else {
      this.setCurrentUser(null)
    }
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
   * Check if Firebase is available and initialized
   */
  public isFirebaseAvailable(): boolean {
    return this.isInitialized && this.auth !== null
  }
  
  /**
   * Create guest user session (Firebase anonymous auth or local fallback)
   */
  public async createGuestUser(): Promise<User> {
    await this.initializeFirebase()

    if (this.isFirebaseAvailable() && this.auth) {
      try {
        const credential = await signInAnonymously(this.auth)
        const user: User = {
          id: credential.user.uid,
          isGuest: true,
          displayName: 'Guest Player',
          createdAt: new Date(),
          lastLoginAt: new Date()
        }
        return user
      } catch (error) {
        console.warn('Firebase anonymous sign-in failed, using local guest:', error)
      }
    }

    // Fallback to local guest user
    const guestUser: User = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isGuest: true,
      displayName: 'Guest Player',
      createdAt: new Date(),
      lastLoginAt: new Date()
    }
    
    this.setCurrentUser(guestUser)
    return guestUser
  }
  
  /**
   * Login with email/password using Firebase or local fallback
   */
  public async login(email: string, password: string): Promise<User> {
    await this.initializeFirebase()

    if (!this.isFirebaseAvailable() || !this.auth) {
      // Local development fallback when Firebase is not configured
      console.warn('Firebase not available, using local authentication for development')
      
      // Simple local authentication for development
      const mockUser: User = {
        id: `local_${email.replace('@', '_').replace('.', '_')}`,
        email: email,
        isGuest: false,
        displayName: email.split('@')[0],
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
      
      this.setCurrentUser(mockUser)
      return mockUser
    }

    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password)
      const user: User = {
        id: credential.user.uid,
        email: credential.user.email || undefined,
        isGuest: false,
        displayName: credential.user.displayName || email.split('@')[0],
        createdAt: credential.user.metadata.creationTime ? new Date(credential.user.metadata.creationTime) : undefined,
        lastLoginAt: new Date()
      }
      
      return user
    } catch (error: any) {
      throw this.formatAuthError(error)
    }
  }

  /**
   * Register new user with email/password using Firebase or local fallback
   */
  public async register(email: string, password: string, displayName?: string): Promise<User> {
    await this.initializeFirebase()

    if (!this.isFirebaseAvailable() || !this.auth) {
      // Local development fallback when Firebase is not configured
      console.warn('Firebase not available, using local registration for development')
      
      const mockUser: User = {
        id: `local_${email.replace('@', '_').replace('.', '_')}`,
        email: email,
        isGuest: false,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
      
      this.setCurrentUser(mockUser)
      return mockUser
    }

    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password)
      
      // Update display name if provided
      if (displayName && credential.user) {
        await updateProfile(credential.user, { displayName })
      }

      const user: User = {
        id: credential.user.uid,
        email: credential.user.email || undefined,
        isGuest: false,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
      
      return user
    } catch (error: any) {
      throw this.formatAuthError(error)
    }
  }

  /**
   * Upgrade anonymous user to permanent account or create new account if needed
   */
  public async upgradeGuestAccount(email: string, password: string, displayName?: string): Promise<User> {
    await this.initializeFirebase()

    if (!this.isFirebaseAvailable() || !this.auth) {
      // Local development fallback
      console.warn('Firebase not available, creating local account for development')
      return await this.register(email, password, displayName)
    }

    try {
      // If we don't have a current user or current user is not a guest, 
      // create a new anonymous user first
      if (!this.auth.currentUser || !this.currentUser?.isGuest) {
        await this.createGuestUser()
      }

      // Now we should have a guest user to upgrade
      if (!this.auth.currentUser) {
        throw new Error('Failed to create guest user for upgrade')
      }

      // Import needed for linking
      const { EmailAuthProvider, linkWithCredential } = await import('firebase/auth')
      
      const credential = EmailAuthProvider.credential(email, password)
      const linkedUser = await linkWithCredential(this.auth.currentUser, credential)
      
      // Update display name if provided
      if (displayName && linkedUser.user) {
        await updateProfile(linkedUser.user, { displayName })
      }

      const user: User = {
        id: linkedUser.user.uid,
        email: linkedUser.user.email || undefined,
        isGuest: false,
        displayName: displayName || email.split('@')[0],
        createdAt: this.currentUser?.createdAt || new Date(),
        lastLoginAt: new Date()
      }
      
      return user
    } catch (error: any) {
      // If linking fails because email is already in use, 
      // sign in with the existing account instead
      if (error.code === 'auth/email-already-in-use') {
        console.log('Email already in use, signing in instead of upgrading')
        return await this.login(email, password)
      }
      
      throw this.formatAuthError(error)
    }
  }
  
  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    if (this.isFirebaseAvailable() && this.auth) {
      try {
        await signOut(this.auth)
      } catch (error) {
        console.warn('Firebase sign-out failed:', error)
      }
    }
    
    this.setCurrentUser(null)
  }

  /**
   * Format Firebase auth errors for user display
   */
  private formatAuthError(error: any): AuthError {
    const errorMap: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
      'auth/invalid-login-credentials': 'Invalid email or password. Please check and try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
      'auth/requires-recent-login': 'Please log out and log back in to perform this action.',
      'auth/credential-already-in-use': 'This account is already linked to another user.',
      'auth/provider-already-linked': 'This account is already linked.',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.'
    }

    return {
      code: error.code || 'auth/unknown-error',
      message: errorMap[error.code] || error.message || 'An unexpected error occurred. Please try again.'
    }
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
      try {
        callback(this.currentUser)
      } catch (error) {
        console.error('Auth state listener error:', error)
      }
    })
  }
  
  /**
   * Save authentication state to localStorage (fallback only)
   */
  private saveAuthState(): void {
    try {
      if (this.currentUser && !this.isFirebaseAvailable()) {
        // Only save to localStorage if Firebase is not handling persistence
        localStorage.setItem('pixelPaperPlane_auth', JSON.stringify(this.currentUser))
      } else if (!this.currentUser) {
        localStorage.removeItem('pixelPaperPlane_auth')
      }
    } catch (error) {
      console.warn('Failed to save auth state:', error)
    }
  }
  
  /**
   * Load authentication state from localStorage (fallback only)
   */
  private loadAuthState(): void {
    try {
      if (!this.isFirebaseAvailable()) {
        const stored = localStorage.getItem('pixelPaperPlane_auth')
        if (stored) {
          const userData = JSON.parse(stored)
          // Convert date strings back to Date objects
          if (userData.createdAt) userData.createdAt = new Date(userData.createdAt)
          if (userData.lastLoginAt) userData.lastLoginAt = new Date(userData.lastLoginAt)
          this.currentUser = userData
        }
      }
    } catch (error) {
      console.warn('Failed to load auth state:', error)
      this.currentUser = null
    }
  }
} 