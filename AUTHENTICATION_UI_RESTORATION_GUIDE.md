# Authentication UI Restoration Guide

## Overview
This document provides instructions for restoring the authentication UI elements that were temporarily disabled from the frontend. All backend authentication functionality remains intact and functional.

## What Was Temporarily Disabled

### Frontend UI Elements Removed:
- Login/Create Account buttons in StartScene
- Authentication status display
- Guest account upgrade prompts
- Authentication-aware game over screen buttons
- Login scene registration
- Authentication-required screens in ScoresScene

### Backend Functionality Preserved:
- AuthManager system remains fully functional
- Score syncing and authentication logic unchanged
- Firebase integration maintained
- All authentication methods and state management preserved

## Files Modified

### 1. `src/main.ts`
**Changes Made:**
- Commented out LoginScene import
- Removed LoginScene from scene array

**To Restore:**
```typescript
// Uncomment this line:
import { LoginScene } from '@scenes/LoginScene'

// Restore LoginScene in scene array:
scene: [BootScene, StartScene, GameScene, ScoresScene, LoginScene],
```

### 2. `src/scenes/StartScene.ts`
**Changes Made:**
- Commented out authentication UI properties
- Disabled authentication buttons creation
- Removed user status display
- Commented out authentication state change handlers
- Disabled authentication-related navigation methods

**To Restore:**
1. Uncomment the following property declarations:
```typescript
private authButton!: Phaser.GameObjects.Container
private secondaryButton!: Phaser.GameObjects.Container
private userStatusText!: Phaser.GameObjects.Text
```

2. In the `create()` method, uncomment:
```typescript
this.createUserStatus(width, height)
this.updateButtonsForAuthState()

this.authManager.onAuthStateChanged((user) => {
  this.updateButtonsForAuthState()
  this.updateUserStatus(user)
})
```

3. In `createButtons()` method, uncomment the authentication buttons:
```typescript
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
```

4. Uncomment all the following methods (remove `/*` and `*/`):
   - `createUserStatus()`
   - `updateUserStatus()`
   - `updateButtonsForAuthState()`
   - `updateButtonText()`
   - `updateButtonColor()`
   - `handleAuthAction()`
   - `showLogin()`
   - `upgradeGuestAccount()`
   - `showScores()`
   - `logout()`

### 3. `src/scenes/GameScene.ts`
**Changes Made:**
- Commented out authentication-aware third button in game over screen
- Disabled login and scores navigation methods

**To Restore:**
1. In `createGameOverButtons()` method, uncomment the authentication-aware third button:
```typescript
// Authentication-aware third button
if (!currentUser || currentUser.isGuest) {
  // LOGIN button for guests
  const authButtonText = 'LOGIN'
  this.createGameOverButton(
    width / 2 + buttonSpacing,
    buttonY,
    authButtonText,
    '#4CAF50',
    () => this.goToLogin()
  )
} else {
  // VIEW SCORES button for authenticated users
  this.createGameOverButton(
    width / 2 + buttonSpacing,
    buttonY,
    'SCORES',
    '#666666',
    () => this.goToScores()
  )
}
```

2. Uncomment the navigation methods:
```typescript
private goToLogin(): void {
  console.log('Navigating to login...')
  // For now, go to start scene where login functionality exists
  this.scene.start('StartScene')
}

private goToScores(): void {
  console.log('Navigating to scores...')
  this.scene.start('ScoresScene')
}
```

### 4. `src/scenes/ScoresScene.ts`
**Changes Made:**
- Disabled authentication check in create() method
- Commented out authentication-required UI methods

**To Restore:**
1. In the `create()` method, uncomment the authentication check:
```typescript
// Check authentication and show appropriate content
if (!this.authManager.isAuthenticated()) {
  this.showAuthenticationRequired(width, height)
  return
}
```

2. Uncomment the following methods (remove `/*` and `*/`):
   - `showAuthenticationRequired()`
   - `createGuestAccount()`

## Quick Restoration Checklist

### Step 1: Restore Scene Registration
- [ ] Uncomment LoginScene import in `src/main.ts`
- [ ] Add LoginScene back to scene array in `src/main.ts`

### Step 2: Restore StartScene Authentication UI
- [ ] Uncomment authentication UI properties
- [ ] Restore authentication-related method calls in `create()`
- [ ] Uncomment authentication buttons in `createButtons()`
- [ ] Uncomment all authentication-related methods

### Step 3: Restore GameScene Authentication UI
- [ ] Uncomment authentication-aware third button in game over screen
- [ ] Uncomment login and scores navigation methods

### Step 4: Restore ScoresScene Authentication Check
- [ ] Uncomment authentication check in `create()` method
- [ ] Uncomment authentication-required UI methods

## Testing After Restoration

1. **Start Screen**: Should show LOGIN/CREATE ACCOUNT buttons based on authentication state
2. **Game Over Screen**: Should show LOGIN or SCORES button based on authentication state
3. **Scores Screen**: Should require authentication and show guest account creation option
4. **Navigation**: All authentication flows should work properly

## Notes

- The AuthManager system remained fully functional during this temporary disabling
- All backend authentication logic is preserved
- Score syncing and user management continues to work
- This change only affects the frontend UI presentation
- No database or Firebase configuration changes were made

## Search Keywords for Quick Finding

To quickly find all commented-out authentication code, search for:
- `TEMPORARY:`
- `TODO: Uncomment`
- `authentication UI temporarily disabled`
- `/*` (start of commented blocks)

All modifications include clear "TEMPORARY" and "TODO" markers for easy identification and restoration. 