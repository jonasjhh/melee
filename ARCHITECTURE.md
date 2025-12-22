# Melee Game Architecture

This document describes the architecture of the Melee combat game, designed as a modular grid-based battle simulator that can be integrated into larger games.

## Overview

The game is structured with clear separation of concerns, making it easy to:
- Run the battle logic entirely in the browser (current setup)
- Migrate to a server-based architecture later
- Support multiple units and party-based combat
- Inject different character models and battle configurations
- Replace AI strategies
- Test components independently

## Architecture Layers

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

## Core Systems

### 1. Grid System (`gridSystem.ts`)

**Purpose**: Manages the 4x4 battlefield and unit positioning.

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

**Grid Layout**:
```
Row 0-1: Player Team (Front)
Row 2-3: Enemy Team (Back)

[0,0] [0,1] [0,2] [0,3]  ← Player front row
[1,0] [1,1] [1,2] [1,3]  ← Player back row
[2,0] [2,1] [2,2] [2,3]  ← Enemy front row
[3,0] [3,1] [3,2] [3,3]  ← Enemy back row
```

### 2. Character Model System (`characterModel.ts`)

**Purpose**: Defines character templates with base stats.

**Character Models**:
```typescript
export const HERO: CharacterModel = {
  name: 'Hero',
  maxHealth: 100,
  power: 15,
  defense: 5,
  initiative: 10,
  skills: DEFAULT_SKILLS,
};

export const SKELETON: CharacterModel = {
  name: 'Skeleton',
  maxHealth: 80,
  power: 12,
  defense: 3,
  initiative: 8,
  skills: DEFAULT_SKILLS,
};
```

**Benefits**:
- Templates are immutable
- Easy to create new character types
- Instances created from models maintain base stats

### 3. Party Composition (`partyComposer.ts`)

**Purpose**: Creates parties of units from character models.

**API**:
```typescript
composeParty(team: TeamId, models: CharacterModel[]): Unit[]
```

**Usage**:
```typescript
const playerParty = composeParty('player', [HERO, HERO, HERO]);
const enemyParty = composeParty('enemy', [SKELETON, SKELETON]);
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

**Purpose**: Defines all 9 skills with targeting and effects.

**Skill Categories**:

**Basic Skills** (in DEFAULT_SKILLS):
- `attack`: Melee, targets front-row enemies, 1.0x damage
- `defend`: Self-buff, reduces damage by 50% for 1 turn
- `heal`: Ranged, restores 30 HP to ally
- `skip`: No effect, pass turn

**Advanced Skills**:
- `bolt`: Ranged attack, 0.8x damage, any enemy
- `leech`: Ranged attack, 0.7x damage, heals self for 50% of damage
- `haste`: Ranged buff, +10 initiative for 5 turns
- `bless`: Ranged buff, +10 power for 5 turns
- `regen`: Ranged buff, 5 HP/turn for 5 turns

**Skill Structure**:
```typescript
interface Skill {
  type: SkillType;
  name: string;
  description: string;
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
- Processes all 9 skill types
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
- Randomly selects from: attack, defend, heal
- **Attack**: Targets enemy with highest health
- **Heal**: Targets ally with lowest health
- **Defend**: Self-protection

**API**:
```typescript
getSkeletonAction(state: GameState, unitId: string): ActionCommand
```

## Data Flow

### Combat Action Flow

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

## Testing Strategy

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

### Test Coverage
- **Battle Simulator**: Tests all 9 skills, buff mechanics, win conditions
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

## Extension Points

### Adding New Character Models

```typescript
// Define a new character model
export const WARRIOR: CharacterModel = {
  name: 'Warrior',
  maxHealth: 120,
  power: 18,
  defense: 8,
  initiative: 7,
  skills: DEFAULT_SKILLS,
};

// Use in party composition
const party = composeParty('player', [WARRIOR, WARRIOR, HERO]);
```

### Adding New Skills

1. **Define in `skillDefinitions.ts`**:
```typescript
poison: {
  type: 'poison',
  name: 'Poison',
  description: 'Damage over time',
  targeting: [{ type: 'enemy-any', count: 1 }],
  range: 'ranged',
  buffType: 'poison',
  buffDuration: 3,
  buffValue: 5, // 5 damage per turn
},
```

2. **Add buff type to `types.ts`**:
```typescript
export type BuffType = 'defending' | 'haste' | 'bless' | 'regen' | 'poison';
```

3. **Implement in `battleSimulator.ts`**:
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

4. **Handle damage in buff system**:
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
  HERO,      // Front line fighter
  HERO,      // Front line fighter
  SKELETON,  // Back line support (using as healer)
]);

// Tank and DPS party
const tankAndDPS = composeParty('player', [
  WARRIOR,   // Tanky front line
  WARRIOR,   // Tanky front line
  HERO,      // High DPS
  HERO,      // High DPS
]);
```

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

## Implementation Status

### ✅ Completed
- [x] Grid-based 4x4 battlefield
- [x] Character model system
- [x] Party composition
- [x] 9 complete skills (attack, defend, heal, skip, bolt, leech, haste, bless, regen)
- [x] Full buff/debuff system with duration tracking
- [x] Advanced targeting system (melee, ranged, ally, enemy)
- [x] Initiative-based turn order
- [x] AI decision-making
- [x] Comprehensive test suite (38 tests, 98.96% mutation score)
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
- [ ] More character models
- [ ] Status effects (poison, stun, etc.)
- [ ] AOE skills (area of effect)
