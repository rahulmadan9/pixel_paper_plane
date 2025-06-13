/**
 * StartScene - Main entry point for the game
 * 
 * Provides:
 * - Branded start screen with game title
 * - Authentication-aware navigation buttons
 * - Consistent visual design with game background
 */

import { colors, typography } from '../ui/DesignTokens'
import { AuthManager } from '../systems/AuthManager'
import type { User } from '../systems/AuthManager'

export class StartScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text
  private authButton!: Phaser.GameObjects.Container
  private secondaryButton!: Phaser.GameObjects.Container
  private userStatusText!: Phaser.GameObjects.Text
  
  private authManager: AuthManager
  
  constructor() {
    super({ key: 'StartScene' })
    this.authManager = AuthManager.getInstance()
  }
  
  public create(): void {
    const { width, height } = this.cameras.main
    
    // Check if we should start game directly after reload
    if (localStorage.getItem('startGameDirectly') === 'true') {
      localStorage.removeItem('startGameDirectly')
      console.log('Starting game directly after reload...')
      
      // Create guest user if not authenticated (preserve the logic)
      if (!this.authManager.isAuthenticated()) {
        this.authManager.createGuestUser().then(() => {
          console.log('Created guest user for this session')
        })
      }
      
      // Start game scene directly
      this.scene.start('GameScene')
      return
    }
    
    this.createBackground(width, height)
    this.createTitle(width, height)
    this.createUserStatus(width, height)
    this.createButtons(width, height)
    this.updateButtonsForAuthState()
    
    // Listen for authentication state changes
    this.authManager.onAuthStateChanged((user) => {
      this.updateButtonsForAuthState()
      this.updateUserStatus(user)
    })
  }
  
  /**
   * Create gradient sky background matching game aesthetic
   */
  private createBackground(width: number, height: number): void {
    const graphics = this.add.graphics()
    graphics.fillGradientStyle(
      parseInt(colors.skyTop.replace('#', ''), 16),
      parseInt(colors.skyTop.replace('#', ''), 16),
      parseInt(colors.skyBottom.replace('#', ''), 16),
      parseInt(colors.skyBottom.replace('#', ''), 16)
    )
    graphics.fillRect(0, 0, width, height)
    
    // Add subtle decorative clouds in background
    this.addBackgroundClouds(width, height)
  }
  
  /**
   * Add decorative clouds to background
   */
  private addBackgroundClouds(width: number, height: number): void {
    // Create a few subtle background clouds
    for (let i = 0; i < 3; i++) {
      const cloud = this.add.graphics()
      cloud.fillStyle(0xFFFFFF, 0.1)
      
      const x = (width / 4) * (i + 1)
      const y = height * 0.3 + (Math.random() - 0.5) * 100
      
      // Simple cloud shape
      cloud.fillCircle(x, y, 40)
      cloud.fillCircle(x - 20, y, 30)
      cloud.fillCircle(x + 20, y, 30)
      cloud.fillCircle(x, y - 15, 25)
    }
  }
  
  /**
   * Create branded game title
   */
  private createTitle(width: number, height: number): void {
    // Main title with improved styling
    this.titleText = this.add.text(width / 2, height * 0.22, 'PIXEL\nPAPER PLANE', {
      fontFamily: typography.primary,
      fontSize: '56px',
      color: colors.white,
      align: 'center',
      lineSpacing: 15,
      stroke: colors.primary,
      strokeThickness: 5
    })
    this.titleText.setOrigin(0.5, 0.5)
    
    // Enhanced title shadow for depth
    const shadow = this.add.text(width / 2 + 5, height * 0.22 + 5, 'PIXEL\nPAPER PLANE', {
      fontFamily: typography.primary,
      fontSize: '56px',
      color: '#00000060',
      align: 'center',
      lineSpacing: 15
    })
    shadow.setOrigin(0.5, 0.5)
    shadow.setDepth(-1)
    
    // Enhanced subtitle with better positioning
    const subtitle = this.add.text(width / 2, height * 0.34, 'Tap to fly • Collect rings • Avoid clouds', {
      fontFamily: typography.primary,
      fontSize: '14px',
      color: colors.accent,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    })
    subtitle.setOrigin(0.5, 0.5)
    
    // Add decorative elements around title
    this.addTitleDecorations(width, height)
  }
  
  /**
   * Add decorative elements around the title
   */
  private addTitleDecorations(width: number, height: number): void {
    // Add small decorative plane sprites on either side of title
    const leftPlane = this.add.graphics()
    const rightPlane = this.add.graphics()
    
    leftPlane.fillStyle(parseInt(colors.primary.replace('#', ''), 16), 0.6)
    rightPlane.fillStyle(parseInt(colors.primary.replace('#', ''), 16), 0.6)
    
    // Left plane pointing right
    leftPlane.beginPath()
    leftPlane.moveTo(0, 0)
    leftPlane.lineTo(-15, 8)
    leftPlane.lineTo(-10, 2)
    leftPlane.lineTo(-10, -2)
    leftPlane.lineTo(-15, -8)
    leftPlane.closePath()
    leftPlane.fillPath()
    
    // Right plane pointing left  
    rightPlane.beginPath()
    rightPlane.moveTo(0, 0)
    rightPlane.lineTo(15, 8)
    rightPlane.lineTo(10, 2)
    rightPlane.lineTo(10, -2)
    rightPlane.lineTo(15, -8)
    rightPlane.closePath()
    rightPlane.fillPath()
    
    leftPlane.setPosition(width / 2 - 200, height * 0.22)
    rightPlane.setPosition(width / 2 + 200, height * 0.22)
    
    // Add subtle glow effect
    const titleGlow = this.add.circle(width / 2, height * 0.22, 180, parseInt(colors.primary.replace('#', ''), 16), 0.1)
    titleGlow.setDepth(-2)
  }
  
  /**
   * Create user status display
   */
  private createUserStatus(width: number, height: number): void {
    this.userStatusText = this.add.text(width / 2, height * 0.43, '', {
      fontFamily: typography.primary,
      fontSize: '11px',
      color: colors.accent,
      align: 'center',
      backgroundColor: colors.primary + '40', // Semi-transparent background
      padding: { x: 12, y: 6 },
      stroke: '#000000',
      strokeThickness: 1
    })
    this.userStatusText.setOrigin(0.5, 0.5)
    
    // Update initial status
    this.updateUserStatus(this.authManager.getCurrentUser())
  }
  
  /**
   * Update user status text based on authentication state
   */
  private updateUserStatus(user: User | null): void {
    if (!user) {
      this.userStatusText.setText('Guest Mode • Scores saved locally')
    } else if (user.isGuest) {
      this.userStatusText.setText(`${user.displayName} • Create account to save progress`)
    } else {
      this.userStatusText.setText(`Welcome back, ${user.displayName || user.email}!`)
    }
  }
  
  /**
   * Create navigation buttons with authentication-aware layout
   */
  private createButtons(width: number, height: number): void {
    // Primary action button - START GAME (always visible) with enhanced styling
    this.createButton(
      width / 2,
      height * 0.58,
      'START GAME',
      colors.primary,
      () => this.startGame(),
      { primary: true }
    )
    
    // Secondary button - Authentication-aware
    this.authButton = this.createButton(
      width / 2,
      height * 0.71,
      'LOGIN',
      colors.accent,
      () => this.handleAuthAction()
    )
    
    // Third button - Authenticated user actions
    this.secondaryButton = this.createButton(
      width / 2,
      height * 0.84,
      'VIEW SCORES',
      '#666666',
      () => this.showScores()
    )
  }
  
  /**
   * Update button visibility and text based on authentication state
   */
  private updateButtonsForAuthState(): void {
    const user = this.authManager.getCurrentUser()
    
    if (!user) {
      // Not authenticated - show login option
      this.updateButtonText(this.authButton, 'LOGIN')
      this.updateButtonColor(this.authButton, colors.accent)
      this.authButton.setVisible(true)
      this.secondaryButton.setVisible(false)
    } else if (user.isGuest) {
      // Guest user - show create account option
      this.updateButtonText(this.authButton, 'CREATE ACCOUNT')
      this.updateButtonColor(this.authButton, colors.accent)
      this.authButton.setVisible(true)
      this.secondaryButton.setVisible(false)
    } else {
      // Authenticated user - show view scores and logout
      this.updateButtonText(this.authButton, 'VIEW SCORES')
      this.updateButtonColor(this.authButton, colors.primary)
      this.authButton.setVisible(true)
      
      this.updateButtonText(this.secondaryButton, 'LOGOUT')
      this.updateButtonColor(this.secondaryButton, '#CC5500')
      this.secondaryButton.setVisible(true)
      
      // Update secondary button action
      this.secondaryButton.removeAllListeners('pointerdown')
      this.secondaryButton.on('pointerdown', () => this.logout())
    }
  }
  
  /**
   * Update button text
   */
  private updateButtonText(button: Phaser.GameObjects.Container, newText: string): void {
    const textObject = button.list[1] as Phaser.GameObjects.Text
    textObject.setText(newText)
  }
  
  /**
   * Update button color
   */
  private updateButtonColor(button: Phaser.GameObjects.Container, newColor: string): void {
    const bg = button.list[0] as Phaser.GameObjects.Graphics
    bg.clear()
    
    const buttonWidth = 240
    const buttonHeight = 50
    
    bg.fillStyle(parseInt(newColor.replace('#', ''), 16), 0.9)
    bg.lineStyle(3, parseInt(colors.white.replace('#', ''), 16), 1)
    bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8)
    bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8)
  }
  
  /**
   * Create a styled button container with enhanced visual effects
   */
  private createButton(
    x: number, 
    y: number, 
    text: string, 
    color: string, 
    onClick: () => void,
    options: { primary?: boolean } = {}
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    
    // Enhanced button styling
    const bg = this.add.graphics()
    const buttonWidth = options.primary ? 280 : 240
    const buttonHeight = options.primary ? 60 : 50
    const borderWidth = options.primary ? 4 : 3
    
    bg.fillStyle(parseInt(color.replace('#', ''), 16), options.primary ? 1.0 : 0.9)
    bg.lineStyle(borderWidth, parseInt(colors.white.replace('#', ''), 16), 1)
    bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12)
    bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12)
    
    // Add inner highlight for depth
    if (options.primary) {
      bg.lineStyle(2, parseInt(colors.white.replace('#', ''), 16), 0.6)
      bg.strokeRoundedRect(-buttonWidth/2 + 6, -buttonHeight/2 + 6, buttonWidth - 12, buttonHeight - 12, 8)
    }
    
    // Enhanced button text
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: typography.primary,
      fontSize: options.primary ? '18px' : '16px',
      color: colors.white,
      align: 'center',
      stroke: '#000000',
      strokeThickness: options.primary ? 3 : 2
    })
    buttonText.setOrigin(0.5, 0.5)
    
    container.add([bg, buttonText])
    
    // Make interactive with enhanced feedback
    container.setSize(buttonWidth, buttonHeight)
    container.setInteractive()
    container.on('pointerdown', onClick)
    
    // Enhanced hover effects
    container.on('pointerover', () => {
      container.setScale(1.08)
      // Primary buttons get enhanced hover feedback
      if (options.primary) {
        container.setAlpha(0.95)
      }
    })
    container.on('pointerout', () => {
      container.setScale(1.0)
      container.setAlpha(1.0)
    })
    
    // Add subtle shadow for depth
    const shadowContainer = this.add.container(x + 3, y + 3)
    const shadowBg = this.add.graphics()
    shadowBg.fillStyle(0x000000, 0.3)
    shadowBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12)
    shadowContainer.add(shadowBg)
    shadowContainer.setDepth(-1)
    
    return container
  }
  
  /**
   * Start the game
   */
  private startGame(): void {
    console.log('Starting game...')
    
    // Create guest user if not authenticated
    if (!this.authManager.isAuthenticated()) {
      this.authManager.createGuestUser().then(() => {
        console.log('Created guest user for this session')
      })
    }
    
    // Set flag to start game directly after reload
    localStorage.setItem('startGameDirectly', 'true')
    
    // Reload to prevent asset glitching (important fix)
    window.location.reload()
  }
  
  /**
   * Handle authentication action based on current state
   */
  private handleAuthAction(): void {
    const user = this.authManager.getCurrentUser()
    
    if (!user) {
      this.showLogin()
    } else if (user.isGuest) {
      this.upgradeGuestAccount()
    } else {
      this.showScores()
    }
  }
  
  /**
   * Show login screen
   */
  private showLogin(): void {
    console.log('Navigating to login...')
    this.scene.start('LoginScene')
  }
  
  /**
   * Upgrade guest account to full account
   */
  private upgradeGuestAccount(): void {
    console.log('Navigating to account upgrade...')
    this.scene.start('LoginScene', { upgrade: true })
  }
  
  /**
   * Show scores screen
   */
  private showScores(): void {
    console.log('Navigating to scores screen...')
    
    // Check if user is authenticated before showing scores
    if (!this.authManager.isAuthenticated()) {
      console.warn('User must be authenticated to view scores')
      return
    }
    
    this.scene.start('ScoresScene')
  }
  
  /**
   * Logout current user
   */
  private logout(): void {
    this.authManager.logout()
    console.log('User logged out')
  }
} 