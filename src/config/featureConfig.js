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
        max: 11,
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
      }
    ]
  },

  // ===== VISUAL FEATURES =====
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
  }
];

// Category labels for UI grouping
export const CATEGORY_LABELS = {
  gameplay: "⚙️ Gameplay",
  audio: "🔊 Audio",
  visual: "✨ Visuels"
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
