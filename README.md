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

1. Click anywhere on the screen to launch a ball
2. Watch as the ball bounces through pins
3. Score points when balls land in buckets at the bottom
4. Build combos by hitting multiple pins in succession
5. Higher combos = higher multipliers!

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
