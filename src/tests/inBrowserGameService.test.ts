import { describe, it, expect, beforeEach } from 'vitest';
import { InBrowserGameService } from '../backend/inBrowserGameService';
import { GameServiceError } from '../backend/gameService';

describe('InBrowserGameService', () => {
  let service: InBrowserGameService;

  beforeEach(() => {
    service = new InBrowserGameService();
  });

  it('should get initial game state', async () => {
    const state = await service.getState();

    expect(state.hero.name).toBe('Hero');
    expect(state.skeleton.name).toBe('Skeleton');
    expect(state.gameOver).toBe(false);
  });

  it('should create a new game', async () => {
    const state = await service.newGame();

    expect(state.hero.health).toBe(100);
    expect(state.skeleton.health).toBe(80);
    expect(state.currentTurn).toBe('hero');
  });

  it('should perform an attack action', async () => {
    const state = await service.performAction('attack');

    expect(state.skeleton.health).toBeLessThan(80);
  });

  it('should perform a defend action', async () => {
    const state = await service.performAction('defend');

    // After hero defends, skeleton takes its turn automatically
    // Check the log to verify defend action was executed
    expect(state.log).toContain('Hero takes a defensive stance.');
  });

  it('should perform a skip action', async () => {
    const initialState = await service.getState();
    const state = await service.performAction('skip');

    expect(state.skeleton.health).toBe(initialState.skeleton.health);
  });

  it('should throw error for invalid action', async () => {
    await expect(
      service.performAction('invalid' as any)
    ).rejects.toThrow(GameServiceError);
  });

  it('should maintain state across multiple actions', async () => {
    await service.performAction('attack');
    const state = await service.getState();

    expect(state.skeleton.health).toBeLessThan(80);
  });
});
