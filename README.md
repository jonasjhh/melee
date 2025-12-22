# Melee Combat Game

A turn-based tactical combat game built with TypeScript and React, featuring a grid-based battle system with multiple units, advanced skills, and buff mechanics.

> **See [ARCHITECTURE.md](ARCHITECTURE.md)** for detailed technical documentation about the battle simulator, grid system, and architectural patterns.

## Game Features

- **Grid-Based Combat**: 4x4 battlefield with positional tactics
- **Party System**: Multiple units per team (heroes vs enemies)
- **9 Unique Skills**: Melee attacks, ranged spells, buffs, and healing
- **Buff/Debuff System**: Temporary status effects with duration tracking
- **Advanced Targeting**: Melee, ranged, ally, and enemy targeting
- **Smart AI**: Enemies use tactical decision-making
- **Turn-Based Strategy**: Initiative-based turn order system
- **Visual Interface**: Health bars, battle log, grid display, and responsive UI
- **In-Browser**: No server required, runs completely client-side

## Skills

### Basic Skills
1. **Attack** - Melee attack targeting front-row enemies
2. **Defend** - Reduce incoming damage by 50% until your next turn
3. **Skip** - Pass your turn

### Advanced Skills
4. **Heal** - Restore 30 HP to any ally (ranged)
5. **Bolt** - Ranged magical attack (0.8x damage, can target any enemy)
6. **Leech** - Damage enemy and heal yourself for 50% of damage dealt (ranged)
7. **Haste** - Increase initiative by 10 for 5 turns (ranged buff)
8. **Bless** - Increase power by 10 for 5 turns (ranged buff)
9. **Regen** - Heal 5 HP per turn for 5 turns (ranged buff)

## Prerequisites

- Node.js 20+
- pnpm 10+
- mise (for version management)

## Installation

```bash
# Activate mise
eval "$(mise activate bash)"

# Install dependencies
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
pnpm test:mutation   # Run mutation testing (98.96% score)
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
│   │   ├── battleSimulator.ts       # Core battle logic
│   │   ├── gameOrchestrator.ts      # Game state management
│   │   ├── gridSystem.ts            # 4x4 grid and positioning
│   │   ├── initiativeSystem.ts      # Turn order management
│   │   ├── buffSystem.ts            # Buff/debuff mechanics
│   │   ├── targetingSystem.ts       # Target validation
│   │   ├── skillDefinitions.ts      # All 9 skills
│   │   ├── characterModel.ts        # Character templates
│   │   ├── partyComposer.ts         # Party creation
│   │   ├── unit.ts                  # Unit instances
│   │   ├── ai.ts                    # AI decision-making
│   │   ├── gameService.ts           # Service interface
│   │   ├── inBrowserGameService.ts  # Browser implementation
│   │   ├── apiGameService.ts        # Future server implementation
│   │   └── types.ts                 # Type definitions
│   ├── frontend/              # React UI
│   │   ├── App.tsx            # Main app component
│   │   ├── App.css            # Styles
│   │   └── main.tsx           # Entry point
│   └── tests/                 # All tests (38 passing)
│       ├── battleSimulator.test.ts
│       ├── gameOrchestrator.test.ts
│       ├── inBrowserGameService.test.ts
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
├── DEVELOPMENT.md             # Development guide
└── README.md                  # This file
```

## Game Mechanics

### Grid System

- **4x4 Battlefield**: Units positioned on a grid
- **Two Teams**: Player team (front 2 rows) vs Enemy team (back 2 rows)
- **Positioning Matters**: Melee attacks only hit front row, ranged can hit anyone

### Character Models

Characters are defined as templates with base stats:
- **Hero**: 100 HP, 15 Power, 5 Defense, 10 Initiative
- **Skeleton**: 80 HP, 12 Power, 3 Defense, 8 Initiative

### Buff System

Buffs and debuffs have:
- **Type**: defending, haste, bless, regen
- **Duration**: Number of turns remaining
- **Value**: Numeric effect (e.g., +10 power)
- **Stacking**: Buffs refresh to longest duration

Buffs are decremented at the **start** of each unit's turn.

### Turn Order

- Initiative-based system
- Higher initiative acts first within each round
- Turn order: All player units, then all enemy units
- Dead units are skipped automatically

### Combat Resolution

1. **Damage Calculation**: `damage = max(1, power - defense)`
2. **Defending**: Reduces damage by 50%, removed after being hit
3. **Effective Stats**: Buffs modify power (bless) and initiative (haste)
4. **Death**: Unit reduced to 0 HP is removed from combat
5. **Victory**: Game ends when one team is eliminated

### AI Behavior

The AI randomly selects from available skills:
- **Attack**: Targets highest health enemy
- **Heal**: Targets lowest health ally
- **Defend**: Self-protection

## Architecture Highlights

This game is built with a **modular grid-based battle system**:

- **Pure battle logic**: Grid-agnostic combat engine
- **Character model pattern**: Separation of templates from instances
- **Buff system**: Flexible status effect framework
- **Dependency injection**: Units and configurations are injected
- **Service abstraction**: Easy to switch between in-browser and server-based gameplay
- **Fully tested**: 38 passing tests with 98.96% mutation score

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
- 38 tests with comprehensive coverage

### Stryker Mutator

- Mutation score: 98.96%
- High threshold: 80%, Low: 60%, Break: 50%
- Ensures test quality

## CI/CD

GitHub Actions automatically:
1. Runs linter and type checking
2. Runs all tests
3. Builds the frontend
4. Deploys to GitHub Pages (on main branch)

## Development Tips

### Adding New Character Models

See [ARCHITECTURE.md](ARCHITECTURE.md#character-models) for examples.

### Adding New Skills

See [ARCHITECTURE.md](ARCHITECTURE.md#adding-new-skills) for examples.

### Custom AI Strategies

```typescript
const smartAI = (state: GameState, unitId: string) => {
  const unit = state.grid.units.get(unitId);
  if (unit.health < 30) return { skill: 'heal', targets: [unitId] };
  return { skill: 'attack', targets: [...] };
};
```

### Creating Custom Parties

```typescript
import { composeParty } from './backend/partyComposer';
import { HERO, SKELETON } from './backend/characterModel';

const playerParty = composeParty('player', [HERO, HERO, HERO]);
const enemyParty = composeParty('enemy', [SKELETON, SKELETON, SKELETON, SKELETON]);
```

## License

ISC
