import { describe, it, expect, beforeEach } from 'vitest';
import { InBrowserGameService } from '../../backend/services/inBrowserGameService';
import { GameServiceError } from '../../backend/core/gameService';
import { getActiveUnit } from '../../backend/systems/initiativeSystem';

describe('InBrowserGameService', () => {
  let service: InBrowserGameService;

  beforeEach(() => {
    service = new InBrowserGameService();
  });

  it('should get initial game state', async () => {
    const state = await service.getState();

    expect(state.grid.units.size).toBeGreaterThan(0);
    expect(state.turnOrder.unitOrder.length).toBeGreaterThan(0);
    expect(state.gameOver).toBe(false);
  });

  it('should create a new game', async () => {
    const state = await service.newGame();

    const playerUnits = Array.from(state.grid.units.values()).filter(u => u.team === 'player');
    const enemyUnits = Array.from(state.grid.units.values()).filter(u => u.team === 'enemy');

    expect(playerUnits.length).toBeGreaterThan(0);
    expect(enemyUnits.length).toBeGreaterThan(0);
    expect(state.gameOver).toBe(false);
  });

  it('should perform an attack action', async () => {
    const initialState = await service.getState();
    const activeUnitId = getActiveUnit(initialState.turnOrder);
    const activeUnit = initialState.grid.units.get(activeUnitId);

    // Find an enemy to attack
    const enemyUnit = Array.from(initialState.grid.units.values())
      .find(u => u.team !== activeUnit?.team && u.health > 0);

    if (!enemyUnit) {
      throw new Error('No enemy unit found');
    }

    const initialHealth = enemyUnit.health;
    const state = await service.performAction({
      skill: 'attack',
      targets: [enemyUnit.id],
    });

    expect(state.log.length).toBeGreaterThan(initialState.log.length);

    // Enemy health should be reduced or at most the same
    const updatedEnemy = state.grid.units.get(enemyUnit.id);
    expect(updatedEnemy?.health).toBeLessThanOrEqual(initialHealth);
  });

  it('should perform a defend action', async () => {
    const state = await service.performAction({
      skill: 'defend',
      targets: [],
    });

    // Check the log to verify defend action was executed
    expect(state.log.some(entry => entry.includes('takes a defensive stance'))).toBe(true);
  });

  it('should perform a wait action', async () => {
    const initialState = await service.getState();
    const state = await service.performAction({
      skill: 'wait',
      targets: [],
    });

    // Log should have advanced
    expect(state.log.length).toBeGreaterThan(initialState.log.length);
  });

  it('should throw error for invalid action', async () => {
    await expect(
      service.performAction({ skill: 'invalid' as any, targets: [] })
    ).rejects.toThrow(GameServiceError);
  });

  it('should maintain state across multiple actions', async () => {
    const initialState = await service.getState();
    const activeUnitId = getActiveUnit(initialState.turnOrder);
    const activeUnit = initialState.grid.units.get(activeUnitId);

    // Find an enemy to attack
    const enemyUnit = Array.from(initialState.grid.units.values())
      .find(u => u.team !== activeUnit?.team && u.health > 0);

    if (!enemyUnit) {
      throw new Error('No enemy unit found');
    }

    await service.performAction({
      skill: 'attack',
      targets: [enemyUnit.id],
    });
    const state = await service.getState();

    // Verify state was maintained
    expect(state.log.length).toBeGreaterThan(initialState.log.length);
    expect(state.grid.units.size).toBe(initialState.grid.units.size);
  });
});
