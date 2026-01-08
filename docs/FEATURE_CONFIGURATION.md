# Feature Configuration System

## Overview

The Pachinko game now includes a powerful, data-driven feature configuration system that allows players to customize game features before starting. The system is designed to be easily extensible - new features can be added by simply defining them in JSON format.

## Architecture

### Core Components

1. **`src/config/featureConfig.js`** - Feature definitions in JSON format
2. **`src/managers/FeatureManager.js`** - Centralized feature management singleton
3. **`src/managers/StateManager.js`** - localStorage persistence for settings
4. **`src/components/ModalComponent.js`** - Reusable modal for parameter editing
5. **`src/scenes/MenuScene.js`** - Settings UI with feature toggles

## How It Works

### Player Experience

1. Player opens the game and sees the main menu
2. Clicks "⚙️ SETTINGS" button
3. Settings overlay appears with features grouped by category:
   - ⚙️ **Gameplay** (Creature, Pins)
   - 🔊 **Audio** (Sounds)
   - ✨ **Visuels** (Particles)
4. Each feature has:
   - **Checkbox** - Enable/disable the feature
   - **Configure button** - Opens modal to adjust parameters (only visible when enabled)
5. Changes are saved to localStorage automatically
6. Settings persist across sessions

### Existing Features

#### Gameplay Features

**Créature Yokai**

- Enable/disable the wandering creature
- Parameters:
  - Speed: 50-200 (default: 100)
  - Count: 1-3 creatures (default: 1)

**Configuration des Pins**

- Configure the pin grid
- Parameters:
  - Rows: 8-16 (default: 12)
  - Columns: 6-12 (default: 8)
  - Wabi-Sabi: Toggle natural imperfections (default: ON)

#### Audio Features

**Effets Sonores**

- Enable/disable all game sounds
- Parameters:
  - Volume: 0.0-1.0 (default: 0.7)
  - Ma Interval (間): 50-500ms (default: 150ms)

#### Visual Features

**Effets de Particules**

- Enable/disable sakura particle effects
- Parameters:
  - Density: 0.5-2.0 (default: 1.0)

## Adding New Features

### Step 1: Define the Feature

Add a new object to the `FEATURES` array in `src/config/featureConfig.js`:

```javascript
{
  id: "my_new_feature",              // Unique identifier
  name: "My New Feature",             // Display name in UI
  description: "What this feature does", // Short description
  category: "gameplay",               // gameplay, audio, or visual
  enabled: true,                      // Default enabled state
  parameters: [                       // Optional configurable parameters
    {
      key: "intensity",
      label: "Intensity Level",
      type: "number",               // number, boolean, or select
      default: 50,
      min: 0,
      max: 100,
      step: 5
    },
    {
      key: "autoMode",
      label: "Automatic Mode",
      type: "boolean",
      default: false
    }
  ]
}
```

### Step 2: Use the Feature in Your Code

```javascript
import FeatureManager from "../managers/FeatureManager.js";

// In your scene's create() or init() method:
FeatureManager.init();

// Check if feature is enabled
if (FeatureManager.isEnabled("my_new_feature")) {
  // Get parameter values
  const intensity = FeatureManager.getParameter("my_new_feature", "intensity");
  const autoMode = FeatureManager.getParameter("my_new_feature", "autoMode");

  // Use the values to configure your feature
  this.createMyFeature(intensity, autoMode);
}
```

### Step 3: That's It!

The UI, persistence, and configuration management are all handled automatically. Your feature will appear in the settings menu with appropriate controls based on the parameter types you defined.

## Parameter Types

### Number

- Renders as a slider with value display
- Properties: `min`, `max`, `step`, `default`
- Use for: speeds, counts, percentages, ranges

### Boolean

- Renders as a toggle switch (ON/OFF)
- Properties: `default`
- Use for: enable/disable sub-features, modes

### Select (Future)

- Renders as a dropdown menu
- Properties: `options` (array of {value, label}), `default`
- Use for: multiple choice options

## FeatureManager API

### Initialization

```javascript
FeatureManager.init(); // Load features and saved settings
```

### Query Methods

```javascript
// Check if a feature is enabled
const enabled = FeatureManager.isEnabled("creature");

// Get a parameter value
const speed = FeatureManager.getParameter("creature", "speed");

// Get feature definition
const feature = FeatureManager.getFeature("creature");

// Get all features
const allFeatures = FeatureManager.getAllFeatures();

// Get features by category
const grouped = FeatureManager.getFeaturesByCategory();
```

### Mutation Methods

```javascript
// Toggle a feature
FeatureManager.toggleFeature("creature");

// Set feature state
FeatureManager.setEnabled("creature", true);

// Set a parameter value (with automatic validation)
FeatureManager.setParameter("creature", "speed", 150);

// Save current configuration
FeatureManager.saveConfig();

// Reset to defaults
FeatureManager.resetToDefaults();
```

## Examples

### Example 1: Conditional Feature Creation

```javascript
// In GameScene.js
create() {
  FeatureManager.init();

  // Only create particle system if enabled
  if (FeatureManager.isEnabled('particles')) {
    const density = FeatureManager.getParameter('particles', 'density');
    this.createParticleSystem(density);
  }
}
```

### Example 2: Configurable Entity

```javascript
// In GameScene.js
createCreature() {
  const speed = FeatureManager.getParameter('creature', 'speed') || 100;
  const count = FeatureManager.getParameter('creature', 'count') || 1;

  const config = { ...CREATURE_CONFIG, SPEED: speed };

  for (let i = 0; i < count; i++) {
    const creature = new Creature(this, x, y, config);
    this.creatures.push(creature);
  }
}
```

### Example 3: Dynamic Audio Configuration

```javascript
// In AudioSystem.js
constructor(scene) {
  this.scene = scene;
  this.enabled = FeatureManager.isEnabled('sounds');
  this.maInterval = FeatureManager.getParameter('sounds', 'maInterval') || 150;

  const volume = FeatureManager.getParameter('sounds', 'volume');
  if (volume !== undefined) {
    this.setVolume(volume);
  }
}
```

## Best Practices

1. **Always call `FeatureManager.init()`** in your scene's `init()` or `create()` method
2. **Provide sensible defaults** when getting parameters: `getParameter('x', 'y') || defaultValue`
3. **Use categories** to organize related features (gameplay, audio, visual)
4. **Keep descriptions short** - they appear in the UI
5. **Choose appropriate parameter ranges** - consider gameplay balance
6. **Test with features disabled** - ensure the game works when features are off

## Technical Details

### Data Flow

1. **Definition** → `featureConfig.js` defines features
2. **Load** → `FeatureManager.init()` loads definitions
3. **Merge** → Saved settings from localStorage are merged with defaults
4. **UI** → MenuScene auto-generates settings interface
5. **Save** → User changes are persisted via StateManager
6. **Use** → Game code queries FeatureManager for current values

### Storage Format

Settings are stored in localStorage under key `pachinko_game_state_features`:

```json
{
  "creature": {
    "enabled": true,
    "parameters": {
      "speed": 150,
      "count": 2
    }
  },
  "sounds": {
    "enabled": false,
    "parameters": {
      "volume": 0.5,
      "maInterval": 200
    }
  }
}
```

### Performance

- Settings are loaded once at initialization
- No runtime overhead for disabled features (they're not created)
- localStorage writes are batched when closing settings
- Modal UI is created on-demand and destroyed when closed

## Future Enhancements

Potential additions to the system:

1. **Presets** - Save/load feature configuration presets
2. **Import/Export** - Share configurations between players
3. **In-game settings** - Access settings during gameplay
4. **Feature dependencies** - Automatically disable dependent features
5. **Validation messages** - Visual feedback for invalid values
6. **Feature search** - Filter features by name in settings
7. **Select parameter type** - Dropdown menus for multiple choices
8. **Color picker type** - Choose colors for visual customization

## Troubleshooting

**Settings not persisting?**

- Check browser localStorage is enabled
- Verify `FeatureManager.saveConfig()` is being called
- Check browser console for errors

**Feature not appearing in settings?**

- Ensure feature is added to `FEATURES` array in featureConfig.js
- Check that category is valid (gameplay, audio, visual)
- Verify no JavaScript syntax errors

**Parameter changes not working?**

- Confirm code is calling `FeatureManager.getParameter()`
- Check parameter key matches definition
- Ensure init() is called before querying

**Modal not opening?**

- Verify feature has `parameters` array defined
- Check that feature is enabled (Configure button only works when enabled)
- Look for JavaScript errors in console

## Contributing

When adding new features to the game:

1. Define the feature in `featureConfig.js`
2. Check feature state in your code with FeatureManager
3. Document any new categories or parameter types
4. Test with feature enabled and disabled
5. Ensure sensible default values

The system is designed to grow with the game - add as many features as needed!
