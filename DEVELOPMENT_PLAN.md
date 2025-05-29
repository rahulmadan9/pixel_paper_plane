# ✈️ PIXEL PAPER PLANE – DEVELOPMENT PLAN

## 🎯 Game Overview
"Pixel Paper Plane" is a one-touch glide game designed for web and mobile platforms.

### Core Gameplay
- **Launch**: Player swipes (desktop: drag+release, mobile: swipe) to set launch angle and power
- **Flight**: During flight, tapping/holding applies a small 'elevate' force
- **Physics**: Procedural wind currents (Perlin noise) plus gravity and drag shape the arc
- **Scoring**: Score = distance + ring pickups + landing bonus
- **Progression**: Collect XP → unlock new paper skins

---

## 🛠️ Tech Stack (Pinned Versions)

### Frontend
- **Phaser** @3.90.0 (latest stable, v4 still RC)
- **TypeScript** ^5.5
- **Vite** ^5 for super-fast HMR builds
- **vite-plugin-pwa** ^0.18 for Service Worker + manifest
- **Firebase Web SDK** (modular) ^9.23 for Auth + Firestore
- **noisejs** ^3 for Perlin/Simplex wind field
- **howler** ^2 for audio

### Mobile Wrapper
- **Capacitor** @7 for Android/iOS builds

### Tooling
- ESLint + Prettier + Vitest
- GitHub Actions → deploy to Firebase Hosting on push to main

---

## 📁 Project Structure

```
root/
├─ package.json              // scripts: dev, build, preview, deploy
├─ vite.config.ts            // PWA plugin configuration
├─ capacitor.config.ts       // appId com.yourname.pixelplane
├─ firebase.json             // hosting rewrites
└─ src/
    ├─ main.ts               // Phaser.Game initialization
    ├─ scenes/
    │    ├─ BootScene.ts     // loader bar, webfont
    │    ├─ GameScene.ts     // core game loop
    │    └─ UIScene.ts       // HUD & pause menu (shared)
    ├─ systems/
    │    ├─ WindField.ts     // Perlin noise, sample(vec2 pos): vec2
    │    └─ PhysicsHelpers.ts// lift+drag equations
    ├─ objects/
    │    ├─ PaperPlane.ts    // extends Phaser.Physics.Arcade.Sprite
    │    └─ Ring.ts          // collectible objects
    ├─ ui/
    │    └─ DesignTokens.ts  // color/spacing design system
    └─ assets/               // placeholder png, sfx, font
```

---

## ⚙️ Physics & Game Feel

### Core Physics
- **2D ArcadePhysics**: gravity = 300 px·s⁻²
- **Lift**: L = C_L × v² × sin(α) where α = attack angle vs. wind
  - Use C_L ≈ 0.016 for starter feel, clamp to ±45°
- **Drag**: D = C_D × v² with C_D ≈ 0.03
- **Wind**: WindField.sample returns Vec2 force scaled 0-120 px·s⁻²
- **Elevate**: Tap/hold adds upward impulse 90 px·s⁻², limited by stamina

---

## 🎨 Design System

### Color Tokens
```typescript
colors = {
  skyTop: '#92E2FF',
  skyBottom: '#EAF9FF', 
  primary: '#377DFF',
  accent: '#FFD447',
  uiBg: '#111A', // 70% opacity
}
```

### Typography & Layout
- **Font**: "Press Start 2P", monospace fallback
- **Border radius**: 12px (pixel-rounded corners)
- **Spacing**: 4, 8, 16, 24, 32px

---

## ✅ Implementation Status

### ✅ COMPLETED
- [x] **TODO 01**: Initialize repo with Vite + TS template
- [x] **TODO 02**: Install dependencies and set up alias paths
- [x] **TODO 03**: Generate BootScene with loading bar & bitmap font
- [x] **TODO 04**: Build GameScene skeleton
  - [x] Preload minimal sprites
  - [x] Spawn PaperPlane at center-bottom
  - [x] Sample WindField in update loop
  - [x] Apply gravity+lift+drag physics
  - [x] Handle tap elevate mechanics
  - [x] Ring collision → add score, refill stamina

### 🔄 PARTIALLY COMPLETED
- [x] **TODO 05**: Implement UIScene (score, stamina bar) 
  - [x] Score display
  - [x] Distance tracking
  - [x] Stamina bar
  - [ ] Pause overlay
  - [ ] Separate UI scene
- [x] **TODO 09**: Capacitor init
  - [x] Basic Capacitor setup
  - [ ] Android platform testing
  - [ ] iOS platform testing

### ❌ PENDING
- [ ] **TODO 06**: Firestore integration
  - [ ] postScore(uid, distance) cloud function
  - [ ] User authentication
  - [ ] Leaderboard system
- [ ] **TODO 07**: PWA implementation
  - [ ] Auto-generate manifest
  - [ ] Service Worker (cache-first strategy)
  - [ ] Offline functionality
- [ ] **TODO 08**: CI/CD Pipeline
  - [ ] GitHub Actions setup
  - [ ] Automated linting
  - [ ] Build and deploy to Firebase Hosting
- [ ] **TODO 10**: Polish features
  - [ ] Particle effects
  - [ ] Screen shake
  - [ ] Audio system (SFX, music)
  - [ ] Multiple plane skins
  - [ ] XP progression system

---

## 🎮 Controls & Platform Support

### Current Controls
- **Desktop**: Drag to aim → Release to launch → Hold mouse to elevate
- **Mobile**: Swipe to aim → Release to launch → Tap/hold to elevate

### Planned Enhancements
- **Desktop Keyboard**: Arrow keys for enhanced control
  - Up arrow: Elevate (equivalent to mouse hold)
  - Spacebar: Alternative elevate control
- **Gamepad**: Future integration for desktop

---

## 🚀 Next Sprint Priorities

1. **Enhanced Desktop Controls** (High Priority)
   - Implement keyboard controls (Up arrow for elevate)
   - Improve desktop UX with key bindings

2. **PWA Implementation** (High Priority)
   - Service Worker setup
   - Manifest generation
   - Offline capability

3. **Firebase Integration** (Medium Priority)
   - User authentication
   - Score persistence
   - Cloud functions

4. **Polish & Effects** (Low Priority)
   - Audio system
   - Particle effects
   - Visual enhancements

---

## 🎯 Success Metrics

- **Performance**: 60 FPS on mobile devices
- **Bundle Size**: < 2MB initial load
- **Load Time**: < 3 seconds on 3G
- **Platform Support**: Web, Android, iOS
- **User Experience**: Intuitive one-touch gameplay

---

*Last Updated: [Current Date]*
*Project Status: MVP Complete, Enhancement Phase* 