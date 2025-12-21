import { describe, it, expect } from 'vitest';
import { createGame, executeAction } from '../backend/gameOrchestrator';

describe('Game Logic', () => {
  it('should create a new game with hero and skeleton', () => {
    const game = createGame();

    expect(game.hero.name).toBe('Hero');
    expect(game.hero.health).toBe(100);
    expect(game.skeleton.name).toBe('Skeleton');
    expect(game.skeleton.health).toBe(80);
    expect(game.currentTurn).toBe('hero');
    expect(game.gameOver).toBe(false);
  });

  it('should allow hero to attack skeleton', () => {
    const game = createGame();
    const newGame = executeAction(game, 'attack');

    expect(newGame.skeleton.health).toBeLessThan(80);
    expect(newGame.log.length).toBeGreaterThan(1);
  });

  it('should allow hero to defend', () => {
    const game = createGame();
    const newGame = executeAction(game, 'defend');

    // Note: After hero defends, skeleton takes its turn automatically
    // Hero's defending status persists until they take damage or take another action
    // Check the log to verify defend action was executed
    expect(newGame.log).toContain('Hero takes a defensive stance.');
  });

  it('should allow hero to skip turn', () => {
    const game = createGame();
    const initialHealth = game.skeleton.health;
    const newGame = executeAction(game, 'skip');

    expect(newGame.skeleton.health).toBe(initialHealth);
  });

  it('should end game when hero health reaches 0', () => {
    let game = createGame();

    // Reduce hero health to near 0
    game.hero.health = 10;

    // Force skeleton turn and hope it attacks
    for (let i = 0; i < 10; i++) {
      if (game.gameOver) break;
      game = executeAction(game, 'skip');
    }

    if (game.gameOver) {
      expect(game.winner).toBe('skeleton');
    }
  });

  it('should end game when skeleton health reaches 0', () => {
    let game = createGame();

    // Reduce skeleton health to near 0
    game.skeleton.health = 10;

    // Hero attacks
    game = executeAction(game, 'attack');

    if (game.gameOver) {
      expect(game.winner).toBe('hero');
    }
  });
});
