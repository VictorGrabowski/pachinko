# Pachinko Game - AI Coding Instructions

## Project Overview

Japanese-inspired Pachinko game built with **Phaser 3** + **Vite**. Written in **ES6+ modules** with a scene-based architecture emphasizing Japanese aesthetic principles (Wabi-Sabi, Ma, Iki).

## Architecture Principles

### SOLID & Clean Code

This project follows SOLID principles and Clean Code practices:

- **Single Responsibility**: Each module has one reason to change (gameplay logic in `gameplay/`, UI in `ui/`, etc.)
- **Open/Closed**: Extend via `FeatureManager` configuration, not by modifying core code
- **Dependency Inversion**: Use `ServiceLocator` and `EventBus` instead of direct imports for loose coupling

### Scene Flow
```
BootScene → PreloadScene → MenuScene → BettingScene → GameScene + UIScene (parallel) → GameOverScene
                                                                                              ↓
                                                                                      ScoreboardScene
```

- **GameScene**: Thin scene that delegates to gameplay modules. Runs in parallel with UIScene.
- **UIScene**: Non-blocking HUD overlay. Listens via `EventBus` (preferred) or `this.scene.get('UIScene').events.emit()`.
- All scenes in `src/scenes/`, registered in `main.js` via `GAME_CONFIG.scene` array.

### Core Infrastructure (`src/core/`)

- **ServiceLocator**: Dependency injection container. Register services in `main.js`, retrieve anywhere.
- **EventBus**: Decoupled event communication between scenes/modules. Use `GameEvents` constants for event names.

```javascript
// Registering (in main.js or BootScene)
ServiceLocator.register('audioSystem', new AudioSystem(game));

// Retrieving (anywhere)
const audio = ServiceLocator.get('audioSystem');

// Event communication
import EventBus, { GameEvents } from '../core/EventBus.js';
EventBus.emit(GameEvents.SCORE_UPDATE, { score: 100 });
EventBus.on(GameEvents.SCORE_UPDATE, this.handleScore, this);
```

### Gameplay Modules (`src/gameplay/`)

Extracted from GameScene to follow Single Responsibility Principle:

- **PinGridManager**: Pin creation, layout, and moving pins animation
- **BallLauncher**: Ball placeholder, spawning, hardcore mode oscillators
- **CollisionHandler**: Pin/bucket/creature collision logic
- **ScoringSystem**: Score calculation, multipliers, combo tracking
- **CreatureManager**: Yokai creature spawning and behavior

### Entity-Component Pattern

Entities extend Phaser sprites with self-contained behavior:

- **Ball** (`entities/Ball.js`): Extends `Phaser.Physics.Arcade.Sprite`. Tracks `pinHitCount` for combos, has particle trail and glow circle. Call `ball.hitPin()` on collision.
- **Pin** (`entities/Pin.js`): Static physics body with collision feedback (kintsugi effect for multiple hits).
- **Creature** (`entities/Creature.js`): Pac-Man style yokai with pixel art, mouth animation, and dash ability. Wanders the board as an obstacle.

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
- **LanguageManager**: Multi-language i18n system (FR/EN). Use `LanguageManager.getText('key')` and `LanguageManager.setLanguage('en')`.
- **AudioSystem**: Handles all audio with Ma (間) - configurable minimum interval between sounds to prevent overlap.

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

Game supports 5 palettes (classic, ocean, forest, sunset, midnight) stored in `gameConfig.js`. Access via:
- `DESIGN_CONSTANTS.COLORS`: Current palette with `PRIMARY`, `ACCENT`, `GOLD`, `BACKGROUND`, `SAKURA`, `BALL`
- `PALETTES`: Object containing all 5 palette definitions
- `setCurrentPalette(name)` / `getCurrentPalette()`: Switch palettes dynamically
- Use these constants, never hardcode colors.

## Development Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run preview  # Preview production build
```

## Code Conventions

1. **File Organization**: Group by feature domain (`core/`, `gameplay/`, `entities/`, `managers/`, `scenes/`, `ui/`, `ui/controls/`, `components/`).
2. **Import Paths**: Always use `.js` extension in imports: `import Ball from './entities/Ball.js'`
3. **Scene Communication**: Prefer `EventBus` for decoupled events, or `this.scene.get('OtherScene')` / `this.registry` for direct access.
4. **Physics Groups**: Create collision groups in `create()`, handle in `update()` loop.
5. **Multi-language UI**: All user-facing text via `LanguageManager.getText('key')`. Supports FR/EN.
6. **UI Components**: Reusable Phaser containers in `src/ui/`. HTML controls in `src/ui/controls/` (Slider, Toggle, Select). HTML overlays in `src/components/`.
7. **Dependency Injection**: Use `ServiceLocator.get('service')` instead of direct singleton imports for testability.

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
// Preferred: EventBus (decoupled)
import EventBus, { GameEvents } from '../core/EventBus.js';
EventBus.emit(GameEvents.SCORE_UPDATE, { score: this.score });

// Alternative: Direct scene reference
this.scene.get('UIScene').events.emit('scoreUpdate', this.score);
```

### Creating Particles
Always follow this.add.particles with tint array using DESIGN_CONSTANTS.COLORS for consistency.

## Key Files

- [src/config/featureConfig.js](src/config/featureConfig.js) - Feature definitions
- [src/config/gameConfig.js](src/config/gameConfig.js) - All constants, palettes, translations
- [src/managers/LanguageManager.js](src/managers/LanguageManager.js) - Multi-language i18n system
- [src/ui/BettingPanel.js](src/ui/BettingPanel.js) - Reusable Phaser Container component example
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detailed architecture documentation
- [docs/DESIGN_PHILOSOPHY.md](docs/DESIGN_PHILOSOPHY.md) - Japanese aesthetic concepts with code examples
- [docs/FEATURE_CONFIGURATION.md](docs/FEATURE_CONFIGURATION.md) - Complete feature system guide
