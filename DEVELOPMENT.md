# Development Guide

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

## Common Commands

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

## Project Structure

```
src/
├── backend/           # Core game logic
│   ├── types.ts      # TypeScript type definitions
│   ├── skillDefinitions.ts  # Skill definitions and mechanics
│   ├── characterModel.ts    # Character templates
│   ├── partyComposer.ts     # Party composition
│   ├── buffSystem.ts        # Buff/debuff management
│   ├── gridSystem.ts        # 4x4 battlefield grid
│   ├── initiativeSystem.ts  # Turn order
│   ├── targetingSystem.ts   # Target validation
│   ├── battleSimulator.ts   # Combat execution
│   ├── gameOrchestrator.ts  # High-level game flow
│   ├── ai.ts               # Enemy AI
│   └── unit.ts             # Unit factory functions
├── frontend/          # React UI
│   ├── App.tsx       # Main game component
│   └── App.css       # Styles
└── tests/            # Test files
```

## Key Architecture Decisions

1. **Immutable State**: All state updates create new objects rather than mutating
2. **Buff System**: Status effects (defending, haste, bless, regen) are managed via a buff system
3. **Grid-Based Combat**: 4x4 grid with positional mechanics
4. **Character Models**: Separation of templates (models) from runtime instances (units)
5. **Map for Units**: Units stored in `Map<string, Unit>` for fast lookups

## Running Tests

```bash
pnpm test
```

Tests use Vitest and are located in `src/tests/`.

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

## Type Checking

```bash
pnpm typecheck
```

This runs TypeScript compiler in check-only mode (no emit).

## Troubleshooting

### "command not found: pnpm"

You need to activate mise first:
```bash
eval "$(mise activate bash)"
```

### Tests failing after type changes

Make sure to:
1. Run `pnpm typecheck` first to catch compilation errors
2. Update test files to match new types
3. Check that imports reference the correct modules

## Notes for AI Assistants

When working on this repository:
1. **ALWAYS** activate mise before running commands
2. **ALWAYS** use `pnpm`, never `npm`
3. Use `eval "$(mise activate bash)" && <command>` pattern for Bash tool calls
4. Check `pnpm typecheck` after making type changes
5. Update tests after modifying types or function signatures
