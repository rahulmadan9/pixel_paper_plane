# Pixel Paper Plane - Claude Memory

## Project Overview
A one-touch Flappy Bird-style game featuring a pixel paper plane, built with Phaser 3 and TypeScript. The game includes Firebase authentication, cloud score syncing, and PWA capabilities.

## Architecture
- **Framework**: Phaser 3 with TypeScript
- **Build Tool**: Vite
- **Authentication**: Firebase Auth
- **Database**: Firestore (scores)
- **Deployment**: Vercel + Firebase
- **Mobile**: Capacitor (Android/iOS)

## Key Components

### Core Game Objects
- `PaperPlane.ts` - Main player character with physics and controls
- `Ring.ts` - Collectible scoring items with bronze/silver/gold variants
- `Cloud.ts` - Dynamic cloud generation and movement system

### Scenes
- `BootScene.ts` - Initial loading and setup
- `LoginScene.ts` - Firebase authentication UI
- `StartScene.ts` - Main menu
- `GameScene.ts` - Core gameplay (currently being worked on)
- `ScoresScene.ts` - Leaderboard display

### Systems
- `AuthManager.ts` - Firebase authentication management
- `ScoreManager.ts` - Local and cloud score persistence
- `DesignTokens.ts` - Consistent UI styling

## Development Commands
```bash
# Development
npm run dev

# Build & Deploy
npm run build
npm run deploy

# Code Quality
npm run lint
npm run lint:fix
npm run format

# Testing
npm run test

# Mobile
npm run cap:build:android
npm run cap:build:ios
```

## Current State
- **Last Modified**: GameScene.ts (has uncommitted changes)
- **Recent Features**: Tree/bush decorations, top boundary collision, authentication system
- **Active Tasks**: Game over UI fixes (see tasks/tasks-game-over-ui-fixes.md)

## Coding Conventions
- TypeScript strict mode
- Phaser 3 patterns with scene-based architecture
- Import aliases: `@objects/`, `@scenes/`, `@systems/`, `@ui/`
- Consistent design tokens from DesignTokens.ts
- Firebase integration patterns established in AuthManager/ScoreManager

## Asset Structure
- Sprites: `public/assets/sprites/` (plane, rings, environment)
- Rings: `public/assets/rings/` (bronze, silver, gold variants)
- Icons: PWA icons in public/

## Important Notes
- Game uses physics-based movement and collision detection
- Score system supports both local and cloud persistence
- Authentication supports both guest and registered users
- Mobile-ready with Capacitor configuration
- PWA enabled with offline capabilities

## Common Issues
- Always run `npm run lint` and `npm run build` before committing
- Check Firebase configuration if auth/scores aren't working
- Verify asset paths in public/ directory for missing sprites