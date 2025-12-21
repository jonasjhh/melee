# Melee Combat Game

A turn-based combat game built with TypeScript and React, featuring a modular battle simulator architecture that runs entirely in the browser.

> **See [ARCHITECTURE.md](ARCHITECTURE.md)** for detailed technical documentation about the battle simulator, dependency injection, and migration paths.

## Game Features

- **Hero vs Skeleton Combat**: Turn-based battles with intelligent AI
- **3 Skills**: Attack, Defend, and Skip
- **Visual Interface**: Health bars, battle log, and responsive UI
- **Smart AI**: Skeleton automatically responds with random tactics
- **In-Browser**: No server required, runs completely client-side

## Prerequisites

- Node.js 20+
- pnpm 10+

## Installation

```bash
pnpm install
```

## Quick Start

### Development Mode

Start the development server:

```bash
pnpm dev
```

This will open the game at [http://localhost:5173](http://localhost:5173)

## Scripts

### Development

```bash
pnpm dev             # Start Vite dev server
```

### Build

```bash
pnpm build           # Build for production
pnpm preview         # Preview production build
```

### Testing

```bash
pnpm test            # Run all tests
pnpm test:watch      # Run tests in watch mode
pnpm test:coverage   # Run tests with coverage report
pnpm test:mutation   # Run mutation testing
```

### Code Quality

```bash
pnpm lint            # Lint all code
pnpm lint:fix        # Lint and auto-fix issues
pnpm format          # Format all code with Prettier
pnpm format:check    # Check code formatting
pnpm typecheck       # Run TypeScript type checking
```

### Cleanup

```bash
pnpm clean           # Remove build artifacts and coverage reports
```

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD pipeline
├── src/
│   ├── backend/               # Game logic (runs in browser)
│   │   ├── battle-simulator.ts      # Pure battle logic
│   │   ├── game-orchestrator.ts     # Hero vs Skeleton game
│   │   ├── game-service.ts          # Service interface
│   │   ├── in-browser-game-service.ts  # Browser implementation
│   │   ├── api-game-service.ts      # Future server implementation
│   │   ├── types.ts                 # Type definitions
│   │   ├── skills.ts                # Skill definitions
│   │   ├── unit.ts                  # Unit creation
│   │   └── ai.ts                    # AI logic
│   ├── frontend/              # React UI
│   │   ├── App.tsx            # Main app component
│   │   ├── App.css            # Styles
│   │   └── main.tsx           # Entry point
│   └── tests/                 # All tests
│       ├── battle-simulator.test.ts
│       ├── game-orchestrator.test.ts
│       ├── in-browser-game-service.test.ts
│       ├── game.test.ts
│       ├── unit.test.ts
│       └── ai.test.ts
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── vitest.config.ts           # Vitest config
├── eslint.config.js           # ESLint config
├── ARCHITECTURE.md            # Architecture documentation
└── README.md                  # This file
```

## Game Mechanics

### Units

- **Hero**: 100 HP, player-controlled
- **Skeleton**: 80 HP, AI-controlled

### Skills

1. **Attack** - Deal 20 damage to opponent
2. **Defend** - Reduce incoming damage by 50% on next attack
3. **Skip** - Do nothing (pass your turn)

### AI Behavior

The Skeleton uses a simple random strategy, alternating between Attack and Defend.

## Architecture Highlights

This game is built with a **modular battle simulator** architecture:

- **Pure battle logic**: Unit-agnostic combat engine
- **Dependency injection**: Units and configurations are injected
- **Service abstraction**: Easy to switch between in-browser and server-based gameplay
- **Fully tested**: 56 passing tests with comprehensive coverage

### Current Setup (In-Browser)

All game logic runs in the browser:
- No server required
- Instant responses
- Works offline

### Future Migration (Optional Server)

The architecture supports easy migration to a server:
```typescript
// Change one line in App.tsx:
const gameService = new ApiGameService('https://api.yourgame.com');
```

All business logic remains unchanged!

## Configuration

### TypeScript

- Target: ES2022
- Module: ESNext
- Strict mode enabled
- Full type coverage

### Vitest

- Coverage thresholds: 80% for all metrics
- jsdom environment for React components
- Fast execution with smart watch mode

### Stryker Mutator

- Mutation score thresholds: High 80%, Low 60%, Break 50%
- Ensures test quality

## CI/CD

GitHub Actions automatically:
1. Runs linter and type checking
2. Runs all tests
3. Builds the frontend
4. Deploys to GitHub Pages (on main branch)

## Development Tips

### Adding New Skills

See [ARCHITECTURE.md](ARCHITECTURE.md#adding-new-skills) for examples.

### Custom AI Strategies

```typescript
const smartAI = (state: GameState) => {
  return state.hero.isDefending ? 'attack' : 'defend';
};

executeAction(state, action, { defenderStrategy: smartAI });
```

### Injecting Different Units

```typescript
const warrior = createWarrior();
const dragon = createDragon();
const battle = createBattle(warrior, dragon);
```

## License

ISC
