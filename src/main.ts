import Phaser from 'phaser'
import { BootScene } from '@scenes/BootScene'
import { GameScene } from '@scenes/GameScene'

/**
 * Pixel Paper Plane - Main game entry point
 * Initializes Phaser with scenes and configuration
 */

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 576,
  parent: 'app',
  backgroundColor: '#92E2FF',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 450
    },
    max: {
      width: 1600,
      height: 900
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false
    }
  },
  scene: [BootScene, GameScene],
  input: {
    activePointers: 3 // Support multi-touch
  },
  render: {
    antialias: true,
    pixelArt: false
  }
}

// Initialize the game
const game = new Phaser.Game(config)

// Handle window resize for responsive design
window.addEventListener('resize', () => {
  game.scale.refresh()
})

// Export for debugging
;(window as any).game = game
