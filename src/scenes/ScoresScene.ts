/**
 * ScoresScene - Display personal scores and leaderboard
 */

import { colors, typography } from '../ui/DesignTokens'
import { ScoreTable } from '../ui/ScoreTable'
import { ScoreManager, type GameScore } from '../systems/ScoreManager'
import { AuthManager } from '../systems/AuthManager'
import { Button } from '../ui/Button'

export class ScoresScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text
  private scoreTable!: ScoreTable
  private statsText!: Phaser.GameObjects.Text
  private authManager: AuthManager
  private currentPage: number = 0
  private scoresPerPage: number = 5
  private totalScores: number = 0
  private paginationContainer!: Phaser.GameObjects.Container
  private errorText?: Phaser.GameObjects.Text
  
  constructor() {
    super({ key: 'ScoresScene' })
    this.authManager = AuthManager.getInstance()
  }
  
  public create(): void {
    const { width, height } = this.cameras.main
    
    this.createBackground(width, height)
    
    // TEMPORARY: Authentication check temporarily disabled for frontend
    // TODO: Uncomment the following block to restore authentication-required UI
    /*
    // Check authentication and show appropriate content
    if (!this.authManager.isAuthenticated()) {
      this.showAuthenticationRequired(width, height)
      return
    }
    */
    
    try {
      this.createTitle(width, height)
      this.createScoreTable(width, height)
      this.createPagination(width, height)
      this.createStats(width, height)
      this.createBackButton(width, height)
    } catch (error) {
      console.error('Error creating scores scene:', error)
      this.showError(width, height, 'Failed to load scores. Please try again.')
    }
  }
  
  private createBackground(width: number, height: number): void {
    // Create gradient background matching the game aesthetic
    const gradient = this.add.graphics()
    gradient.fillGradientStyle(
      parseInt(colors.skyTop.substring(1), 16),
      parseInt(colors.skyTop.substring(1), 16),
      parseInt(colors.skyBottom.substring(1), 16),
      parseInt(colors.skyBottom.substring(1), 16),
      1
    )
    gradient.fillRect(0, 0, width, height)
  }
  
  /**
   * TEMPORARY: Authentication required UI temporarily disabled for frontend
   * TODO: Uncomment the following methods to restore authentication-required functionality
   */
  /*
  private showAuthenticationRequired(width: number, height: number): void {
    // Title
    this.titleText = this.add.text(width / 2, 120, 'SCORES', {  // Fixed position
      fontFamily: typography.primary,
      fontSize: '36px',
      color: colors.white,
      align: 'center',
      stroke: colors.primary,
      strokeThickness: 3
    })
    this.titleText.setOrigin(0.5, 0.5)
    
    // Authentication required message
    const authMessage = this.add.text(width / 2, 250, 
      'Authentication Required\n\nYou need to be logged in to view your scores.\nCreate a guest account or log in to continue.', {
      fontFamily: typography.primary,
      fontSize: '18px',
      color: colors.white,
      align: 'center',
      backgroundColor: colors.primary + '80',
      padding: { x: 30, y: 20 }
    })
    authMessage.setOrigin(0.5, 0.5)
    
    // Create Guest Account button
    const guestButton = new Button(this, {
      x: width / 2,
      y: 370,  // Fixed position
      width: 220,  // Narrower to better fit text
      height: 45,  // Slightly shorter
      text: 'CREATE GUEST ACCOUNT',
      style: 'primary',
      fontSize: 12,  // Smaller font to fit better
      onClick: () => this.createGuestAccount()
    })
    
    // Back button
    this.createBackButton(width, height)
  }
  
  private createGuestAccount(): void {
    try {
      this.authManager.createGuestUser()
      // Refresh the scene to show scores
      this.scene.restart()
    } catch (error) {
      console.error('Failed to create guest account:', error)
      this.showError(this.cameras.main.width, this.cameras.main.height, 'Failed to create guest account. Please try again.')
    }
  }
  */
  
  private showError(width: number, height: number, message: string): void {
    if (this.errorText) {
      this.errorText.destroy()
    }
    
    this.errorText = this.add.text(width / 2, height * 0.5, message, {
      fontFamily: typography.primary,
      fontSize: '16px',
      color: colors.white,
      align: 'center',
      backgroundColor: '#ff000080',
      padding: { x: 20, y: 15 }
    })
    this.errorText.setOrigin(0.5, 0.5)
    
    // Auto-hide error after 5 seconds
    this.time.delayedCall(5000, () => {
      if (this.errorText) {
        this.errorText.destroy()
        this.errorText = undefined
      }
    })
  }
  
  private createTitle(width: number, _height: number): void {
    const user = this.authManager.getCurrentUser()
    const titleText = user?.isGuest ? 'YOUR SCORES (GUEST)' : 'YOUR SCORES'
    
    this.titleText = this.add.text(width / 2, 60, titleText, {  // More space from top
      fontFamily: typography.primary,
      fontSize: '28px',  // Slightly smaller for better proportions
      color: colors.white,
      align: 'center',
      stroke: colors.primary,
      strokeThickness: 3
    })
    this.titleText.setOrigin(0.5, 0.5)
    
    // Add shadow
    const shadow = this.add.text(width / 2 + 3, 63, titleText, {  // Match new position
      fontFamily: typography.primary,
      fontSize: '28px',  // Match main title size
      color: '#00000040',
      align: 'center'
    })
    shadow.setOrigin(0.5, 0.5)
    shadow.setDepth(-1)
  }
  
  private createScoreTable(width: number, height: number): void {
    try {
      // Get all scores and sort them by score descending for proper ranking
      const allScores = ScoreManager.getAllScores().sort((a, b) => b.score - a.score)
      this.totalScores = allScores.length
      
      // Find the latest score by timestamp (most recent game)
      const latestScore = allScores.reduce((latest, score) => 
        !latest || score.timestamp > latest.timestamp ? score : latest, null as GameScore | null)
      
      // Get scores for current page
      const startIndex = this.currentPage * this.scoresPerPage
      const endIndex = startIndex + this.scoresPerPage
      const pageScores = allScores.slice(startIndex, endIndex)
      
      // Calculate rank offset for current page
      const rankOffset = this.currentPage * this.scoresPerPage
      
      this.scoreTable = new ScoreTable(this, {
        x: width / 2,
        y: 220,  // More space below title
        width: 480,  // Slightly narrower to better fit content
        height: 200,  // Reduced height to better fit 5 rows
        scores: pageScores,
        maxRows: this.scoresPerPage,
        showRank: true,
        title: undefined,
        rankOffset: rankOffset,
        latestScoreTimestamp: latestScore?.timestamp
      })
    } catch (error) {
      console.error('Error creating score table:', error)
      this.showError(width, height, 'Failed to load score table.')
    }
  }
  
  private createPagination(width: number, _height: number): void {
    if (this.totalScores <= this.scoresPerPage) {
      return // No pagination needed
    }
    
    const totalPages = Math.ceil(this.totalScores / this.scoresPerPage)
    this.paginationContainer = this.add.container(width / 2, 360)  // Better spacing below table
    
    // Previous button
    if (this.currentPage > 0) {
      const prevButton = new Button(this, {
        x: -100,  // Slightly further apart for increased button width
        y: 0,
        width: 95,  // Increased width for adequate padding
        height: 40,  // Increased height for better proportion and padding
        text: '← PREV',
        style: 'secondary',
        fontSize: 12,  // Increased font size for better readability
        onClick: () => this.previousPage()
      })
      this.paginationContainer.add(prevButton.getContainer())
    }
    
    // Page indicator
    const pageText = this.add.text(0, 0, `${this.currentPage + 1} / ${totalPages}`, {
      fontFamily: typography.primary,
      fontSize: '13px',  // Slightly larger to match button text
      color: '#666666',  // Match secondary button color
      align: 'center'
    })
    pageText.setOrigin(0.5, 0.5)
    this.paginationContainer.add(pageText)
    
    // Next button
    if (this.currentPage < totalPages - 1) {
      const nextButton = new Button(this, {
        x: 100,  // Slightly further apart for increased button width
        y: 0,
        width: 95,  // Increased width for adequate padding
        height: 40,  // Increased height for better proportion and padding
        text: 'NEXT →',
        style: 'secondary',
        fontSize: 12,  // Increased font size for better readability
        onClick: () => this.nextPage()
      })
      this.paginationContainer.add(nextButton.getContainer())
    }
  }
  
  private previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--
      this.refreshScoresDisplay()
    }
  }
  
  private nextPage(): void {
    const totalPages = Math.ceil(this.totalScores / this.scoresPerPage)
    if (this.currentPage < totalPages - 1) {
      this.currentPage++
      this.refreshScoresDisplay()
    }
  }
  
  private refreshScoresDisplay(): void {
    try {
      // Destroy existing pagination
      if (this.paginationContainer) {
        this.paginationContainer.destroy()
      }
      
      // Recreate score table and pagination
      const { width, height } = this.cameras.main
      this.createScoreTable(width, height)
      this.createPagination(width, height)
    } catch (error) {
      console.error('Error refreshing scores display:', error)
      this.showError(this.cameras.main.width, this.cameras.main.height, 'Failed to refresh scores.')
    }
  }
  
  private createStats(width: number, height: number): void {
    try {
      const stats = ScoreManager.getScoreStats()
      const user = this.authManager.getCurrentUser()
      
      let statsContent: string
      if (stats.totalGames === 0) {
        statsContent = 'No games played yet!\nStart playing to see your statistics.'
      } else {
        const userType = user?.isGuest ? ' (Guest Account)' : ''
        statsContent = `Personal Statistics${userType}\n\n` +
                      `Personal Best: ${stats.personalBest}\n` +
                      `Games Played: ${stats.totalGames}\n` +
                      `Average Score: ${stats.averageScore}\n` +
                      `Total Scores Recorded: ${this.totalScores}`
      }
      
      this.statsText = this.add.text(width / 2, 430, statsContent, {  // Better spacing below pagination
        fontFamily: typography.primary,
        fontSize: '12px',  // Slightly smaller for better fit
        color: colors.white,
        align: 'center',
        backgroundColor: colors.primary + '80',
        padding: { x: 18, y: 10 }  // Reduced padding for tighter fit
      })
      this.statsText.setOrigin(0.5, 0.5)
    } catch (error) {
      console.error('Error creating stats:', error)
      this.showError(width, height, 'Failed to load statistics.')
    }
  }
  
  private createBackButton(width: number, height: number): void {
    new Button(this, {
      x: width / 2,
      y: height - 60,  // More space from bottom edge
      width: 190,  // Slightly wider for better text fit
      height: 42,  // Consistent with improved button proportions
      text: '← BACK TO MENU',
      style: 'secondary',
      fontSize: 13,  // Slightly larger for consistency
      onClick: () => this.goBack()
    })
  }
  
  private goBack(): void {
    this.scene.start('StartScene')
  }
  
  public refreshScores(): void {
    try {
      // Reset to first page
      this.currentPage = 0
      
      // Update the score table with latest scores (sorted for proper ranking)
      const allScores = ScoreManager.getAllScores().sort((a, b) => b.score - a.score)
      this.totalScores = allScores.length
      
      // Find the latest score by timestamp (most recent game)
      const latestScore = allScores.reduce((latest, score) => 
        !latest || score.timestamp > latest.timestamp ? score : latest, null as GameScore | null)
      
      const pageScores = allScores.slice(0, this.scoresPerPage)
      const rankOffset = this.currentPage * this.scoresPerPage  // Should be 0 since we reset to page 0
      this.scoreTable.updateScores(pageScores, this.scoresPerPage, true, rankOffset, latestScore?.timestamp)
      
      // Update pagination
      if (this.paginationContainer) {
        this.paginationContainer.destroy()
      }
      const { width, height } = this.cameras.main
      this.createPagination(width, height)
      
      // Update stats
      const stats = ScoreManager.getScoreStats()
      const user = this.authManager.getCurrentUser()
      let statsContent: string
      if (stats.totalGames === 0) {
        statsContent = 'No games played yet!\nStart playing to see your statistics.'
      } else {
        const userType = user?.isGuest ? ' (Guest Account)' : ''
        statsContent = `Personal Statistics${userType}\n\n` +
                      `Personal Best: ${stats.personalBest}\n` +
                      `Games Played: ${stats.totalGames}\n` +
                      `Average Score: ${stats.averageScore}\n` +
                      `Total Scores Recorded: ${this.totalScores}`
      }
      this.statsText.setText(statsContent)
    } catch (error) {
      console.error('Error refreshing scores:', error)
      this.showError(this.cameras.main.width, this.cameras.main.height, 'Failed to refresh scores.')
    }
  }
} 