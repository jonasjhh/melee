# Melee Game - Development & Architecture Guide

This document provides comprehensive information about the Melee combat game's architecture, development setup, and best practices for working on the codebase.

## Table of Contents
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Core Systems](#core-systems)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Extension Points](#extension-points)

---

## Environment Setup

This project uses **mise** for tool version management and **pnpm** as the package manager.

### Critical: Shell Activation

**IMPORTANT**: Before running any commands, you must activate mise in your shell:

```bash
eval "$(mise activate bash)"
```

Or for zsh:
```bash
eval "$(mise activate zsh)"
```

Add this to your `.bashrc` or `.zshrc` to automatically activate mise in every shell session.

### Package Manager

**ALWAYS use pnpm, NEVER npm**

This project is configured with pnpm and all lockfiles are in pnpm format.

### Common Commands

All commands require mise to be activated first:

```bash
# Type checking
pnpm typecheck

# Run tests
pnpm test

# Run linter
pnpm lint

# Start development server
pnpm dev

# Build for production
pnpm build
```

---

## Project Structure

```
src/
├── core/                       # Shared types, models, and definitions
│   ├── types/                  # TypeScript type definitions (camelCase)
│   │   ├── skillTypes.ts       # Skill-related types
│   │   ├── buffTypes.ts        # Buff/debuff types
│   │   ├── gridTypes.ts        # Grid and positioning types
│   │   ├── unitTypes.ts        # Unit entity type
│   │   ├── turnTypes.ts        # Turn order types
│   │   ├── gameTypes.ts        # Game state types
│   │   ├── characterTypes.ts   # Character model types
│   │   └── index.ts            # Barrel export
│   ├── models/                 # Character model templates
│   │   ├── classes/            # Player character classes
│   │   │   ├── warrior.ts
│   │   │   ├── archer.ts
│   │   │   ├── cleric.ts
│   │   │   ├── mage.ts
│   │   │   ├── paladin.ts
│   │   │   ├── necromancer.ts
│   │   │   └── index.ts        # Barrel export
│   │   ├── monsters/           # Enemy monsters
│   │   │   ├── skeleton.ts
│   │   │   ├── orc.ts
│   │   │   └── index.ts        # Barrel export
│   │   ├── index.ts            # Aggregates classes, monsters, etc.
│   │   └── characterModel.ts   # Character factory and exports
│   └── skills/                 # Skill definitions
│       ├── definitions/        # Individual skill definitions
│       │   ├── attack.ts
│       │   ├── defend.ts
│       │   ├── wait.ts
│       │   ├── move.ts
│       │   ├── bolt.ts
│       │   ├── heal.ts
│       │   ├── leech.ts
│       │   ├── haste.ts
│       │   ├── bless.ts
│       │   ├── regen.ts
│       │   └── index.ts        # Barrel export
│       └── skillDefinitions.ts # Skill exports and helpers
├── backend/                    # Backend game logic
│   ├── core/                   # Backend core interfaces
│   │   ├── types.ts            # Re-exports from core/types
│   │   └── gameService.ts      # Game service interface
│   ├── models/                 # Re-exports from core/models
│   │   └── characterModel.ts
│   ├── skills/                 # Re-exports from core/skills
│   │   ├── skillDefinitions.ts
│   │   └── skills.ts
│   ├── systems/                # Game systems
│   │   ├── buffSystem.ts       # Buff/debuff management
│   │   ├── gridSystem.ts       # 4x4 battlefield grid
│   │   ├── initiativeSystem.ts # Turn order
│   │   └── targetingSystem.ts  # Target validation
│   ├── game/                   # Game logic and orchestration
│   │   ├── battleSimulator.ts  # Combat execution
│   │   ├── gameOrchestrator.ts # High-level game flow
│   │   └── partyComposer.ts    # Party composition
│   ├── ai/                     # AI logic
│   │   └── ai.ts               # Enemy AI
│   └── services/               # Service implementations
│       └── inBrowserGameService.ts # In-browser game service
├── frontend/                   # React UI
│   ├── components/             # Reusable UI components
│   │   ├── CharacterCard.tsx
│   │   ├── PlacementGrid.tsx
│   │   ├── PartySelectionPhase.tsx
│   │   ├── BattleGrid.tsx
│   │   ├── SkillButtons.tsx
│   │   └── BattlePhase.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── usePartyGrid.ts
│   │   └── useDragAndDrop.ts
│   ├── models/                 # Frontend type definitions
│   │   └── types.ts
│   ├── App.tsx                 # Main game component
│   └── App.css                 # Styles
└── tests/                      # Test files
    ├── backend/                # Backend tests
    └── frontend/               # Frontend tests
        └── hooks/              # Hook tests
```

### Key Architecture Decisions

1. **Immutable State**: All state updates create new objects rather than mutating
2. **Buff System**: Status effects (defending, haste, bless, regen) are managed via a buff system
3. **Grid-Based Combat**: 4x4 grid with positional mechanics
4. **Character Models**: Separation of templates (models) from runtime instances (units)
5. **Map for Units**: Units stored in `Map<string, Unit>` for fast lookups
6. **Shared Core**: Types, models, and skill definitions live in `src/core` and are shared between frontend and backend via re-exports
7. **camelCase File Naming**: All type files use camelCase (e.g., `skillTypes.ts`, `buffTypes.ts`) for consistency
8. **Barrel Exports**: Each directory uses an `index.ts` file to aggregate and re-export for clean imports
9. **Modular Organization**: Code organized by domain/responsibility:
   - `core/` - Shared types, models, and definitions used by both frontend and backend
   - `backend/core/` - Backend-specific interfaces with re-exports from `core/`
   - `backend/systems/` - Discrete game systems (buffs, grid, initiative, targeting)
   - `backend/game/` - High-level game orchestration and battle logic
   - `backend/ai/` - AI decision-making logic
   - `backend/services/` - Service layer implementations (in-browser, API)
   - `frontend/` - React UI components and hooks

---

## Architecture Overview

The game is structured with clear separation of concerns, making it easy to:
- Run the battle logic entirely in the browser (current setup)
- Migrate to a server-based architecture later
- Support multiple units and party-based combat
- Inject different character models and battle configurations
- Replace AI strategies
- Test components independently

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  (React UI - displays grid, units, battle log)              │
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
│  Manages game state, integrates AI, handles actions         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Battle Simulator                          │
│  Pure battle logic - executes skills, manages combat        │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┬──────────────┐
          ▼            ▼            ▼              ▼
    ┌─────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐
    │  Grid   │  │  Buffs   │  │ Target │  │Initiative│
    │ System  │  │  System  │  │ System │  │  System  │
    └─────────┘  └──────────┘  └────────┘  └──────────┘
```

### Data Flow

#### Combat Action Flow

```
User selects skill and targets
    ↓
Frontend calls gameService.performAction()
    ↓
InBrowserGameService calls executeAction()
    ↓
Game orchestrator calls battle simulator
    ↓
Battle simulator:
  1. Applies regen healing
  2. Decrements buffs
  3. Executes skill
  4. Checks deaths
  5. Checks win condition
  6. Advances turn
    ↓
New state returned to frontend
    ↓
UI updates grid and battle log
```

---

## Core Systems

### 1. Grid System (`gridSystem.ts`)

**Purpose**: Manages the 4x4 battlefield and unit positioning.

**Grid Layout**:
```
Row 0-1: Player Team (Front)
Row 2-3: Enemy Team (Back)

[0,0] [0,1] [0,2] [0,3]  ← Player front row
[1,0] [1,1] [1,2] [1,3]  ← Player back row
[2,0] [2,1] [2,2] [2,3]  ← Enemy front row
[3,0] [3,1] [3,2] [3,3]  ← Enemy back row
```

**Key Features**:
- 4x4 grid layout (rows 0-3, columns 0-3)
- Player team: rows 0-1 (front)
- Enemy team: rows 2-3 (back)
- Efficient unit lookups using `Map<string, Unit>`

**API**:
```typescript
createGrid(playerUnits: Unit[], enemyUnits: Unit[]): BattleGrid
getAllUnits(grid: BattleGrid): Unit[]
getTeamUnits(grid: BattleGrid, team: TeamId): Unit[]
getUnitAt(grid: BattleGrid, row: number, col: number): Unit | undefined
```

### 2. Character Model System (`characterModel.ts`)

**Purpose**: Defines character templates with base stats.

**Organization**:
- **Classes** (`models/classes/`): Player character classes (Warrior, Archer, Cleric, Mage, Paladin, Necromancer)
- **Monsters** (`models/monsters/`): Enemy monsters (Skeleton, Orc - room for dragons, etc.)

**Benefits**:
- Templates are immutable
- Easy to create new character types
- Instances created from models maintain base stats
- Separated into classes vs monsters for organization

**API**:
```typescript
createCharacterModel(id, name, maxHealth, power, magic, defense, initiative, skillTypes): CharacterModel
CHARACTER_TEMPLATES     // All characters
CLASS_TEMPLATES         // Only player classes
MONSTER_TEMPLATES       // Only monsters
getCharacterTemplate(id: string): CharacterModel | undefined
getAllCharacterTemplates(): CharacterModel[]
getAllClassTemplates(): CharacterModel[]
getAllMonsterTemplates(): CharacterModel[]
```

### 3. Party Composition (`partyComposer.ts`)

**Purpose**: Creates parties of units from character models.

**API**:
```typescript
composeParty(team: TeamId, models: CharacterModel[]): Unit[]
```

**Usage**:
```typescript
const playerParty = composeParty('player', [WARRIOR, ARCHER, CLERIC]);
const enemyParty = composeParty('enemy', [SKELETON, ORC]);
```

### 4. Buff System (`buffSystem.ts`)

**Purpose**: Manages temporary status effects with duration tracking.

**Buff Types**:
- `defending`: Reduces damage by 50%
- `haste`: Increases initiative
- `bless`: Increases power
- `regen`: Heals over time

**Key Features**:
- Duration-based expiration
- Buffs stack by refreshing to longest duration
- Buffs modify effective stats (power, initiative)
- Buffs decremented at start of each turn

**API**:
```typescript
applyBuff(unit: Unit, type: BuffType, duration: number, value: number): Unit
removeBuff(unit: Unit, type: BuffType): Unit
decrementBuffDurations(unit: Unit): Unit
getBuffValue(unit: Unit, type: BuffType): number
hasBuff(unit: Unit, type: BuffType): boolean
getEffectivePower(unit: Unit): number  // power + bless buffs
getEffectiveInitiative(unit: Unit): number  // initiative + haste buffs
applyRegenHealing(unit: Unit): { unit: Unit; healingDone: number }
```

**Buff Lifecycle**:
1. Applied with initial duration and value
2. Persists through other units' turns
3. Decremented at start of unit's turn
4. Removed when duration reaches 0

### 5. Skill System (`skillDefinitions.ts`)

**Purpose**: Defines all skills with targeting and effects.

**Skill Categories**:

**Default Skills** (all units get these):
- `attack`: Melee attack using power stat, targets front-row enemies
- `defend`: Self-buff, reduces damage by 50% for 1 turn
- `wait`: Pass turn with +5 initiative bonus for next round
- `move`: Movement placeholder (future feature)

**Magic Skills** (unique to certain classes):
- `bolt`: Ranged magic attack using magic stat, 0.8x damage
- `heal`: Ranged healing using magic stat (magic * 1.2)
- `leech`: Ranged magic attack, 0.7x damage, heals self for 50% of damage
- `haste`: Ranged buff, +10 initiative for 5 turns
- `bless`: Ranged buff, +10 power for 5 turns
- `regen`: Ranged buff, healing over time (magic * 0.2 per turn) for 5 turns

**Skill Structure**:
```typescript
interface Skill {
  type: SkillType;
  name: string;
  description?: string;
  targeting: TargetRequirement[];
  range?: 'melee' | 'ranged';
  damageMultiplier?: number;
  healAmount?: number;
  buffType?: BuffType;
  buffDuration?: number;
  buffValue?: number;
}
```

### 6. Targeting System (`targetingSystem.ts`)

**Purpose**: Validates targets and finds valid targets for skills.

**Target Types**:
- `enemy`: Enemies in melee range (front row)
- `enemy-any`: Any enemy (ranged)
- `ally`: Allies in melee range (adjacent)
- `ally-any`: Any ally (ranged)
- `self`: Self only

**API**:
```typescript
getValidTargets(state: GameState, activeUnitId: string, requirement: TargetRequirement): Unit[]
validateTargets(state: GameState, activeUnitId: string, skill: Skill, targetIds: string[]): boolean
```

### 7. Initiative System (`initiativeSystem.ts`)

**Purpose**: Manages turn order based on initiative stats.

**Key Features**:
- Round-robin within teams
- Player units act first, then enemy units
- Dead units automatically skipped
- Tracks which units have acted in current round

**API**:
```typescript
createTurnOrder(grid: BattleGrid): TurnOrder
getActiveUnit(turnOrder: TurnOrder): string
advanceTurn(turnOrder: TurnOrder, grid: BattleGrid): TurnOrder
```

### 8. Battle Simulator (`battleSimulator.ts`)

**Purpose**: Executes combat actions and manages battle state.

**Key Features**:
- Pure battle logic
- Processes all skill types
- Applies buffs at start of turn
- Checks win conditions after each action
- Immutable state updates

**API**:
```typescript
executeBattleAction(state: GameState, command: ActionCommand): GameState
```

**Action Flow**:
1. Get active unit
2. Apply regen healing (if any)
3. Decrement buff durations
4. Execute skill
5. Check for deaths
6. Check win condition
7. Advance turn

### 9. Game Orchestrator (`gameOrchestrator.ts`)

**Purpose**: Manages overall game state and integrates AI.

**API**:
```typescript
createGame(): GameState
executeAction(state: GameState, command: ActionCommand): GameState
```

**Features**:
- Creates initial game with default parties
- Routes actions to battle simulator
- Returns updated game state

### 10. AI System (`ai.ts`)

**Purpose**: Makes tactical decisions for enemy units.

**Strategy**:
- Randomly selects from available skills (excluding wait/move)
- **Attack**: Targets enemy with highest health
- **Heal**: Targets ally with lowest health
- **Defend**: Self-protection
- Fallback: Uses 'wait' if no useful skills available

**API**:
```typescript
getSkeletonAction(state: GameState, unitId: string): ActionCommand
```

---

## Development Workflow

### Type Checking

```bash
pnpm typecheck
```

This runs TypeScript compiler in check-only mode (no emit).

### Troubleshooting

#### "command not found: pnpm"

You need to activate mise first:
```bash
eval "$(mise activate bash)"
```

#### Tests failing after type changes

Make sure to:
1. Run `pnpm typecheck` first to catch compilation errors
2. Update test files to match new types
3. Check that imports reference the correct modules

### Notes for AI Assistants

When working on this repository:
1. **ALWAYS** activate mise before running commands
2. **ALWAYS** use `pnpm`, never `npm`
3. Use `eval "$(mise activate bash)" && <command>` pattern for Bash tool calls
4. Check `pnpm typecheck` after making type changes
5. Update tests after modifying types or function signatures

---

## Testing

### Running Tests

```bash
pnpm test
```

Tests use Vitest and are located in `src/tests/`.

### Test Structure

All tests follow **Arrange-Act-Assert (AAA)** pattern with **Given-When-Then** naming:

```typescript
describe('given [context]', () => {
  it('when [action] then [expected result]', () => {
    // Arrange: Set up test data
    const gameState = createGame();

    // Act: Execute the action
    const result = executeAction(gameState, command);

    // Assert: Verify results
    expect(result.gameOver).toBe(false);
  });
});
```

### Writing Tests - Best Practices

**CRITICAL: Avoid Flaky Tests**

1. **Never rely on randomness in tests**
   - Tests with `Math.random()` or random behavior are flaky and unreliable
   - If testing random behavior, run the function multiple times to test all branches
   - Better: Inject values or use dependency injection to make tests deterministic

2. **Use dependency injection for testability**
   - Instead of hardcoding randomness, accept it as a parameter
   - Example: `getSkeletonAction(state, unitId, rng?)` where `rng` can be mocked

3. **Test all code paths**
   - If a function has multiple branches (if/else, switch cases), test each one
   - Use loops to exercise all possibilities when dealing with random selections

4. **Make assertions deterministic**
   - Don't test `if (random) expect(X)` - this will randomly fail
   - Instead: Loop until you've tested all branches, or inject the randomness

**Example of a bad (flaky) test:**
```typescript
it('should work', () => {
  const result = getRandomAction();
  if (result === 'attack') {
    expect(result.targets).toHaveLength(1); // Fails randomly!
  }
});
```

**Example of a good (deterministic) test using mocking:**
```typescript
import { vi } from 'vitest';

it('should return attack when random is 0', () => {
  // Arrange: Mock randomness to be deterministic
  const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0);

  // Act
  const result = getRandomAction();

  // Assert
  expect(result.type).toBe('attack');
  expect(result.targets).toHaveLength(1);

  // Cleanup
  mockRandom.mockRestore();
});
```

**Example of a good test using loops with safety limits:**
```typescript
it('should work for all actions', () => {
  // Run multiple times to test all branches
  const actions = new Set();
  const maxIterations = 100; // Safety limit to prevent infinite loops

  for (let i = 0; i < maxIterations; i++) {
    const result = getRandomAction();
    actions.add(result.type);

    // Test each action type as we encounter it
    if (result.type === 'attack') {
      expect(result.targets).toHaveLength(1);
    }
  }
  // Verify we tested multiple branches
  expect(actions.size).toBeGreaterThan(1);
});
```

5. **Always use safety limits for loops in tests**
   - Never write `while(condition)` without a counter and max iterations check
   - This prevents tests from hanging indefinitely when mutations break loop conditions
   - Example pattern:
     ```typescript
     let iterations = 0;
     const maxIterations = 100;
     while (condition && iterations < maxIterations) {
       // ... test code ...
       iterations++;
     }
     expect(iterations).toBeLessThan(maxIterations); // Verify we didn't hit the limit
     ```

6. **Use Arrange-Act-Assert (AAA) pattern**
   - **Arrange**: Set up test data and preconditions
   - **Act**: Execute the code being tested
   - **Assert**: Verify the results
   - Use comments to clearly separate these sections

7. **Use Given-When-Then naming for nested describes**
   - `describe('given [context]', () => { it('when [action] then [expected result]') })`
   - Example: `describe('given a defended unit', () => { it('when attacked then should take reduced damage') })`

### Test Coverage

- **Battle Simulator**: Tests all skills, buff mechanics, win conditions
- **Grid System**: Tests unit positioning and team separation
- **Buff System**: Tests application, duration, stacking, expiration
- **Targeting System**: Tests all target types and range validation
- **Initiative System**: Tests turn order and round progression
- **AI Logic**: Tests skill selection with mocked randomness
- **Integration**: Tests full game flow

### Mutation Testing

- **Score**: 98.96%
- **Backend coverage**: 99.71% (all core systems at 100%)
- **Strategy**: Tests use mocking to be deterministic and avoid timeouts

---

## Extension Points

### Adding New Character Models

```typescript
// Define a new class in src/core/models/classes/
export const WARRIOR: CharacterModel = createCharacterModel(
  'warrior',
  'Warrior',
  120,  // maxHealth
  18,   // power
  0,    // magic
  8,    // defense
  7,    // initiative
  []    // Unique skills (defaults are added automatically)
);

// Or a new monster in src/core/models/monsters/
export const DRAGON: CharacterModel = createCharacterModel(
  'dragon',
  'Dragon',
  200,  // maxHealth
  30,   // power
  25,   // magic
  15,   // defense
  12,   // initiative
  ['bolt', 'haste']  // Unique skills
);

// Use in party composition
const party = composeParty('player', [WARRIOR, WARRIOR, CLERIC]);
```

### Adding New Skills

1. **Define in `core/skills/definitions/[skillName].ts`**:
```typescript
import { Skill } from '../../types/index.js';

export const poison: Skill = {
  type: 'poison',
  name: 'Poison',
  description: 'Damage over time',
  targeting: [{ type: 'enemy-any', count: 1 }],
  range: 'ranged',
  buffType: 'poison',
  buffDuration: 3,
  buffValue: 5, // 5 damage per turn
};
```

2. **Add to barrel export in `core/skills/definitions/index.ts`**:
```typescript
export { poison } from './poison.js';

// Add to SKILL_DEFINITIONS
export const SKILL_DEFINITIONS: Record<SkillType, Skill> = {
  // ... existing skills
  poison,
};
```

3. **Add buff type to `core/types/buffTypes.ts`**:
```typescript
export type BuffType = 'haste' | 'bless' | 'regen' | 'defending' | 'poison';
```

4. **Add skill type to `core/types/skillTypes.ts`**:
```typescript
export type SkillType = 'wait' | 'attack' | 'defend' | 'move' | 'heal' | 'bolt' | 'leech' | 'haste' | 'bless' | 'regen' | 'poison';
```

5. **Implement in `backend/game/battleSimulator.ts`**:
```typescript
case 'poison': {
  const targetId = command.targets[0];
  const target = newState.grid.units.get(targetId);
  if (!target) break;

  const buffedTarget = applyBuff(target, 'poison', 3, 5);
  newState.grid.units.set(targetId, buffedTarget);
  newState.log.push(`${activeUnit.name} poisons ${target.name}!`);
  break;
}
```

6. **Handle damage in buff system** (at start of turn):
```typescript
// In battleSimulator.ts, at start of turn:
const poisonValue = getBuffValue(activeUnit, 'poison');
if (poisonValue > 0) {
  activeUnit = { ...activeUnit, health: Math.max(0, activeUnit.health - poisonValue) };
  newState.log.push(`${activeUnit.name} takes ${poisonValue} poison damage!`);
}
```

### Custom AI Strategies

```typescript
// Defensive AI - prioritizes survival
const defensiveAI = (state: GameState, unitId: string): ActionCommand => {
  const unit = state.grid.units.get(unitId);

  if (unit.health < 30) {
    return { skill: 'heal', targets: [unitId] };
  }
  if (unit.health < 60) {
    return { skill: 'defend', targets: [] };
  }

  // Find target
  const enemies = getTeamUnits(state.grid, 'player');
  return { skill: 'attack', targets: [enemies[0].id] };
};

// Smart AI - counters player tactics
const smartAI = (state: GameState, unitId: string): ActionCommand => {
  const unit = state.grid.units.get(unitId);
  const enemies = getTeamUnits(state.grid, 'player');

  // Attack defending enemies (they'll lose defending buff)
  const defendingEnemy = enemies.find(e => isDefending(e));
  if (defendingEnemy) {
    return { skill: 'attack', targets: [defendingEnemy.id] };
  }

  // Otherwise use ranged bolt to hit back row
  const backRowEnemy = enemies.find(e => e.position.row === 1);
  if (backRowEnemy) {
    return { skill: 'bolt', targets: [backRowEnemy.id] };
  }

  return { skill: 'attack', targets: [enemies[0].id] };
};
```

### Custom Party Configurations

```typescript
// Balanced party
const balancedParty = composeParty('player', [
  WARRIOR,   // Front line tank
  PALADIN,   // Front line support
  ARCHER,    // Back line ranged DPS
  CLERIC,    // Back line healer
]);

// Glass cannon party
const glassCannonParty = composeParty('player', [
  MAGE,          // High magic damage
  MAGE,          // High magic damage
  NECROMANCER,   // Life steal and DoT
  ARCHER,        // Ranged physical
]);
```

---

## Deployment

### Current (In-Browser Only)

```bash
pnpm build
# Deploy dist/ to GitHub Pages, Netlify, Vercel, etc.
```

### Future (With Server)

```bash
# Backend
pnpm build:backend
# Deploy to cloud server (AWS, GCP, Heroku, etc.)

# Frontend
# Change gameService to ApiGameService in App.tsx
pnpm build
# Deploy to static hosting
```

---

## Benefits of This Architecture

1. **Modularity**: Each system has a single responsibility
2. **Testability**: Pure functions with 98.96% mutation coverage
3. **Flexibility**: Easy to inject different characters, parties, configs
4. **Scalability**: Supports multiple units and complex interactions
5. **Migration Path**: Clear path from in-browser to server
6. **Reusability**: Battle systems can be used in other games
7. **Type Safety**: Full TypeScript coverage
8. **Maintainability**: Clear separation of concerns
9. **Extensibility**: Easy to add new skills, buffs, characters

---

## Implementation Status

### ✅ Completed
- [x] Grid-based 4x4 battlefield
- [x] Character model system (classes and monsters)
- [x] Party composition
- [x] 10 complete skills (attack, defend, wait, move, heal, bolt, leech, haste, bless, regen)
- [x] Full buff/debuff system with duration tracking
- [x] Magic stat system (separate from power for spells)
- [x] Advanced targeting system (melee, ranged, ally, enemy)
- [x] Initiative-based turn order
- [x] AI decision-making
- [x] Comprehensive test suite (51 tests, 98.96% mutation score)
- [x] In-browser gameplay
- [x] React UI with grid display

### 🎯 Future Enhancements
- [ ] Equipment system
- [ ] Multiple AI difficulty levels
- [ ] Battle replays
- [ ] Multiplayer support (via ApiGameService)
- [ ] Persistence (save/load games)
- [ ] Battle animations
- [ ] Sound effects
- [ ] More character models (dragons, etc.)
- [ ] Status effects (poison, stun, etc.)
- [ ] AOE skills (area of effect)
- [ ] Movement system (using the move skill)
