# Pachinko Game 🎌

A beautiful pachinko game built with Phaser 3 and Vite, incorporating Japanese aesthetic principles and emotional design.

## Features

- 🌸 Japanese-inspired visual design with sakura petals and warm colors
- 🎵 Traditional audio elements (koto, taiko, shakuhachi)
- ✨ Emotional feedback system with combos and multipliers
- 🎨 Wabi-sabi aesthetic with organic, imperfect beauty
- 🏮 Cultural concepts: Ma (間), Iki (粋), Mono no aware (物の哀れ)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser at `http://localhost:3000`

### Build

```bash
npm run build
```

## How to Play

### Getting Started
1. Start with a yen balance (default: ¥500)
2. Place a bet to convert yen into credits (exchange rate: 100 yen = 10 credits)
3. Each ball launch costs 1 credit

### Gameplay
1. Click anywhere on the screen to launch a ball (costs 1 credit)
2. Watch as the ball bounces through pins
3. Score points when balls land in buckets at the bottom
4. Build combos by hitting multiple pins in succession
5. Higher combos = higher multipliers!

### Credits & Economy
- **Yen Balance**: Your total money available for betting
- **Credits**: Game currency used to launch balls
- **Exchange Rate**: 100 yen = 10 credits
- **Ball Cost**: 1 credit per launch
- **Earning Credits**: Score 25 points = 1 credit earned
- **Mid-Game Betting**: When credits run out, you can bet more yen to continue
- **Cash Out**: At game over, convert remaining credits back to yen

### Scoring System
- Buckets award different point values (10, 30, 50, 100)
- Combos increase your score multiplier (1 + combo × 0.2)
- Points can be converted to credits (25 points = 1 credit)
- Keep earning to extend your gameplay!

## Project Structure

```
pachinko/
├── src/
│   ├── config/        # Game configuration
│   ├── scenes/        # Phaser scenes
│   ├── entities/      # Game entities (Ball, Pin, etc.)
│   ├── systems/       # Game systems (Audio, Score, etc.)
│   └── main.js        # Entry point
├── public/
│   └── assets/        # Images, audio, fonts
└── docs/              # Documentation
```

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development guidelines.

## License

MIT
