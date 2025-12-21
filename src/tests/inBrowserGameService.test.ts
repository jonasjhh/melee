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
    const initialState = await service.getState();
    const initialSkeletonHealth = initialState.skeleton.health;

    const state = await service.performAction({
      skill: 'attack',
      targets: [initialState.skeleton.id],
    });

    // Hero attacked, then skeleton AI took a turn
    // Skeleton could have attacked, defended, or healed
    // Just verify the action was processed (turn returned to hero)
    expect(state.currentTurn).toBe('hero');
    expect(state.log.length).toBeGreaterThan(initialState.log.length);

    // At minimum, skeleton health should not have increased beyond max
    expect(state.skeleton.health).toBeLessThanOrEqual(initialSkeletonHealth);
  });

  it('should perform a defend action', async () => {
    const state = await service.performAction({
      skill: 'defend',
      targets: [],
    });

    // After hero defends, skeleton takes its turn automatically
    // Check the log to verify defend action was executed
    expect(state.log).toContain('Hero takes a defensive stance.');
  });

  it('should perform a skip action', async () => {
    const initialState = await service.getState();
    const state = await service.performAction({
      skill: 'skip',
      targets: [],
    });

    expect(state.skeleton.health).toBe(initialState.skeleton.health);
  });

  it('should throw error for invalid action', async () => {
    await expect(
      service.performAction({ skill: 'invalid' as any, targets: [] })
    ).rejects.toThrow(GameServiceError);
  });

  it('should maintain state across multiple actions', async () => {
    const initialState = await service.getState();
    const initialSkeletonHealth = initialState.skeleton.health;

    await service.performAction({
      skill: 'attack',
      targets: [initialState.skeleton.id],
    });
    const state = await service.getState();

    // Verify state was maintained and turn cycled back to hero
    expect(state.currentTurn).toBe('hero');
    expect(state.log.length).toBeGreaterThan(initialState.log.length);

    // Skeleton health should not exceed its initial value
    expect(state.skeleton.health).toBeLessThanOrEqual(initialSkeletonHealth);
  });
});
