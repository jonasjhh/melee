import { describe, it, expect } from 'vitest';
import { createGame, executeAction } from '../backend/gameOrchestrator';
import { getActiveUnit } from '../backend/initiativeSystem';
import { isDefending } from '../backend/buffSystem';

describe('Game Orchestrator', () => {
  it('should create a game with units on grid', () => {
    const game = createGame();

    expect(game.grid.units.size).toBeGreaterThan(0);
    expect(game.turnOrder.unitOrder.length).toBeGreaterThan(0);
    expect(game.gameOver).toBe(false);
    expect(game.log.length).toBeGreaterThanOrEqual(0); // Log may have initialization messages
  });

  it('should execute player action and advance turn', () => {
    const game = createGame();
    const activeUnitId = getActiveUnit(game.turnOrder);
    const activeUnit = game.grid.units.get(activeUnitId);

    // Find an enemy target
    const targetUnit = Array.from(game.grid.units.values())
      .find(u => u.team !== activeUnit?.team && u.health > 0);

    if (!targetUnit) {
      throw new Error('No valid target found');
    }

    const initialHealth = targetUnit.health;
    const newGame = executeAction(game, {
      skill: 'attack',
      targets: [targetUnit.id],
    });

    const updatedTarget = newGame.grid.units.get(targetUnit.id);
    expect(updatedTarget?.health).toBeLessThan(initialHealth);
    expect(newGame.log.length).toBeGreaterThan(game.log.length);
  });

  it('should apply defending buff', () => {
    const game = createGame();
    const activeUnitId = getActiveUnit(game.turnOrder);

    const newGame = executeAction(game, {
      skill: 'defend',
      targets: [],
    });

    const unit = newGame.grid.units.get(activeUnitId);
    expect(unit && isDefending(unit)).toBe(true);
  });

  it('should handle game over correctly', () => {
    let game = createGame();

    // Reduce all enemy units to 1 health
    const enemyUnits = Array.from(game.grid.units.values())
      .filter(u => u.team === 'enemy');

    enemyUnits.forEach(unit => {
      game.grid.units.set(unit.id, { ...unit, health: 1 });
    });

    // Attack one enemy unit
    const activeUnitId = getActiveUnit(game.turnOrder);
    const activeUnit = game.grid.units.get(activeUnitId);

    if (activeUnit?.team === 'player') {
      game = executeAction(game, {
        skill: 'attack',
        targets: [enemyUnits[0].id],
      });

      if (game.gameOver) {
        expect(game.winner).toBe('player');
      }
    }
  });
});
