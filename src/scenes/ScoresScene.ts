/**
 * ScoresScene - Display personal scores and leaderboard
 */

import { colors, typography } from '../ui/DesignTokens'
import { ScoreTable } from '../ui/ScoreTable'
import { ScoreManager } from '../systems/ScoreManager'

export class ScoresScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text
  private scoreTable!: ScoreTable
  private statsText!: Phaser.GameObjects.Text
  
  constructor() {
    super({ key: 'ScoresScene' })
  }
  
  public create(): void {
    const { width, height } = this.cameras.main
    
    this.createBackground(width, height)
    this.createTitle(width, height)
    this.createScoreTable(width, height)
    this.createStats(width, height)
    this.createBackButton(width, height)
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
  
  private createTitle(width: number, height: number): void {
    this.titleText = this.add.text(width / 2, height * 0.12, 'TOP SCORES', {
      fontFamily: typography.primary,
      fontSize: '36px',
      color: colors.white,
      align: 'center',
      stroke: colors.primary,
      strokeThickness: 3
    })
    this.titleText.setOrigin(0.5, 0.5)
    
    // Add shadow
    const shadow = this.add.text(width / 2 + 3, height * 0.12 + 3, 'TOP SCORES', {
      fontFamily: typography.primary,
      fontSize: '36px',
      color: '#00000040',
      align: 'center'
    })
    shadow.setOrigin(0.5, 0.5)
    shadow.setDepth(-1)
  }
  
  private createScoreTable(width: number, height: number): void {
    const topScores = ScoreManager.getTopScores(10)
    
    this.scoreTable = new ScoreTable(this, {
      x: width / 2,
      y: height * 0.45,
      width: 500,
      height: 350,
      scores: topScores,
      maxRows: 10,
      showRank: true,
      title: undefined // Title is handled separately
    })
  }
  
  private createStats(width: number, height: number): void {
    const stats = ScoreManager.getScoreStats()
    
    let statsContent: string
    if (stats.totalGames === 0) {
      statsContent = 'No games played yet!\nStart playing to see your statistics.'
    } else {
      statsContent = `Personal Best: ${stats.personalBest}\n` +
                    `Games Played: ${stats.totalGames}\n` +
                    `Average Score: ${stats.averageScore}`
    }
    
    this.statsText = this.add.text(width / 2, height * 0.75, statsContent, {
      fontFamily: typography.primary,
      fontSize: '14px',
      color: colors.white,
      align: 'center',
      backgroundColor: colors.primary + '80', // Semi-transparent
      padding: { x: 20, y: 12 }
    })
    this.statsText.setOrigin(0.5, 0.5)
  }
  
  private createBackButton(width: number, height: number): void {
    // Create button container
    const buttonContainer = this.add.container(width / 2, height * 0.9)
    
    // Button background
    const bg = this.add.graphics()
    bg.fillStyle(parseInt('666666', 16), 0.9)
    bg.lineStyle(3, parseInt(colors.white.substring(1), 16), 1)
    bg.fillRoundedRect(-100, -25, 200, 50, 8)
    bg.strokeRoundedRect(-100, -25, 200, 50, 8)
    
    // Button text
    const buttonText = this.add.text(0, 0, '← BACK', {
      fontFamily: typography.primary,
      fontSize: '16px',
      color: colors.white,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    })
    buttonText.setOrigin(0.5, 0.5)
    
    buttonContainer.add([bg, buttonText])
    buttonContainer.setSize(200, 50)
    buttonContainer.setInteractive()
    
    // Add hover effects
    buttonContainer.on('pointerover', () => {
      buttonContainer.setScale(1.05)
    })
    
    buttonContainer.on('pointerout', () => {
      buttonContainer.setScale(1.0)
    })
    
    // Add click handler
    buttonContainer.on('pointerdown', () => this.goBack())
  }
  
  private goBack(): void {
    this.scene.start('StartScene')
  }
  
  public refreshScores(): void {
    // Update the score table with latest scores
    const topScores = ScoreManager.getTopScores(10)
    this.scoreTable.updateScores(topScores, 10, true)
    
    // Update stats
    const stats = ScoreManager.getScoreStats()
    let statsContent: string
    if (stats.totalGames === 0) {
      statsContent = 'No games played yet!\nStart playing to see your statistics.'
    } else {
      statsContent = `Personal Best: ${stats.personalBest}\n` +
                    `Games Played: ${stats.totalGames}\n` +
                    `Average Score: ${stats.averageScore}`
    }
    this.statsText.setText(statsContent)
  }
} 