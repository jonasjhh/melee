import { describe, it, expect } from 'vitest';
import { createGame, executeAction } from '../backend/gameOrchestrator';

describe('Game Orchestrator', () => {
  it('should create a game with hero and skeleton', () => {
    const game = createGame();

    expect(game.hero.name).toBe('Hero');
    expect(game.skeleton.name).toBe('Skeleton');
    expect(game.currentTurn).toBe('hero');
    expect(game.gameOver).toBe(false);
  });

  it('should execute hero action and trigger skeleton AI', () => {
    const game = createGame();
    const newGame = executeAction(game, 'attack');

    expect(newGame.skeleton.health).toBeLessThan(80);
    // After hero's action, skeleton should have acted too
    expect(newGame.currentTurn).toBe('hero');
  });

  it('should allow custom defender strategy', () => {
    const game = createGame();

    // Custom strategy that always defends
    const alwaysDefendStrategy = () => 'defend' as const;

    const newGame = executeAction(game, 'attack', {
      defenderStrategy: alwaysDefendStrategy,
    });

    // Skeleton should have defended
    expect(newGame.skeleton.isDefending).toBe(true);
  });

  it('should handle game over correctly', () => {
    let game = createGame();
    game.skeleton.health = 10;

    game = executeAction(game, 'attack');

    expect(game.gameOver).toBe(true);
    expect(game.winner).toBe('hero');
  });
});
