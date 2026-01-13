/**
 * Feature Configuration System
 * 
 * This file defines all configurable features in the game.
 * To add a new feature, simply add an object to the FEATURES array following this schema:
 * 
 * {
 *   id: "unique_feature_id",           // Unique identifier for the feature
 *   name: "Feature Display Name",       // Name shown in settings UI
 *   description: "What this does",      // Short description for users
 *   category: "gameplay",               // Category: gameplay, audio, visual
 *   enabled: true,                      // Default enabled state
 *   parameters: [                       // Optional: configurable parameters
 *     {
 *       key: "paramName",               // Parameter identifier
 *       label: "Param Label",           // Label shown in UI
 *       type: "number",                 // Type: number, boolean, select
 *       default: 100,                   // Default value
 *       min: 50,                        // For number: minimum value
 *       max: 200,                       // For number: maximum value
 *       step: 10,                       // For number: slider step
 *       options: [{value, label}]       // For select: available options
 *     }
 *   ]
 * }
 */

export const FEATURES = [
  // ===== GAMEPLAY FEATURES =====
  {
    id: "creature",
    name: "Créature Yokai",
    description: "Active la créature qui se déplace dans le jeu",
    category: "gameplay",
    enabled: false,
    parameters: [
      {
        key: "speed",
        label: "Vitesse",
        type: "number",
        default: 100,
        min: 50,
        max: 200,
        step: 10
      },
      {
        key: "count",
        label: "Nombre de créatures",
        type: "number",
        default: 1,
        min: 1,
        max: 3,
        step: 1
      },
      {
        key: "dashIntensity",
        label: "Intensité du dash",
        type: "number",
        default: 2.0,
        min: 1.5,
        max: 3.0,
        step: 0.1
      },
      {
        key: "creatureSize",
        label: "Taille",
        type: "number",
        default: 18,
        min: 12,
        max: 30,
        step: 2
      }
    ]
  },
  {
    id: "movingPins",
    name: "Pins Mouvants",
    description: "Les pins se déplacent de gauche à droite, une ligne sur deux",
    category: "gameplay",
    enabled: false,
    parameters: [
      {
        key: "speed",
        label: "Vitesse de déplacement",
        type: "number",
        default: 50,
        min: 20,
        max: 150,
        step: 10
      },
      {
        key: "distance",
        label: "Distance de déplacement (px)",
        type: "number",
        default: 30,
        min: 10,
        max: 60,
        step: 5
      },
      {
        key: "alternateDirection",
        label: "Direction alternée par ligne",
        type: "boolean",
        default: true
      }
    ]
  },
  {
    id: "pins",
    name: "Configuration des Pins",
    description: "Ajuste la grille de pins dans le jeu",
    category: "gameplay",
    enabled: true,
    parameters: [
      {
        key: "rows",
        label: "Nombre de rangées",
        type: "number",
        default: 12,
        min: 8,
        max: 15,
        step: 1
      },
      {
        key: "cols",
        label: "Nombre de colonnes",
        type: "number",
        default: 8,
        min: 6,
        max: 12,
        step: 1
      },
      {
        key: "wabiSabi",
        label: "Imperfections naturelles (Wabi-Sabi)",
        type: "boolean",
        default: true
      },
      {
        key: "randomSize",
        label: "Random pin size",
        type: "boolean",
        default: false
      }
    ]
  },

  // ===== AUDIO FEATURES =====
  {
    id: "sounds",
    name: "Effets Sonores",
    description: "Active/désactive tous les sons du jeu",
    category: "audio",
    enabled: true,
    parameters: [
      {
        key: "volume",
        label: "Volume général",
        type: "number",
        default: 0.7,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        key: "maInterval",
        label: "Intervalle Ma (間) en ms",
        type: "number",
        default: 150,
        min: 50,
        max: 500,
        step: 50
      },
      {
        key: "allowOverlap",
        label: "Superposition des sons (pins)",
        type: "boolean",
        default: false
      }
    ]
  },

  // ===== VISUAL FEATURES =====
  {
    id: "ballTrail",
    name: "Traînée de la Boule",
    description: "Affiche une traînée derrière la boule montrant son parcours",
    category: "visual",
    enabled: true,
    parameters: [
      {
        key: "length",
        label: "Longueur de la traînée",
        type: "number",
        default: 25,
        min: 5,
        max: 50,
        step: 5
      },
      {
        key: "thickness",
        label: "Épaisseur",
        type: "number",
        default: 3,
        min: 1,
        max: 8,
        step: 0.5
      },
      {
        key: "opacity",
        label: "Opacité maximale",
        type: "number",
        default: 0.8,
        min: 0.2,
        max: 1.0,
        step: 0.1
      }
    ]
  },
  {
    id: "pinHitEffects",
    name: "Effets de Collision Pin",
    description: "Particules et effets visuels quand la boule touche un pin",
    category: "visual",
    enabled: true,
    parameters: [
      {
        key: "particleDuration",
        label: "Durée des particules (ms)",
        type: "number",
        default: 200,
        min: 50,
        max: 500,
        step: 25
      },
      {
        key: "particleCount",
        label: "Nombre de particules",
        type: "number",
        default: 6,
        min: 3,
        max: 15,
        step: 1
      },
      {
        key: "shockwaveDuration",
        label: "Durée onde de choc (ms)",
        type: "number",
        default: 150,
        min: 50,
        max: 400,
        step: 25
      }
    ]
  },
  {
    id: "particles",
    name: "Effets de Particules",
    description: "Affiche les particules de sakura et autres effets visuels",
    category: "visual",
    enabled: true,
    parameters: [
      {
        key: "density",
        label: "Densité des particules",
        type: "number",
        default: 1.0,
        min: 0.5,
        max: 2.0,
        step: 0.1
      }
    ]
  },
  {
    id: "hardcore_launch",
    name: "Mode Hardcore - Lancement",
    description: "Active le mode de lancement hardcore avec 3 curseurs oscillants (taille, angle, force)",
    category: "gameplay",
    enabled: false,
    parameters: [
      {
        key: "sizeSpeed",
        label: "Vitesse oscillation taille",
        type: "number",
        default: 1500,
        min: 500,
        max: 3000,
        step: 100
      },
      {
        key: "angleSpeed",
        label: "Vitesse oscillation angle",
        type: "number",
        default: 2000,
        min: 500,
        max: 3000,
        step: 100
      },
      {
        key: "forceSpeed",
        label: "Vitesse oscillation force",
        type: "number",
        default: 1800,
        min: 500,
        max: 3000,
        step: 100
      },
      {
        key: "minSize",
        label: "Taille minimum",
        type: "number",
        default: 8,
        min: 4,
        max: 12,
        step: 1
      },
      {
        key: "maxSize",
        label: "Taille maximum",
        type: "number",
        default: 15,
        min: 12,
        max: 25,
        step: 1
      },
      {
        key: "minAngle",
        label: "Angle minimum (degrés)",
        type: "number",
        default: -45,
        min: -90,
        max: 0,
        step: 5
      },
      {
        key: "maxAngle",
        label: "Angle maximum (degrés)",
        type: "number",
        default: 45,
        min: 0,
        max: 90,
        step: 5
      },
      {
        key: "minForce",
        label: "Force minimum",
        type: "number",
        default: 50,
        min: 0,
        max: 200,
        step: 10
      },
      {
        key: "maxForce",
        label: "Force maximum",
        type: "number",
        default: 400,
        min: 200,
        max: 800,
        step: 50
      }
    ]
  },

  // ===== ADDICTIVE MECHANICS FEATURES =====
  {
    id: "screenShake",
    name: "Tremblement d'écran",
    description: "Secoue l'écran sur les gros gains et combos",
    category: "visual",
    enabled: true,
    parameters: [
      {
        key: "intensity",
        label: "Intensité",
        type: "number",
        default: 1,
        min: 0.5,
        max: 2,
        step: 0.1
      }
    ]
  },
  {
    id: "slowMotion",
    name: "Ralenti dramatique",
    description: "Ralentit le temps quand la balle approche des gros buckets",
    category: "visual",
    enabled: true,
    parameters: []
  },
  {
    id: "comboAnnouncements",
    name: "Annonces de combo",
    description: "Affiche des messages excitants lors de gros combos (GREAT!, AMAZING!, etc.)",
    category: "visual",
    enabled: true,
    parameters: []
  },
  {
    id: "nearMissEffect",
    name: "Effet 'SI PRÈS !'",
    description: "Signale quand la balle frôle un bucket à haute valeur",
    category: "visual",
    enabled: true,
    parameters: []
  },
  {
    id: "goldenBall",
    name: "Balle dorée",
    description: "1/10 chance d'obtenir une balle dorée avec gains doublés",
    category: "gameplay",
    enabled: true,
    parameters: [
      {
        key: "chance",
        label: "Probabilité",
        type: "number",
        default: 0.1,
        min: 0.05,
        max: 0.25,
        step: 0.05
      }
    ]
  },
  {
    id: "mysteryBucket",
    name: "Bucket mystère",
    description: "Un bucket '?' avec multiplicateur aléatoire",
    category: "gameplay",
    enabled: true,
    parameters: [
      {
        key: "spawnChance",
        label: "Chance d'apparition",
        type: "number",
        default: 0.3,
        min: 0.1,
        max: 0.5,
        step: 0.1
      }
    ]
  },
  {
    id: "luckyZone",
    name: "Zone chance x20",
    description: "Zone dorée x20 qui apparaît aléatoirement",
    category: "gameplay",
    enabled: true,
    parameters: [
      {
        key: "spawnInterval",
        label: "Intervalle d'apparition (sec)",
        type: "number",
        default: 45,
        min: 20,
        max: 120,
        step: 5
      },
      {
        key: "duration",
        label: "Durée visible (sec)",
        type: "number",
        default: 8,
        min: 3,
        max: 15,
        step: 1
      }
    ]
  },
  {
    id: "achievements",
    name: "Succès et badges",
    description: "Système de succès à débloquer avec notifications",
    category: "gameplay",
    enabled: true,
    parameters: []
  },
  {
    id: "comebackBonus",
    name: "Bonus de retour",
    description: "Multiplicateur bonus quand le solde est bas",
    category: "gameplay",
    enabled: true,
    parameters: [
      {
        key: "threshold",
        label: "Seuil de déclenchement (%)",
        type: "number",
        default: 20,
        min: 10,
        max: 40,
        step: 5
      },
      {
        key: "bonus",
        label: "Bonus multiplicateur (%)",
        type: "number",
        default: 50,
        min: 25,
        max: 100,
        step: 25
      }
    ]
  },
  {
    id: "progressBar",
    name: "Barre de progression",
    description: "Affiche la progression vers le prochain palier/thème",
    category: "visual",
    enabled: true,
    parameters: []
  },
  {
    id: "comboBar",
    name: "Barre de combo",
    description: "Barre visuelle colorée montrant le niveau de combo actuel",
    category: "visual",
    enabled: true,
    parameters: []
  },
  {
    id: "hotColdIndicator",
    name: "Indicateur Hot/Cold",
    description: "Montre quels buckets ont été touchés récemment",
    category: "visual",
    enabled: true,
    parameters: []
  }
];

// Category labels for UI grouping
export const CATEGORY_LABELS = {
  gameplay: "GAMEPLAY",
  audio: "AUDIO",
  visual: "VISUELS"
};

// Helper function to get features by category
export function getFeaturesByCategory() {
  const grouped = {};
  FEATURES.forEach(feature => {
    if (!grouped[feature.category]) {
      grouped[feature.category] = [];
    }
    grouped[feature.category].push(feature);
  });
  return grouped;
}

/**
 * MALUS POOL - Rogue-like difficulty modifiers
 * Each malus increases the score multiplier as reward for higher difficulty
 * 
 * Formula: baseMultiplier = 1 + sum(bonusPercent/100)
 * If hardcore is active: finalMultiplier = baseMultiplier * 2
 * 
 * Example: 2 creatures (+66%) + moving pins (+50%) + hardcore (x2) = (1 + 0.66 + 0.50) * 2 = 4.32x
 */
export const MALUS_POOL = [
  {
    id: "creature_1",
    nameKey: "malus.creature1",
    descriptionKey: "malus.creature1Desc",
    icon: "👹",
    bonusPercent: 33,
    featureId: "creature",
    featureParams: { count: 1 },
    isHardcore: false
  },
  {
    id: "creature_2",
    nameKey: "malus.creature2",
    descriptionKey: "malus.creature2Desc",
    icon: "👹👹",
    bonusPercent: 66,
    featureId: "creature",
    featureParams: { count: 2 },
    isHardcore: false
  },
  {
    id: "creature_3",
    nameKey: "malus.creature3",
    descriptionKey: "malus.creature3Desc",
    icon: "👹👹👹",
    bonusPercent: 99,
    featureId: "creature",
    featureParams: { count: 3 },
    isHardcore: false
  },
  {
    id: "moving_pins",
    nameKey: "malus.movingPins",
    descriptionKey: "malus.movingPinsDesc",
    icon: "↔️",
    bonusPercent: 50,
    featureId: "movingPins",
    featureParams: {},
    isHardcore: false
  },
  {
    id: "random_pin_size",
    nameKey: "malus.randomPinSize",
    descriptionKey: "malus.randomPinSizeDesc",
    icon: "🎲",
    bonusPercent: 25,
    featureId: "pins",
    featureParams: { randomSize: true },
    isHardcore: false
  },
  {
    id: "hardcore_mode",
    nameKey: "malus.hardcoreMode",
    descriptionKey: "malus.hardcoreModeDesc",
    icon: "💀",
    bonusPercent: 0, // Hardcore doubles the TOTAL, not additive
    featureId: "hardcore_launch",
    featureParams: {},
    isHardcore: true // Special flag: doubles total multiplier
  }
];

/**
 * Generate a random malus configuration
 * @param {number} minMaluses - Minimum number of maluses (default 2)
 * @param {number} maxMaluses - Maximum number of maluses (default 4)
 * @returns {Object} Configuration with selectedMaluses array and computed multiplier
 */
export function generateRandomMalusConfig(minMaluses = 2, maxMaluses = 4) {
  // Shuffle the malus pool
  const shuffled = [...MALUS_POOL].sort(() => Math.random() - 0.5);

  // Pick random count between min and max
  const count = Math.floor(Math.random() * (maxMaluses - minMaluses + 1)) + minMaluses;

  // Select maluses, avoiding duplicates for creature variants
  const selected = [];
  let hasCreature = false;

  for (const malus of shuffled) {
    if (selected.length >= count) break;

    // Only allow one creature variant
    if (malus.featureId === "creature") {
      if (hasCreature) continue;
      hasCreature = true;
    }

    selected.push(malus);
  }

  // Calculate multiplier
  const multiplier = calculateMalusMultiplier(selected);

  return {
    selectedMaluses: selected,
    multiplier
  };
}

/**
 * Calculate the score multiplier from selected maluses
 * Formula: (1 + sum(bonusPercent/100)) * (2 if hardcore else 1)
 * @param {Array} maluses - Array of selected malus objects
 * @returns {number} Final multiplier (e.g., 2.32)
 */
export function calculateMalusMultiplier(maluses) {
  let bonusSum = 0;
  let hasHardcore = false;

  for (const malus of maluses) {
    if (malus.isHardcore) {
      hasHardcore = true;
    } else {
      bonusSum += malus.bonusPercent;
    }
  }

  const baseMultiplier = 1 + (bonusSum / 100);
  return hasHardcore ? baseMultiplier * 2 : baseMultiplier;
}
