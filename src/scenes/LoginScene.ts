/**
 * LoginScene - Simplified login screen with stable input positioning
 * 
 * Provides:
 * - Email/password authentication with auto-account creation
 * - Stable HTML input positioning 
 * - Simplified UI without mode switching
 * - Firebase authentication integration
 * - Responsive form validation and error handling
 */

import { colors, typography } from '../ui/DesignTokens'
import { Button } from '../ui/Button'
import { AuthManager } from '../systems/AuthManager'
// import type { User } from '../systems/AuthManager' // Unused import

interface FormData {
  email: string
  password: string
}

export class LoginScene extends Phaser.Scene {
  private authManager: AuthManager
  private isUpgradeMode = false
  
  // UI Elements
  private titleText!: Phaser.GameObjects.Text
  private emailInput!: HTMLInputElement
  private passwordInput!: HTMLInputElement
  private errorText!: Phaser.GameObjects.Text
  private loadingText!: Phaser.GameObjects.Text
  
  // Buttons
  private submitButton!: Button
  
  // Form container
  private inputElements: HTMLElement[] = []
  
  constructor() {
    super({ key: 'LoginScene' })
    this.authManager = AuthManager.getInstance()
  }
  
  public init(data: any): void {
    // Check if this is a guest upgrade flow
    this.isUpgradeMode = data?.upgrade === true
  }
  
  public create(): void {
    const { width, height } = this.cameras.main
    
    this.createBackground(width, height)
    this.createTitle(width, height)
    this.createForm(width, height)
    this.createButtons(width, height)
    this.createErrorDisplay(width, height)
    
    // Focus email input when scene starts
    this.time.delayedCall(100, () => {
      this.emailInput?.focus()
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
    
    // Add overlay for better readability
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.3)
    overlay.fillRect(0, 0, width, height)
  }
  
  /**
   * Create scene title
   */
  private createTitle(width: number, height: number): void {
    this.titleText = this.add.text(width / 2, height * 0.15, 
      this.isUpgradeMode ? 'UPGRADE ACCOUNT' : 'ACCOUNT', {
      fontFamily: typography.primary,
      fontSize: '42px',
      color: colors.white,
      align: 'center',
      stroke: colors.primary,
      strokeThickness: 4
    })
    this.titleText.setOrigin(0.5, 0.5)
    
    // Add subtitle
    const subtitle = this.isUpgradeMode 
      ? 'Save your progress with a permanent account'
      : 'Sign in to save your progress across devices'
    
    this.add.text(width / 2, height * 0.22, subtitle, {
      fontFamily: typography.primary,
      fontSize: '14px',
      color: colors.accent,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5)
  }
  
  /**
   * Create login form with stable positioning
   */
  private createForm(width: number, _height: number): void {
    this.createInputElements(width)
  }
  
  /**
   * Create HTML input elements with stable positioning and responsive behavior
   * 
   * Layout testing for different screen sizes:
   * - Mobile (375px): 16% spacing buffer between elements
   * - Tablet (768px): 12% spacing buffer between elements  
   * - Desktop (1024px+): 10% spacing buffer between elements
   * - All sizes maintain center alignment and prevent overlap
   */
  private createInputElements(screenWidth: number): void {
    const inputWidth = Math.min(320, screenWidth * 0.8)
    const inputHeight = 50
    const centerX = this.cameras.main.width / 2
    
    // Start inputs with adequate spacing below subtitle (22% + 4% buffer = 26%)
    const startY = this.cameras.main.height * 0.28  // Optimized spacing
    
    // Create a stable container div to prevent positioning issues
    const formContainer = document.createElement('div')
    formContainer.style.position = 'fixed'
    formContainer.style.left = `${Math.round(centerX - inputWidth/2)}px`  // Precise center alignment
    formContainer.style.top = `${Math.round(startY)}px`
    formContainer.style.width = `${inputWidth}px`
    formContainer.style.zIndex = '1000'
    formContainer.style.pointerEvents = 'auto'
    formContainer.style.display = 'flex'
    formContainer.style.flexDirection = 'column'
    formContainer.style.alignItems = 'center'  // Ensure centered alignment
    
    // Add responsive behavior for window resize with improved center alignment
    const updateContainerPosition = () => {
      const newCenterX = this.cameras.main.width / 2
      const newInputWidth = Math.min(320, this.cameras.main.width * 0.8)
      
      // Ensure precise center alignment across all screen sizes
      const leftPosition = newCenterX - (newInputWidth / 2)
      formContainer.style.left = `${Math.round(leftPosition)}px`
      formContainer.style.width = `${newInputWidth}px`
      
      // Update input widths with consistent sizing
      this.emailInput.style.width = `${newInputWidth}px`
      this.passwordInput.style.width = `${newInputWidth}px`
      
      // Maintain consistent center alignment with proper spacing
      this.emailInput.style.margin = '0 auto 16px auto'
      this.passwordInput.style.margin = '0 auto 24px auto'  // Extra space before button
    }
    
    // Listen for resize events
    window.addEventListener('resize', updateContainerPosition)
    
    // Store cleanup function
    this.inputElements.push({
      parentNode: null,
      removeChild: () => {
        window.removeEventListener('resize', updateContainerPosition)
      }
    } as any)
    
    // Base input styling with improved center alignment
    const baseInputStyle = {
      width: `${inputWidth}px`,
      height: `${inputHeight}px`,
      padding: '0 16px',
      border: `3px solid ${colors.white}`,
      borderRadius: '10px',
      background: 'rgba(255, 255, 255, 0.95)',
      fontFamily: typography.primary,
      fontSize: '16px',
      color: '#333',
      marginBottom: '16px',  // Optimized spacing between fields
      boxSizing: 'border-box' as const,
      outline: 'none',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      display: 'block',
      position: 'relative' as const,
      textAlign: 'left' as const,  // Ensure consistent text alignment
      alignSelf: 'center'  // Center within flex container
    }
    
    // Email input
    this.emailInput = document.createElement('input')
    this.emailInput.type = 'email'
    this.emailInput.placeholder = 'Email address'
    this.emailInput.autocomplete = 'email'
    this.applyInputStyles(this.emailInput, baseInputStyle)
    
    // Password input with custom bottom spacing
    this.passwordInput = document.createElement('input')
    this.passwordInput.type = 'password'
    this.passwordInput.placeholder = 'Password (6+ characters)'
    this.passwordInput.autocomplete = 'current-password'
    
    // Apply base styles with custom bottom margin for password field
    const passwordInputStyle = { ...baseInputStyle, marginBottom: '24px' }  // Extra spacing before button
    this.applyInputStyles(this.passwordInput, passwordInputStyle)
    
    // Add inputs to container
    formContainer.appendChild(this.emailInput)
    formContainer.appendChild(this.passwordInput)
    
    // Add container to DOM
    document.body.appendChild(formContainer)
    
    this.inputElements = [formContainer]
    
    // Add event handlers
    this.setupInputEventHandlers()
  }
  
  /**
   * Apply styles to input element without causing positioning issues
   */
  private applyInputStyles(input: HTMLInputElement, baseStyles: any): void {
    Object.assign(input.style, baseStyles)
    
    // Add focus/blur handlers that don't affect positioning
    input.addEventListener('focus', () => {
      input.style.borderColor = colors.primary
      input.style.boxShadow = `0 0 12px ${colors.primary}40`
    })
    
    input.addEventListener('blur', () => {
      input.style.borderColor = colors.white
      input.style.boxShadow = 'none'
    })
  }
  
  /**
   * Setup input event handlers
   */
  private setupInputEventHandlers(): void {
    const submitForm = () => this.handleSubmit()
    
    // Enter key handlers
    this.emailInput.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.passwordInput.focus()
      }
    })
    
    this.passwordInput.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        submitForm()
      }
    })
    
    // Prevent event bubbling issues
    const inputs = [this.emailInput, this.passwordInput]
    inputs.forEach((input: HTMLInputElement) => {
      input.addEventListener('input', (e: Event) => {
        e.stopPropagation()
      })
    })
  }
  
  /**
   * Create form buttons
   */
  private createButtons(width: number, height: number): void {
    // Calculate button position based on input field positioning
    // Inputs start at 28%, input section takes ~140px (~18% on 800px screen)
    // Button should be at least 4% below input section end
    const buttonY = height * 0.50  // 28% + 18% + 4% buffer = 50%
    
    // Submit button - single CTA as requested
    this.submitButton = new Button(this, {
      x: width / 2,
      y: buttonY,  // Calculated to prevent overlap
      text: 'SIGN IN',
      width: 200,
      height: 50,
      style: 'primary',
      fontSize: 16,
      onClick: () => this.handleSubmit()
    })
    
    // Back button
    new Button(this, {
      x: 100,
      y: height * 0.9,
      text: 'BACK',
      width: 120,
      height: 40,
      style: 'secondary',
      fontSize: 14,
      onClick: () => this.goBack()
    })
    
    // Guest continue button (only show if not upgrade mode)
    if (!this.isUpgradeMode) {
      new Button(this, {
        x: width - 140,
        y: height * 0.9,
        text: 'CONTINUE AS GUEST',
        width: 200,
        height: 40,
        style: 'accent',
        fontSize: 12,
        onClick: () => this.continueAsGuest()
      })
    }
  }
  
  /**
   * Create error display
   */
  private createErrorDisplay(width: number, height: number): void {
    // Calculate error message position below button (button at 50% + 5% button height + 2% buffer = 57%)
    const errorY = height * 0.58
    
    // Error message
    this.errorText = this.add.text(width / 2, errorY, '', {
      fontFamily: typography.primary,
      fontSize: '13px',
      color: '#FF6666',
      align: 'center',
      backgroundColor: '#FF000020',
      padding: { x: 15, y: 8 },
      wordWrap: { width: width * 0.8 }
    })
    this.errorText.setOrigin(0.5, 0.5)
    this.errorText.setVisible(false)
    
    // Loading message
    this.loadingText = this.add.text(width / 2, errorY, 'Please wait...', {
      fontFamily: typography.primary,
      fontSize: '14px',
      color: colors.accent,
      align: 'center',
      backgroundColor: colors.primary + '40',
      padding: { x: 15, y: 8 }
    })
    this.loadingText.setOrigin(0.5, 0.5)
    this.loadingText.setVisible(false)
  }
  
  /**
   * Handle form submission with improved simplified authentication flow
   */
  private async handleSubmit(): Promise<void> {
    const formData = this.getFormData()
    
    if (!this.validateForm(formData)) {
      return
    }
    
    this.showLoading(true)
    this.clearError()
    
    // Check if Firebase is available for better user feedback
    const isFirebaseReady = this.authManager.isFirebaseAvailable()
    if (!isFirebaseReady) {
      console.warn('Firebase not configured - using local development mode')
    }
    
    try {
      if (this.isUpgradeMode) {
        // Check if we have a valid guest user to upgrade
        const currentUser = this.authManager.getCurrentUser()
        if (!currentUser || !currentUser.isGuest) {
          // Create a guest user first, then upgrade
          await this.authManager.createGuestUser()
          await this.authManager.upgradeGuestAccount(
            formData.email, 
            formData.password
          )
          this.showSuccess('Account created successfully!')
        } else {
          // Upgrade existing guest
          await this.authManager.upgradeGuestAccount(
            formData.email, 
            formData.password
          )
          this.showSuccess('Account upgraded successfully!')
        }
      } else {
        // Simplified flow: try login first, create account if needed
        try {
          await this.authManager.login(formData.email, formData.password)
          this.showSuccess('Signed in successfully!')
        } catch (loginError: any) {
          // Check if this is a "user not found" error for auto-creation
          if (this.isAuthErrorUserNotFound(loginError)) {
            this.showLoading(true)
            
            try {
              await this.authManager.register(formData.email, formData.password)
              this.showSuccess('Account created and signed in successfully!')
            } catch (error: any) {
              this.showError(this.formatErrorMessage(error))
            }
          } else {
            throw loginError
          }
        }
      }
      
      // Navigate back after success
      this.time.delayedCall(1500, () => {
        this.goBack()
      })
      
    } catch (error: any) {
      console.error('Authentication error:', error)
      this.showError(this.formatErrorMessage(error))
    } finally {
      this.showLoading(false)
    }
  }
  
  /**
   * Check if error indicates user not found
   */
  private isAuthErrorUserNotFound(error: any): boolean {
    return error.code === 'auth/user-not-found' || 
           error.code === 'auth/invalid-credential' ||
           error.code === 'auth/invalid-login-credentials'
  }
  
  /**
   * Format error messages for better user experience
   */
  private formatErrorMessage(error: any): string {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email. Creating a new account...',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
      'auth/invalid-login-credentials': 'Invalid email or password. Please check and try again.',
      'auth/email-already-in-use': 'This email is already registered. Please check your password.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/operation-not-allowed': 'Email/password sign-in is not enabled.'
    }
    
    return errorMessages[error.code] || error.message || 'An unexpected error occurred. Please try again.'
  }
  
  /**
   * Get form data
   */
  private getFormData(): FormData {
    return {
      email: this.emailInput.value.trim(),
      password: this.passwordInput.value
    }
  }
  
  /**
   * Validate form data
   */
  private validateForm(data: FormData): boolean {
    if (!data.email) {
      this.showError('Please enter your email address.')
      this.emailInput.focus()
      return false
    }
    
    if (!this.isValidEmail(data.email)) {
      this.showError('Please enter a valid email address.')
      this.emailInput.focus()
      return false
    }
    
    if (!data.password) {
      this.showError('Please enter a password.')
      this.passwordInput.focus()
      return false
    }
    
    if (data.password.length < 6) {
      this.showError('Password must be at least 6 characters long.')
      this.passwordInput.focus()
      return false
    }
    
    return true
  }
  
  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  /**
   * Show error message
   */
  private showError(message: string): void {
    this.errorText.setText(message)
    this.errorText.setVisible(true)
    this.loadingText.setVisible(false)
  }
  
  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.errorText.setText(message)
    this.errorText.setStyle({
      color: '#66FF66',
      backgroundColor: '#00FF0020'
    })
    this.errorText.setVisible(true)
    this.loadingText.setVisible(false)
  }
  
  /**
   * Clear error message
   */
  private clearError(): void {
    this.errorText.setVisible(false)
    this.errorText.setStyle({
      color: '#FF6666',
      backgroundColor: '#FF000020'
    })
  }
  
  /**
   * Show/hide loading state
   */
  private showLoading(show: boolean): void {
    this.loadingText.setVisible(show)
    this.submitButton.setEnabled(!show)
    if (show) {
      this.clearError()
    }
  }
  
  /**
   * Continue as guest user
   */
  private async continueAsGuest(): Promise<void> {
    try {
      await this.authManager.createGuestUser()
      this.scene.start('StartScene')
    } catch (error) {
      this.showError('Failed to create guest account. Please try again.')
    }
  }
  
  /**
   * Go back to previous scene
   */
  private goBack(): void {
    this.cleanupInputs()
    this.scene.start('StartScene')
  }
  
  /**
   * Clean up HTML elements when leaving scene
   */
  private cleanupInputs(): void {
    this.inputElements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
  }
} 