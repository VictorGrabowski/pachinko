# Architecture Documentation

## Overview

This document describes the technical architecture of the Pachinko game, built with Phaser 3 and organized using a scene-based, entity-component pattern.

## Technology Stack

- **Framework**: Phaser 3.80+
- **Build Tool**: Vite 5.0+
- **Language**: JavaScript (ES6+)
- **Module System**: ES Modules

## Project Structure

```
pachinko/
├── src/
│   ├── config/          # Game configuration and constants
│   ├── scenes/          # Phaser scene classes
│   ├── entities/        # Game object classes
│   ├── systems/         # Game systems (Audio, etc.)
│   ├── managers/        # State and resource managers
│   ├── utils/           # Utility functions
│   └── main.js          # Entry point
├── public/
│   └── assets/          # Static assets
├── docs/                # Documentation
└── package.json         # Dependencies and scripts
```

## Core Architecture

### Scene Flow

```
BootScene → PreloadScene → MenuScene → GameScene + UIScene → GameOverScene
                                           ↓                        ↓
                                       (gameplay)              (restart/menu)
```

### Scene Responsibilities

#### BootScene
- Initialize game
- Create placeholder graphics
- Minimal setup before asset loading

#### PreloadScene
- Load all game assets
- Display loading progress
- Transition to menu

#### MenuScene
- Display game title and instructions
- Sakura petal ambient effect
- Start game button

#### GameScene
- Core gameplay logic
- Physics simulation
- Ball and pin management
- Collision detection
- Score calculation

#### UIScene
- Parallel scene to GameScene
- Displays HUD (score, lives)
- Listens to game events
- Non-blocking UI updates

#### GameOverScene
- Final score display
- Restart/menu options
- Haiku-inspired messaging

### Entity System

#### Ball (`entities/Ball.js`)
- Extends `Phaser.Physics.Arcade.Sprite`
- Circular physics body
- Trail particle effect
- Tracks pin hits for combo calculation
- Self-contained behavior

#### Pin (`entities/Pin.js`)
- Extends `Phaser.Physics.Arcade.Sprite`
- Static physics body
- Visual feedback on collision
- Kintsugi effect for multiple hits

### Systems

#### AudioSystem (`systems/AudioSystem.js`)
- Centralized audio management
- Implements Ma (間) - strategic silence
- Prevents audio overlap
- Volume control
- Enable/disable toggle

#### StateManager (`managers/StateManager.js`)
- LocalStorage persistence
- High score tracking
- Game statistics
- Save/load functionality

## Game Loop

### Initialization (init)
```javascript
init() {
  this.score = 0;
  this.lives = MAX_LIVES;
  this.balls = [];
  this.activeBalls = 0;
}
```

### Creation (create)
1. Setup background and effects
2. Create pin grid
3. Create score buckets
4. Setup input handlers
5. Launch UI scene

### Update Loop (update)
1. Check ball positions
2. Remove out-of-bounds balls
3. Update lives
4. Check game over condition

## Physics Configuration

```javascript
physics: {
  default: 'arcade',
  arcade: {
    gravity: { y: 600 },
    debug: false
  }
}
```

- **Gravity**: 600 pixels/second² downward
- **Ball bounce**: 0.8 restitution
- **Pin collisions**: Immovable static bodies

## Event System

GameScene emits events to UIScene:

```javascript
// GameScene
this.events.emit('scoreUpdate', this.score);
this.events.emit('livesUpdate', this.lives);

// UIScene
this.gameScene.events.on('scoreUpdate', this.updateScore, this);
this.gameScene.events.on('livesUpdate', this.updateLives, this);
```

## Configuration Management

All game constants centralized in `config/gameConfig.js`:

- **GAME_CONFIG**: Phaser game configuration
- **DESIGN_CONSTANTS**: Visual and gameplay constants
- **BUCKET_CONFIG**: Bucket values and appearance

Benefits:
- Single source of truth
- Easy balancing and tuning
- No magic numbers in code

## Performance Considerations

### Object Pooling
Currently not implemented, but recommended for:
- Balls (if many simultaneous)
- Particles
- UI text elements

### Particle Management
- Trail particles follow ball
- Limited lifespan (300ms)
- Auto-cleanup on ball destroy
- Sakura particles at low frequency (300-600ms)

### Collision Optimization
- Static pin group (no movement calculations)
- Zone-based bucket detection (overlap, not collision)
- Early exit on inactive balls

## Extension Points

### Adding New Scenes
1. Create scene class in `scenes/`
2. Import in `main.js`
3. Add to `GAME_CONFIG.scene` array
4. Link from existing scene transitions

### Adding New Entities
1. Create class in `entities/`
2. Extend appropriate Phaser class
3. Implement constructor and methods
4. Use in scene's `create()` method

### Adding New Systems
1. Create class in `systems/`
2. Initialize in scene constructor
3. Call methods from scene lifecycle
4. Clean up in scene's `shutdown()`

## Build and Deployment

### Development
```bash
npm run dev  # Starts Vite dev server on port 3000
```

### Production Build
```bash
npm run build  # Outputs to dist/
```

### Preview Production Build
```bash
npm run preview
```

## Dependencies

### Runtime
- `phaser`: ^3.80.1

### Development
- `vite`: ^5.0.0

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- ES6+ support
- WebGL or Canvas
- LocalStorage

## Future Improvements

### Planned Features
- Sound effects integration
- Level progression system
- Power-ups and special balls
- Leaderboards
- Mobile touch optimization

### Technical Debt
- Add comprehensive test suite
- Implement object pooling
- Add TypeScript definitions
- Performance profiling and optimization
- Asset loading error handling

## References

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Vite Documentation](https://vitejs.dev/)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
