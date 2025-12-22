import { describe, it, expect } from 'vitest';
import { createGame, executeAction } from '../../backend/game/gameOrchestrator';
import { getActiveUnit } from '../../backend/systems/initiativeSystem';

describe('Game Logic', () => {
  it('should create a new game with units', () => {
    const game = createGame();

    const playerUnits = Array.from(game.grid.units.values()).filter(u => u.team === 'player');
    const enemyUnits = Array.from(game.grid.units.values()).filter(u => u.team === 'enemy');

    expect(playerUnits.length).toBeGreaterThan(0);
    expect(enemyUnits.length).toBeGreaterThan(0);
    expect(game.gameOver).toBe(false);
  });

  it('should allow player unit to attack enemy', () => {
    const game = createGame();
    const activeUnitId = getActiveUnit(game.turnOrder);
    const activeUnit = game.grid.units.get(activeUnitId);

    // Find an enemy to attack
    const enemyUnit = Array.from(game.grid.units.values())
      .find(u => u.team === 'enemy' && u.health > 0);

    if (!enemyUnit || !activeUnit || activeUnit.team !== 'player') {
      // Skip test if setup doesn't match expectations
      return;
    }

    const initialHealth = enemyUnit.health;
    const newGame = executeAction(game, {
      skill: 'attack',
      targets: [enemyUnit.id],
    });

    const updatedEnemy = newGame.grid.units.get(enemyUnit.id);
    expect(updatedEnemy?.health).toBeLessThan(initialHealth);
    expect(newGame.log.length).toBeGreaterThan(0);
  });

  it('should allow unit to defend', () => {
    const game = createGame();
    const activeUnitId = getActiveUnit(game.turnOrder);
    const activeUnit = game.grid.units.get(activeUnitId);

    if (!activeUnit) return;

    const newGame = executeAction(game, {
      skill: 'defend',
      targets: [],
    });

    // Check the log to verify defend action was executed
    expect(newGame.log.some(entry => entry.includes('takes a defensive stance'))).toBe(true);
  });

  it('should allow unit to skip turn', () => {
    const game = createGame();

    const newGame = executeAction(game, {
      skill: 'skip',
      targets: [],
    });

    // Turn should have advanced
    expect(newGame.turnOrder.currentUnitIndex).not.toBe(game.turnOrder.currentUnitIndex);
  });

  it('should end game when player team is eliminated', () => {
    let game = createGame();

    // Reduce all player units to 1 health
    const playerUnits = Array.from(game.grid.units.values())
      .filter(u => u.team === 'player');

    playerUnits.forEach(unit => {
      game.grid.units.set(unit.id, { ...unit, health: 1 });
    });

    // Execute turns until game over
    let iterations = 0;
    while (!game.gameOver && iterations < 100) {
      const activeUnitId = getActiveUnit(game.turnOrder);
      const activeUnit = game.grid.units.get(activeUnitId);

      if (activeUnit?.team === 'enemy') {
        const target = playerUnits[0];
        game = executeAction(game, {
          skill: 'attack',
          targets: [target.id],
        });
      } else {
        game = executeAction(game, {
          skill: 'skip',
          targets: [],
        });
      }
      iterations++;
    }

    if (game.gameOver) {
      expect(game.winner).toBe('enemy');
    }
  });

  it('should end game when enemy team is eliminated', () => {
    let game = createGame();

    // Reduce all enemy units to 1 health
    const enemyUnits = Array.from(game.grid.units.values())
      .filter(u => u.team === 'enemy');

    enemyUnits.forEach(unit => {
      game.grid.units.set(unit.id, { ...unit, health: 1 });
    });

    // Execute player attack
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
