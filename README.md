# ✈️ Pixel Paper Plane

A one-touch glide game featuring a pixel paper plane with realistic aerodynamic physics, built with Phaser 3 and TypeScript.

## 🎮 Game Overview

**Pixel Paper Plane** is a physics-based gliding game where players:
- Swipe to set launch angle and power (desktop: drag+release, mobile: swipe)
- Tap/hold during flight to apply elevate force (limited by stamina)
- Collect rings to restore stamina and increase score
- Navigate through procedural wind currents powered by Perlin noise
- Achieve maximum distance with realistic lift, drag, and gravity physics

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Mobile Development

### Capacitor Setup
```bash
# Initialize Capacitor
npm run cap:init

# Add platforms
npm run cap:add:android
npm run cap:add:ios

# Build and open in native IDE
npm run cap:build:android
npm run cap:build:ios
```

## 🛠️ Tech Stack

- **Frontend**: Phaser 3.90.0, TypeScript 5.8+, Vite 6
- **Physics**: Custom aerodynamics with lift/drag calculations
- **Wind System**: Simplex noise for procedural wind fields
- **PWA**: Service Worker + Web App Manifest
- **Mobile**: Capacitor 7 for Android/iOS builds
- **Hosting**: Firebase Hosting ready
- **Audio**: Howler.js for sound effects

## 🎯 Game Physics

### Aerodynamic Forces
- **Lift**: `L = C_L × v² × sin(α)` where α is attack angle vs wind
- **Drag**: `D = C_D × v²` opposing motion
- **Wind**: Perlin noise field providing 0-120 px/s² forces
- **Elevate**: 90 px/s² upward force (stamina limited)

### Controls
- **Launch**: Click/tap and drag to aim, release to launch
- **Elevate**: Hold click/tap or spacebar during flight
- **Stamina**: Depletes during elevate, restores via ring collection

## 📁 Project Structure

```
src/
├── main.ts              # Phaser game initialization
├── scenes/
│   ├── BootScene.ts     # Asset loading with progress bar
│   └── GameScene.ts     # Main gameplay loop
├── systems/
│   ├── WindField.ts     # Perlin noise wind generation
│   └── PhysicsHelpers.ts # Aerodynamic calculations
├── objects/
│   ├── PaperPlane.ts    # Player aircraft with physics
│   └── Ring.ts          # Collectible stamina/score items
└── ui/
    └── DesignTokens.ts  # Color palette & spacing
```

## 🎨 Design System

```typescript
colors = {
  skyTop: '#92E2FF',      // Gradient top
  skyBottom: '#EAF9FF',   // Gradient bottom  
  primary: '#377DFF',     // UI elements
  accent: '#FFD447',      // Rings & highlights
  uiBg: '#111A'          // Semi-transparent overlays
}

font = "Press Start 2P"  // Pixel-perfect retro font
spacing = [4, 8, 16, 24, 32]  // Consistent spacing scale
```

## 🔧 Development Scripts

```bash
npm run dev          # Start dev server with HMR
npm run build        # TypeScript compile + Vite build
npm run preview      # Preview production build
npm run lint         # ESLint code checking
npm run lint:fix     # Auto-fix linting issues
npm run format       # Prettier code formatting
npm run test         # Run Vitest unit tests
npm run deploy       # Build + deploy to Firebase
```

## 🌐 PWA Features

- **Offline Play**: Service Worker caches game assets
- **Install Prompt**: Add to home screen on mobile
- **Responsive**: Scales from 800×450 to 1600×900
- **Touch Optimized**: Multi-touch support for mobile
- **Landscape Mode**: Optimized for horizontal gameplay

## 🚀 Deployment

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
npm run deploy
```

### Mobile App Stores
```bash
# Build for Android
npm run cap:build:android
# Open Android Studio, build APK/AAB

# Build for iOS  
npm run cap:build:ios
# Open Xcode, archive and upload
```

## 🎮 Game Features

### Core Mechanics
- ✅ Physics-based paper plane flight
- ✅ Procedural wind field system
- ✅ Stamina-based elevate mechanic
- ✅ Ring collection for score/stamina
- ✅ Distance-based progression
- ✅ Crash detection and game over

### Planned Features
- 🔄 Multiple paper plane skins
- 🔄 Power-ups and special abilities
- 🔄 Leaderboards with Firebase
- 🔄 Achievement system
- 🔄 Sound effects and music
- 🔄 Particle effects and polish

## 📊 Performance

- **Bundle Size**: ~1.5MB (Phaser + game code)
- **Load Time**: <3s on 3G connection
- **Frame Rate**: 60 FPS on modern devices
- **Memory**: <50MB RAM usage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Phaser**: Amazing 2D game framework
- **Simplex Noise**: Procedural wind generation
- **Press Start 2P**: Perfect pixel font
- **Capacitor**: Seamless mobile deployment

---

**Happy Flying!** ✈️ 