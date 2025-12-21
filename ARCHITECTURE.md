# Melee Game Architecture

This document describes the architecture of the Melee combat game, designed as a modular battle simulator that can be integrated into larger games.

## Overview

The game is structured with clear separation of concerns, making it easy to:
- Run the battle logic entirely in the browser (current setup)
- Migrate to a server-based architecture later
- Inject different units and battle configurations
- Replace AI strategies
- Test components independently

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  (React UI - displays game state, captures user input)      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Game Service (Interface)                  │
│  Abstract layer - can be in-browser OR server-based         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴───────────────┐
        ▼                              ▼
┌────────────────────┐      ┌──────────────────────┐
│  InBrowserService  │      │   ApiGameService     │
│  (Current)         │      │   (Future)           │
└────────┬───────────┘      └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Game Orchestrator                         │
│  Manages hero vs skeleton, integrates AI                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Battle Simulator                          │
│  Pure battle logic - unit-agnostic, configuration-driven    │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Battle Simulator (`battle-simulator.ts`)

**Purpose**: Pure battle logic that works with any two units.

**Key Features**:
- Unit-agnostic (doesn't know about Hero/Skeleton)
- Configuration-driven (attack damage, defense reduction)
- Pure functions (no side effects)
- Easily testable

**API**:
```typescript
createBattle(attacker: Unit, defender: Unit, config?: BattleConfig): BattleState
executeBattleAction(state: BattleState, action: SkillType, config?: BattleConfig): BattleState
```

**Usage**:
```typescript
const hero = createHero();
const skeleton = createSkeleton();
const battle = createBattle(hero, skeleton);
const newBattle = executeBattleAction(battle, 'attack');
```

### 2. Game Orchestrator (`game-orchestrator.ts`)

**Purpose**: Manages the specific Hero vs Skeleton game, integrating AI behavior.

**Key Features**:
- Wraps the battle simulator with game-specific logic
- Handles AI integration for the skeleton
- Converts between battle state and game state
- Allows custom AI strategies

**API**:
```typescript
createGame(config?: GameOrchestratorConfig): GameState
executeAction(state: GameState, action: SkillType, config?: GameOrchestratorConfig): GameState
```

**Custom AI Strategy Example**:
```typescript
const customStrategy = (state: GameState) => {
  // Always defend when health is low
  if (state.skeleton.health < 30) return 'defend';
  return 'attack';
};

const newState = executeAction(state, 'attack', {
  defenderStrategy: customStrategy
});
```

### 3. Game Service Interface (`game-service.ts`)

**Purpose**: Abstract interface that allows swapping between in-browser and server implementations.

**API**:
```typescript
interface IGameService {
  getState(): Promise<GameState>;
  newGame(): Promise<GameState>;
  performAction(action: SkillType): Promise<GameState>;
}
```

### 4. In-Browser Game Service (`in-browser-game-service.ts`)

**Purpose**: Current implementation that runs all game logic in the browser.

**Features**:
- No network calls
- Instant responses
- Perfect for single-player
- Can be used offline

### 5. API Game Service (`api-game-service.ts`)

**Purpose**: Future implementation for server-based gameplay.

**When to use**:
- Multiplayer games
- Server-side validation
- Shared game state
- Anti-cheat measures

**Migration Path**:
Simply change one line in `App.tsx`:
```typescript
// Current (in-browser)
const gameService = new InBrowserGameService();

// Future (server-based)
const gameService = new ApiGameService('https://api.yourgame.com');
```

## Data Flow

### Current Setup (In-Browser)

```
User clicks button
    ↓
Frontend calls gameService.performAction()
    ↓
InBrowserGameService calls game orchestrator
    ↓
Game orchestrator uses battle simulator
    ↓
Battle simulator executes combat logic
    ↓
AI automatically takes turn
    ↓
New state returned to frontend
    ↓
UI updates
```

### Future Setup (Server-Based)

```
User clicks button
    ↓
Frontend calls gameService.performAction()
    ↓
ApiGameService makes HTTP request
    ↓
Server's game orchestrator processes
    ↓
Battle simulator executes combat logic
    ↓
AI automatically takes turn
    ↓
Server returns new state
    ↓
Frontend receives state
    ↓
UI updates
```

## Testing Strategy

### Unit Tests
- **Battle Simulator**: Test pure combat logic with any units
- **Game Orchestrator**: Test hero/skeleton specific logic and AI integration
- **Game Service**: Test in-browser implementation

### Integration Tests
- Test full flow from user action to state update
- Test AI behavior
- Test game over conditions

## Extension Points

### Adding New Units

```typescript
// Create a new unit type
export function createWarrior(): Unit {
  return {
    id: 'warrior',
    name: 'Warrior',
    health: 120,
    maxHealth: 120,
    isDefending: false,
    skills: [...DEFAULT_SKILLS],
  };
}

// Use in battle
const battle = createBattle(createWarrior(), createSkeleton());
```

### Adding New Skills

```typescript
// Add to skills.ts
export const SKILLS = {
  ...existing,
  heal: {
    type: 'heal',
    name: 'Heal',
  },
};

// Implement in battle-simulator.ts
case 'heal':
  activeUnit.health = Math.min(
    activeUnit.maxHealth,
    activeUnit.health + 20
  );
  newState.log.push(`${activeUnit.name} heals for 20 HP!`);
  break;
```

### Custom Battle Configurations

```typescript
const hardMode = createBattle(hero, skeleton, {
  attackDamage: 30,        // Higher damage
  defendDamageReduction: 0.3, // Less effective defense
});
```

### Custom AI Strategies

```typescript
// Defensive AI
const defensiveAI = (state: GameState) => {
  return state.skeleton.health < 50 ? 'defend' : 'attack';
};

// Smart AI (attacks when hero is defending)
const smartAI = (state: GameState) => {
  return state.hero.isDefending ? 'attack' : 'defend';
};

executeAction(state, action, { defenderStrategy: smartAI });
```

## Deployment

### Current (In-Browser Only)

```bash
pnpm build:frontend
# Deploy dist/frontend to GitHub Pages, Netlify, Vercel, etc.
```

### Future (With Server)

```bash
# Backend
pnpm build:backend
# Deploy to cloud server (AWS, GCP, Heroku, etc.)

# Frontend
# Change gameService to ApiGameService
pnpm build:frontend
# Deploy to static hosting
```

## CI/CD

GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. Runs linter
2. Runs type checking
3. Runs all tests
4. Builds frontend
5. Deploys to GitHub Pages (on main branch)

## Benefits of This Architecture

1. **Modularity**: Each component has a single responsibility
2. **Testability**: Pure functions are easy to test
3. **Flexibility**: Easy to inject different units, configs, AI
4. **Migration Path**: Clear path from in-browser to server
5. **Reusability**: Battle simulator can be used in other games
6. **Type Safety**: Full TypeScript coverage
7. **Maintainability**: Clear separation of concerns

## Future Enhancements

- [ ] Add more skills (heal, buff, debuff, special attacks)
- [ ] Add equipment system
- [ ] Add multiple AI difficulty levels
- [ ] Add battle replays
- [ ] Add multiplayer support (via ApiGameService)
- [ ] Add persistence (save/load games)
- [ ] Add battle animations
- [ ] Add sound effects
