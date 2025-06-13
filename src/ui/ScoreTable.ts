/**
 * ScoreTable - Displays scores in a formatted table
 */

import { colors, typography } from './DesignTokens'
import type { GameScore } from '../systems/ScoreManager'

export interface ScoreTableConfig {
  x: number
  y: number
  width?: number
  height?: number
  scores: GameScore[]
  maxRows?: number
  showRank?: boolean
  title?: string
}

export class ScoreTable {
  private container: Phaser.GameObjects.Container
  private background: Phaser.GameObjects.Graphics
  private titleText?: Phaser.GameObjects.Text
  private headerTexts: Phaser.GameObjects.Text[] = []
  private scoreTexts: Phaser.GameObjects.Text[] = []
  
  constructor(scene: Phaser.Scene, config: ScoreTableConfig) {
    const {
      x,
      y,
      width = 400,
      height = 300,
      scores,
      maxRows = 5,
      showRank = true,
      title
    } = config
    
    this.container = scene.add.container(x, y)
    
    // Create background
    this.background = scene.add.graphics()
    this.container.add(this.background)
    
    this.drawBackground(width, height)
    this.createTitle(title)
    this.createTable(scores, height, maxRows, showRank)
  }
  
  private drawBackground(width: number, height: number): void {
    this.background.clear()
    
    // Main background
    this.background.fillStyle(parseInt(colors.primary.substring(1), 16), 0.9)
    this.background.lineStyle(3, parseInt(colors.white.substring(1), 16), 1)
    this.background.fillRoundedRect(-width/2, -height/2, width, height, 12)
    this.background.strokeRoundedRect(-width/2, -height/2, width, height, 12)
    
    // Inner shadow effect
    this.background.lineStyle(2, 0x000000, 0.3)
    this.background.strokeRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height - 8, 8)
  }
  
  private createTitle(title: string | undefined): void {
    if (!title) return
    
    this.titleText = this.container.scene.add.text(0, -this.getTableHeight()/2 + 30, title, {
      fontFamily: typography.primary,
      fontSize: '20px',
      color: colors.white,
      align: 'center'
    })
    this.titleText.setOrigin(0.5, 0.5)
    this.container.add(this.titleText)
  }
  
  private createTable(scores: GameScore[], height: number, maxRows: number, showRank: boolean): void {
    const displayScores = scores.slice(0, maxRows)
    const startY = this.titleText ? -height/2 + 80 : -height/2 + 50
    const rowHeight = 35
    
    // Create headers
    this.createHeaders(startY - 20, showRank)
    
    // Create score rows
    displayScores.forEach((score, index) => {
      const y = startY + (index * rowHeight)
      this.createScoreRow(score, y, index + 1, showRank)
    })
    
    // If no scores, show empty message
    if (displayScores.length === 0) {
      const emptyText = this.container.scene.add.text(0, startY + 50, 'No scores yet!\nPlay to set your first score.', {
        fontFamily: typography.primary,
        fontSize: '14px',
        color: colors.white,
        align: 'center'
      })
      emptyText.setOrigin(0.5, 0.5)
      this.container.add(emptyText)
      this.scoreTexts.push(emptyText)
    }
  }
  
  private createHeaders(y: number, showRank: boolean): void {
    const headerStyle = {
      fontFamily: typography.primary,
      fontSize: '11px',
      color: colors.accent,
      align: 'center' as const
    }
    
    if (showRank) {
      const rankHeader = this.container.scene.add.text(-150, y, 'Rank', headerStyle)
      rankHeader.setOrigin(0.5, 0.5)
      this.container.add(rankHeader)
      this.headerTexts.push(rankHeader)
    }
    
    const scoreHeader = this.container.scene.add.text(showRank ? -20 : -60, y, 'Score', headerStyle)
    scoreHeader.setOrigin(0.5, 0.5)
    this.container.add(scoreHeader)
    this.headerTexts.push(scoreHeader)
    
    const distanceHeader = this.container.scene.add.text(showRank ? 150 : 60, y, 'Distance', headerStyle)
    distanceHeader.setOrigin(0.5, 0.5)
    this.container.add(distanceHeader)
    this.headerTexts.push(distanceHeader)
  }
  
  private createScoreRow(score: GameScore, y: number, displayRank: number, showRank: boolean): void {
    // Determine color for this rank
    let textColor: string = colors.white
    if (displayRank <= 3) {
      const highlightColors = [colors.accent, '#C0C0C0', '#CD7F32'] // Gold, Silver, Bronze
      textColor = highlightColors[displayRank - 1] || colors.white
    }
    
    const rowStyle = {
      fontFamily: typography.primary,
      fontSize: '12px',  // Reduced from 14px to 12px
      color: textColor,
      align: 'center' as const
    }
    
    if (showRank) {
      const rankText = this.container.scene.add.text(-150, y, `${displayRank}`, rowStyle)
      rankText.setOrigin(0.5, 0.5)
      this.container.add(rankText)
      this.scoreTexts.push(rankText)
    }
    
    const scoreText = this.container.scene.add.text(showRank ? -20 : -60, y, score.score.toString(), rowStyle)
    scoreText.setOrigin(0.5, 0.5)
    this.container.add(scoreText)
    this.scoreTexts.push(scoreText)
    
    const distanceText = this.container.scene.add.text(showRank ? 150 : 60, y, `${score.distance}m`, rowStyle)
    distanceText.setOrigin(0.5, 0.5)
    this.container.add(distanceText)
    this.scoreTexts.push(distanceText)
  }
  
  private getTableHeight(): number {
    return 300 // Default height, could be calculated based on content
  }
  
  public updateScores(scores: GameScore[], maxRows: number = 5, showRank: boolean = true): void {
    // Clear existing score texts
    this.scoreTexts.forEach(text => text.destroy())
    this.scoreTexts = []
    
    // Recreate table with new scores
    const displayScores = scores.slice(0, maxRows)
    const startY = this.titleText ? -this.getTableHeight()/2 + 80 : -this.getTableHeight()/2 + 50
    const rowHeight = 35
    
    displayScores.forEach((score, index) => {
      const y = startY + (index * rowHeight)
      this.createScoreRow(score, y, index + 1, showRank)
    })
    
    if (displayScores.length === 0) {
      const emptyText = this.container.scene.add.text(0, startY + 50, 'No scores yet!\nPlay to set your first score.', {
        fontFamily: typography.primary,
        fontSize: '14px',
        color: colors.white,
        align: 'center'
      })
      emptyText.setOrigin(0.5, 0.5)
      this.container.add(emptyText)
      this.scoreTexts.push(emptyText)
    }
  }
  
  public setVisible(visible: boolean): void {
    this.container.setVisible(visible)
  }
  
  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y)
  }
  
  public destroy(): void {
    this.container.destroy()
  }
  
  public getContainer(): Phaser.GameObjects.Container {
    return this.container
  }
} 