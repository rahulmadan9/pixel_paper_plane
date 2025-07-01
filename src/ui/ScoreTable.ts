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
  rankOffset?: number  // Starting rank number for pagination
  latestScoreTimestamp?: number  // Timestamp of latest score to highlight
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
      title,
      rankOffset = 0,
      latestScoreTimestamp
    } = config
    
    this.container = scene.add.container(x, y)
    
    // Create background
    this.background = scene.add.graphics()
    this.container.add(this.background)
    
    this.drawBackground(width, height)
    this.createTitle(title)
    this.createTable(scores, height, maxRows, showRank, rankOffset, latestScoreTimestamp)
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
  
  private createTable(scores: GameScore[], height: number, maxRows: number, showRank: boolean, rankOffset: number = 0, latestScoreTimestamp?: number): void {
    const displayScores = scores.slice(0, maxRows)
    // Better spacing calculations for 5 rows with adequate padding
    const topPadding = 30
    const bottomPadding = 25  // Increased bottom padding
    const headerHeight = 25
    const availableSpace = height - topPadding - bottomPadding - headerHeight
    const rowHeight = Math.min(30, availableSpace / maxRows)  // Responsive row height
    
    const startY = -height/2 + topPadding + headerHeight
    
    // Create headers
    this.createHeaders(startY - headerHeight, showRank)
    
    // Create score rows
    displayScores.forEach((score, index) => {
      const y = startY + (index * rowHeight)
      const globalRank = rankOffset + index + 1
      this.createScoreRow(score, y, globalRank, showRank, latestScoreTimestamp)
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
  
  private createScoreRow(score: GameScore, y: number, globalRank: number, showRank: boolean, latestScoreTimestamp?: number): void {
    // Determine if this is the latest score
    const isLatestScore = latestScoreTimestamp && score.timestamp === latestScoreTimestamp
    
    // Determine color for this rank - latest score gets priority highlighting
    let textColor: string = colors.white
    if (isLatestScore) {
      textColor = colors.accent  // Highlight latest score in accent color
    } else if (globalRank <= 3) {
      const highlightColors = [colors.accent, '#C0C0C0', '#CD7F32'] // Gold, Silver, Bronze
      textColor = highlightColors[globalRank - 1] || colors.white
    }
    
    const rowStyle = {
      fontFamily: typography.primary,
      fontSize: '12px',  // Reduced from 14px to 12px
      color: textColor,
      align: 'center' as const
    }
    
    if (showRank) {
      const rankText = this.container.scene.add.text(-150, y, `${globalRank}`, rowStyle)
      rankText.setOrigin(0.5, 0.5)
      this.container.add(rankText)
      this.scoreTexts.push(rankText)
    }
    
    const scoreText = this.container.scene.add.text(showRank ? -20 : -60, y, score.score.toString(), rowStyle)
    scoreText.setOrigin(0.5, 0.5)
    this.container.add(scoreText)
    this.scoreTexts.push(scoreText)
    
    const distanceDisplay = `${score.distance}m${isLatestScore ? ' ← Latest' : ''}`
    const distanceText = this.container.scene.add.text(showRank ? 150 : 60, y, distanceDisplay, rowStyle)
    distanceText.setOrigin(0.5, 0.5)
    this.container.add(distanceText)
    this.scoreTexts.push(distanceText)
  }
  
  private getTableHeight(): number {
    return 300 // Default height, could be calculated based on content
  }
  
  public updateScores(scores: GameScore[], maxRows: number = 5, showRank: boolean = true, rankOffset: number = 0, latestScoreTimestamp?: number): void {
    // Clear existing score texts
    this.scoreTexts.forEach(text => text.destroy())
    this.scoreTexts = []
    
    // Recreate table with new scores using same improved spacing as createTable
    const displayScores = scores.slice(0, maxRows)
    const height = this.getTableHeight()
    const topPadding = 30
    const bottomPadding = 25  // Increased bottom padding
    const headerHeight = 25
    const availableSpace = height - topPadding - bottomPadding - headerHeight
    const rowHeight = Math.min(30, availableSpace / maxRows)  // Responsive row height
    
    const startY = -height/2 + topPadding + headerHeight
    
    displayScores.forEach((score, index) => {
      const y = startY + (index * rowHeight)
      const globalRank = rankOffset + index + 1
      this.createScoreRow(score, y, globalRank, showRank, latestScoreTimestamp)
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