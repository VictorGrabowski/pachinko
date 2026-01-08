# 🎨 Système de Palettes de Couleurs

## Description

Le jeu Pachinko dispose désormais d'un système de sélection de palettes de couleurs qui permet de personnaliser l'apparence visuelle du jeu.

## Palettes Disponibles

### 1. 🎨 Classique
La palette originale avec des tons chauds et japonais traditionnels.
- **Primaire**: Ambre chaleureux (#F4A460)
- **Accent**: Orange coucher de soleil (#FF6B35)
- **Or**: Doré (#FFD700)
- **Fond**: Indigo profond (#2E3A59)
- **Sakura**: Rose fleur de cerisier (#FFB7C5)

### 2. 🌊 Océan
Des tons bleus apaisants évoquant la mer et le ciel.
- **Primaire**: Bleu ciel (#4FC3F7)
- **Accent**: Bleu océan (#0277BD)
- **Or**: Cyan (#00BCD4)
- **Fond**: Bleu nuit (#1A237E)
- **Sakura**: Bleu clair (#80DEEA)

### 3. 🌲 Forêt
Des verts naturels inspirés de la nature.
- **Primaire**: Vert clair (#8BC34A)
- **Accent**: Vert forêt (#558B2F)
- **Or**: Vert citron (#CDDC39)
- **Fond**: Vert sombre (#1B5E20)
- **Sakura**: Vert pastel (#AED581)

### 4. 🌅 Coucher de soleil
Des tons chauds et vibrants de fin de journée.
- **Primaire**: Orange corail (#FF7043)
- **Accent**: Rose magenta (#E91E63)
- **Or**: Ambre (#FFC107)
- **Fond**: Violet profond (#4A148C)
- **Sakura**: Rose clair (#F48FB1)

### 5. 🌙 Minuit
Des violets mystérieux pour une ambiance nocturne.
- **Primaire**: Violet moyen (#9575CD)
- **Accent**: Violet profond (#5E35B1)
- **Or**: Violet rose (#BA68C8)
- **Fond**: Noir nuancé (#1A1A2E)
- **Sakura**: Lavande (#B39DDB)

## Utilisation

### Dans le Menu
1. Lancez le jeu
2. Dans le menu principal, descendez jusqu'à la section "Palette de couleurs"
3. Cliquez sur l'une des 5 palettes disponibles
4. La palette sélectionnée est bordée en doré
5. Le jeu se recharge automatiquement avec les nouvelles couleurs

### Persistance
La palette sélectionnée est sauvegardée dans le `localStorage` du navigateur et sera automatiquement réappliquée à chaque visite.

## Implémentation Technique

### Fichiers Modifiés

1. **`src/config/gameConfig.js`**
   - Ajout de `COLOR_PALETTES` avec les 5 palettes
   - Fonctions `setActivePalette()`, `getActivePalette()`, `initPalette()`
   - Ajout de la traduction `paletteTitle`

2. **`src/main.js`**
   - Import et appel de `initPalette()` au démarrage

3. **`src/scenes/MenuScene.js`**
   - Nouvelle méthode `createPaletteSelector()`
   - Interface de sélection avec 5 boutons interactifs
   - Gestion du hover et de la sélection

### API

```javascript
// Définir une palette active
setActivePalette('ocean');

// Obtenir la palette active
const currentPalette = getActivePalette();

// Initialiser la palette sauvegardée
initPalette();

// Accéder aux couleurs actuelles
DESIGN_CONSTANTS.COLORS.PRIMARY
DESIGN_CONSTANTS.COLORS.ACCENT
DESIGN_CONSTANTS.COLORS.GOLD
DESIGN_CONSTANTS.COLORS.BACKGROUND
DESIGN_CONSTANTS.COLORS.SAKURA
```

## Développement Futur

Possibilités d'extension :
- Permettre aux utilisateurs de créer leurs propres palettes
- Ajouter plus de palettes prédéfinies
- Mode sombre/clair automatique
- Synchronisation des palettes avec les saisons
- Export/import de palettes personnalisées

