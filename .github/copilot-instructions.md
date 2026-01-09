# Pachinko Game - AI Coding Instructions

## Project Overview

Japanese-inspired Pachinko game built with **Phaser 3** + **Vite**. Written in **ES6+ modules** with a scene-based architecture emphasizing Japanese aesthetic principles (Wabi-Sabi, Ma, Iki).

## Architecture Principles

### Scene Flow
```
BootScene → PreloadScene → MenuScene → BettingScene → GameScene + UIScene (parallel) → GameOverScene
```

- **GameScene**: Core gameplay, physics, entities. Runs in parallel with UIScene.
- **UIScene**: Non-blocking HUD overlay. Listens to GameScene events via `this.scene.get('UIScene').events.emit()`.
- All scenes in `src/scenes/`, registered in `main.js` via `GAME_CONFIG.scene` array.

### Entity-Component Pattern

Entities extend Phaser sprites with self-contained behavior:

- **Ball** (`entities/Ball.js`): Extends `Phaser.Physics.Arcade.Sprite`. Tracks `pinHitCount` for combos, has particle trail and glow circle. Call `ball.hitPin()` on collision.
- **Pin** (`entities/Pin.js`): Static physics body with collision feedback (kintsugi effect for multiple hits).
- **Creature** (`entities/Creature.js`): Wandering yokai obstacle with sine-wave movement.

## Feature Configuration System

**Critical**: This project uses a data-driven feature toggle system.

### Adding New Features

1. Define in `src/config/featureConfig.js`:
```javascript
{
  id: "my_feature",
  name: "Display Name",
  category: "gameplay", // or "audio", "visual"
  enabled: true,
  parameters: [
    { key: "speed", label: "Speed", type: "number", default: 100, min: 50, max: 200 }
  ]
}
```

2. Check in game code:
```javascript
if (FeatureManager.isEnabled("my_feature")) {
  const speed = FeatureManager.getParameter("my_feature", "speed");
  // Use feature
}
```

3. **Always** call `FeatureManager.init()` in scene's `init()` method before checking features.

### Manager Singletons

- **FeatureManager**: Centralized feature toggles. Always initialize: `FeatureManager.init()`.
- **BudgetManager**: Manages yen/credit economy. Stored in `this.registry.get("budgetManager")`.
- **StateManager**: localStorage persistence for settings.
- **AudioSystem**: Handles all audio with Ma (間) - enforces minimum 150ms between sounds to prevent overlap.

## Japanese Aesthetic Implementation

### Wabi-Sabi (侘寂) - Imperfection

Use `applyWabiSabi(value, jitter)` from `utils/helpers.js` for organic variation:
```javascript
const x = applyWabiSabi(baseX, 3); // Adds ±3px random jitter
```
Apply to pin positions, particle spawn points, any grid layout.

### Ma (間) - Strategic Silence

AudioSystem enforces 150ms minimum between sounds:
```javascript
this.audioSystem.register("sound", { volume: 0.7 });
this.audioSystem.play("sound"); // Automatically respects Ma interval
```

### Color Palettes

Game supports 5 palettes stored in `gameConfig.js`. Access via `DESIGN_CONSTANTS.COLORS`:
- `PRIMARY`, `ACCENT`, `GOLD`, `BACKGROUND`, `SAKURA`, `BALL`
- Use these constants, never hardcode colors.

## Development Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run preview  # Preview production build
```

## Code Conventions

1. **File Organization**: Group by feature domain (`entities/`, `managers/`, `scenes/`), not by type.
2. **Import Paths**: Always use `.js` extension in imports: `import Ball from './entities/Ball.js'`
3. **Scene Communication**: Use `this.scene.get('OtherScene')` or `this.registry` for cross-scene data.
4. **Physics Groups**: Create collision groups in `create()`, handle in `update()` loop.
5. **French UI**: All user-facing text in French via `TRANSLATIONS` object in `gameConfig.js`.

## Common Patterns

### Launching a New Scene
```javascript
this.scene.start('TargetScene', { data: value }); // Stops current scene
this.scene.launch('UIScene');                      // Parallel scene
```

### Adding Collision Detection
```javascript
this.physics.add.collider(ball, pins, this.onBallHitPin, null, this);
```

### Emitting Events to UIScene
```javascript
this.scene.get('UIScene').events.emit('scoreUpdate', this.score);
```

### Creating Particles
Always follow this.add.particles with tint array using DESIGN_CONSTANTS.COLORS for consistency.

## Key Files

- [src/config/featureConfig.js](src/config/featureConfig.js) - Feature definitions
- [src/config/gameConfig.js](src/config/gameConfig.js) - All constants, palettes, translations
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detailed architecture documentation
- [docs/DESIGN_PHILOSOPHY.md](docs/DESIGN_PHILOSOPHY.md) - Japanese aesthetic concepts with code examples
- [docs/FEATURE_CONFIGURATION.md](docs/FEATURE_CONFIGURATION.md) - Complete feature system guide
