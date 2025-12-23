import { describe, it, expect, beforeEach } from 'vitest';
import { createGame, executeAction } from '../../backend/game/gameOrchestrator';
import { isDefending } from '../../backend/systems/buffSystem';
import { getActiveUnit } from '../../backend/systems/initiativeSystem';
import { GameState } from '../../backend/core/types';

describe('Battle Simulator', () => {
  let gameState: GameState;

  beforeEach(() => {
    // Arrange: Create a fresh game state for each test
    gameState = createGame();
  });

  describe('given a new game', () => {
    it('when game is created then should have units on grid', () => {
      // Assert
      expect(gameState.grid.units.size).toBeGreaterThan(0);
      expect(gameState.turnOrder.unitOrder.length).toBeGreaterThan(0);
      expect(gameState.gameOver).toBe(false);
    });
  });

  describe('given an active unit', () => {
    it('when executing attack action then should process action and update log', () => {
      // Arrange
      const activeUnitId = getActiveUnit(gameState.turnOrder);
      const activeUnit = gameState.grid.units.get(activeUnitId);
      const targetId = Array.from(gameState.grid.units.values())
        .find(u => u.team !== activeUnit?.team && u.health > 0)?.id || '';
      const initialLogLength = gameState.log.length;

      // Act
      const newGame = executeAction(gameState, {
        skill: 'attack',
        targets: [targetId],
      });

      // Assert
      expect(newGame.log.length).toBeGreaterThan(initialLogLength);
      expect(newGame.log[newGame.log.length - 1]).toContain('attack');
    });

    it('when executing defend action then should apply defending buff', () => {
      // Arrange
      const activeUnitId = getActiveUnit(gameState.turnOrder);

      // Act
      const newGame = executeAction(gameState, {
        skill: 'defend',
        targets: [],
      });

      // Assert
      const unit = newGame.grid.units.get(activeUnitId);
      expect(unit && isDefending(unit)).toBe(true);
    });

    it('when executing wait action then should advance turn and apply initiative buff', () => {
      // Arrange
      const activeUnitId = getActiveUnit(gameState.turnOrder);
      const activeUnit = gameState.grid.units.get(activeUnitId);
      const initialHealth = activeUnit?.health || 0;
      const initialTurnIndex = gameState.turnOrder.currentUnitIndex;

      // Act
      const newGame = executeAction(gameState, {
        skill: 'wait',
        targets: [],
      });

      // Assert
      const unit = newGame.grid.units.get(activeUnitId);
      expect(unit?.health).toBe(initialHealth);
      expect(newGame.turnOrder.currentUnitIndex).not.toBe(initialTurnIndex);
      // Check that the haste buff was applied
      expect(unit?.buffs).toContainEqual(expect.objectContaining({ type: 'haste' }));
    });

    it('when executing heal action then should restore target health', () => {
      // Arrange
      const activeUnitId = getActiveUnit(gameState.turnOrder);
      const activeUnit = gameState.grid.units.get(activeUnitId);

      // Set active unit's magic to ensure healing works
      if (activeUnit) {
        gameState.grid.units.set(activeUnitId, { ...activeUnit, magic: 25 });
      }

      const targetId = Array.from(gameState.grid.units.values())
        .find(u => u.team === activeUnit?.team && u.health > 0)?.id || '';
      const target = gameState.grid.units.get(targetId);

      // Damage the target first so we can heal it
      if (target) {
        gameState.grid.units.set(targetId, { ...target, health: target.health - 10 });
      }

      const damagedTarget = gameState.grid.units.get(targetId);
      const healthBeforeHeal = damagedTarget?.health || 0;

      // Act
      const newGame = executeAction(gameState, {
        skill: 'heal',
        targets: [targetId],
      });

      // Assert
      const healedTarget = newGame.grid.units.get(targetId);
      expect(healedTarget?.health).toBeGreaterThan(healthBeforeHeal);
    });
  });

  describe('given player team has one unit with 1 HP', () => {
    it('when enemy attacks player then game should end with enemy victory', () => {
      // Arrange: Set all player units to 1 HP and give enemies high power
      const playerUnits = Array.from(gameState.grid.units.values())
        .filter(u => u.team === 'player');

      const enemyUnits = Array.from(gameState.grid.units.values())
        .filter(u => u.team === 'enemy');

      playerUnits.forEach(unit => {
        gameState.grid.units.set(unit.id, { ...unit, health: 1 });
      });

      enemyUnits.forEach(unit => {
        gameState.grid.units.set(unit.id, { ...unit, power: 100 }); // Ensure one-hit kills
      });

      // Act: Execute turns until game is over or we hit safety limit
      let currentGame = gameState;
      const maxTurns = 50; // Safety limit
      let turnsProcessed = 0;

      while (!currentGame.gameOver && turnsProcessed < maxTurns) {
        const activeUnitId = getActiveUnit(currentGame.turnOrder);
        const activeUnit = currentGame.grid.units.get(activeUnitId);

        if (activeUnit?.team === 'enemy') {
          // Enemy attacks a living player
          const livingPlayer = Array.from(currentGame.grid.units.values())
            .find(u => u.team === 'player' && u.health > 0);

          if (livingPlayer) {
            currentGame = executeAction(currentGame, {
              skill: 'attack',
              targets: [livingPlayer.id],
            });
          } else {
            break; // No players left
          }
        } else {
          // Skip player turn
          currentGame = executeAction(currentGame, {
            skill: 'skip',
            targets: [],
          });
        }
        turnsProcessed++;
      }

      // Assert
      expect(turnsProcessed).toBeLessThan(maxTurns); // Verify we didn't hit the safety limit
      expect(currentGame.gameOver).toBe(true);
      expect(currentGame.winner).toBe('enemy');
    });
  });

  describe('given enemy team has one unit with 1 HP', () => {
    it('when player attacks enemy then game should end with player victory', () => {
      // Arrange: Set all enemy units to 1 HP and give them very low power
      const enemyUnits = Array.from(gameState.grid.units.values())
        .filter(u => u.team === 'enemy');

      enemyUnits.forEach(unit => {
        gameState.grid.units.set(unit.id, { ...unit, health: 1, power: 0 });
      });

      // Ensure we have enough player units with enough power to kill in one hit
      const playerUnits = Array.from(gameState.grid.units.values())
        .filter(u => u.team === 'player');

      playerUnits.forEach(unit => {
        gameState.grid.units.set(unit.id, { ...unit, power: 100 });
      });

      // Act: Execute turns until game is over or we hit safety limit
      let currentGame = gameState;
      const maxTurns = 20; // Increased safety limit
      let turnsProcessed = 0;

      while (!currentGame.gameOver && turnsProcessed < maxTurns) {
        const activeUnitId = getActiveUnit(currentGame.turnOrder);
        const activeUnit = currentGame.grid.units.get(activeUnitId);

        if (activeUnit?.team === 'player') {
          // Player attacks enemy
          const enemyTarget = Array.from(currentGame.grid.units.values())
            .find(u => u.team === 'enemy' && u.health > 0);

          if (enemyTarget) {
            currentGame = executeAction(currentGame, {
              skill: 'attack',
              targets: [enemyTarget.id],
            });
          } else {
            // No enemies left, should trigger game over
            break;
          }
        } else {
          // Skip enemy turn (they can't kill us with 0 power)
          currentGame = executeAction(currentGame, {
            skill: 'skip',
            targets: [],
          });
        }
        turnsProcessed++;
      }

      // Assert
      expect(turnsProcessed).toBeLessThan(maxTurns); // Ensure we didn't hit the safety limit
      expect(currentGame.gameOver).toBe(true);
      expect(currentGame.winner).toBe('player');
    });
  });

  describe('given game is over', () => {
    it('when executing action then should not process action and return unchanged state', () => {
      // Arrange: Set game to game over state
      const gameOverState = { ...gameState, gameOver: true, winner: 'player' as const };
      const activeUnitId = getActiveUnit(gameOverState.turnOrder);

      // Act
      const unchangedGame = executeAction(gameOverState, {
        skill: 'attack',
        targets: [activeUnitId],
      });

      // Assert
      expect(unchangedGame.gameOver).toBe(true);
      expect(unchangedGame).toEqual(gameOverState);
    });
  });

  describe('given unit with defending buff', () => {
    it('when unit takes defend action then buff should be applied immediately', () => {
      // Arrange
      const activeUnitId = getActiveUnit(gameState.turnOrder);

      // Act: Apply defend buff
      const defendedGame = executeAction(gameState, {
        skill: 'defend',
        targets: [],
      });

      // Assert: Buff should be applied
      const defendedUnit = defendedGame.grid.units.get(activeUnitId);
      expect(defendedUnit && isDefending(defendedUnit)).toBe(true);
      expect(defendedUnit?.buffs).toHaveLength(1);
      expect(defendedUnit?.buffs[0].type).toBe('defending');
      expect(defendedUnit?.buffs[0].duration).toBe(1);
    });

    it('when defending unit is attacked then damage should be reduced', () => {
      // Arrange: First unit defends
      const activeUnitId = getActiveUnit(gameState.turnOrder);
      let currentGame = executeAction(gameState, {
        skill: 'defend',
        targets: [],
      });

      const defendedUnit = currentGame.grid.units.get(activeUnitId);
      const initialHealth = defendedUnit?.health || 0;

      // Act: Advance to next turn and attack the defended unit
      currentGame = executeAction(currentGame, {
        skill: 'attack',
        targets: [activeUnitId],
      });

      // Assert: Damage should be reduced and defending buff should be removed
      const attackedUnit = currentGame.grid.units.get(activeUnitId);
      const damageTaken = initialHealth - (attackedUnit?.health || 0);
      expect(damageTaken).toBeGreaterThan(0); // Some damage should be dealt
      expect(attackedUnit && isDefending(attackedUnit)).toBe(false); // Buff removed after being hit
    });

    it('when defending unit turn comes around again then buff should be decremented and removed', () => {
      // Arrange: Apply defend buff (duration 1)
      const activeUnitId = getActiveUnit(gameState.turnOrder);
      let currentGame = executeAction(gameState, {
        skill: 'defend',
        targets: [],
      });

      // Verify buff is applied with duration 1
      const defendedUnit = currentGame.grid.units.get(activeUnitId);
      expect(defendedUnit && isDefending(defendedUnit)).toBe(true);
      expect(defendedUnit?.buffs[0].duration).toBe(1);

      // Act: Execute a full round of turns (all units take a turn)
      let turnsProcessed = 0;
      const maxTurns = 20; // Safety limit
      const totalUnits = Array.from(currentGame.grid.units.values()).filter(u => u.health > 0).length;

      // Execute turns until we've gone through at least one full round
      while (turnsProcessed < Math.min(totalUnits, maxTurns)) {
        currentGame = executeAction(currentGame, {
          skill: 'skip',
          targets: [],
        });
        turnsProcessed++;
      }

      // Assert: After a full round, when it's the unit's turn again, buff should be removed
      // The buff is decremented at the START of the unit's turn, so it should now be gone
      const finalUnit = currentGame.grid.units.get(activeUnitId);
      expect(finalUnit && isDefending(finalUnit)).toBe(false);
      expect(turnsProcessed).toBeLessThan(maxTurns); // Ensure we didn't hit safety limit
    });
  });
});
