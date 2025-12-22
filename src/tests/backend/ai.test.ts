import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSkeletonAction } from '../../backend/ai/ai';
import { createGame } from '../../backend/game/gameOrchestrator';
import { GameState } from '../../backend/core/types';

describe('AI Logic', () => {
  let gameState: GameState;
  let skeletonId: string;

  beforeEach(() => {
    // Arrange: Create a consistent game state for all tests
    gameState = createGame();
    const skeleton = Array.from(gameState.grid.units.values())
      .find(u => u.team === 'enemy');

    if (!skeleton) {
      throw new Error('Test setup failed: No enemy unit found');
    }

    skeletonId = skeleton.id;
  });

  describe('given a valid game state with enemy units', () => {
    it('when getting skeleton action then should return valid action command with required properties', () => {
      // Act
      const command = getSkeletonAction(gameState, skeletonId);

      // Assert
      expect(command).toHaveProperty('skill');
      expect(command).toHaveProperty('targets');
      expect(Array.isArray(command.targets)).toBe(true);
    });

    it('when getting skeleton action then should return one of the available skills', () => {
      // Act
      const command = getSkeletonAction(gameState, skeletonId);

      // Assert - Skeleton has attack, defend, skip
      expect(['attack', 'defend', 'skip']).toContain(command.skill);
    });

    it('when getting attack action then should include valid target', () => {
      // Arrange: Mock Math.random to always return attack (first option)
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0);

      // Act
      const command = getSkeletonAction(gameState, skeletonId);

      // Assert
      expect(command.skill).toBe('attack');
      expect(command.targets.length).toBeGreaterThan(0);

      // Verify target is valid (exists in game state and is an enemy)
      const targetUnit = gameState.grid.units.get(command.targets[0]);
      expect(targetUnit).toBeDefined();
      expect(targetUnit?.team).toBe('player');

      // Cleanup
      mockRandom.mockRestore();
    });

    it('when using different skills then should select appropriate targets', () => {
      // Arrange: Test with attack (0) and defend (1)
      const mockRandom = vi.spyOn(Math, 'random');

      // Test attack (index 0) - should target player team
      mockRandom.mockReturnValueOnce(0.1);
      const attackCommand = getSkeletonAction(gameState, skeletonId);
      expect(attackCommand.skill).toBe('attack');
      expect(attackCommand.targets.length).toBeGreaterThan(0);
      const attackTarget = gameState.grid.units.get(attackCommand.targets[0]);
      expect(attackTarget).toBeDefined();
      expect(attackTarget?.team).toBe('player');

      // Test defend (index 1) - should have no targets
      mockRandom.mockReturnValueOnce(0.9);
      const defendCommand = getSkeletonAction(gameState, skeletonId);
      expect(defendCommand.skill).toBe('defend');
      expect(defendCommand.targets.length).toBe(0);

      // Cleanup
      mockRandom.mockRestore();
    });
  });

  describe('given an invalid unit ID', () => {
    it('when getting skeleton action then should return skip command', () => {
      // Arrange
      const invalidUnitId = 'non-existent-unit-id';

      // Act
      const command = getSkeletonAction(gameState, invalidUnitId);

      // Assert
      expect(command.skill).toBe('skip');
      expect(command.targets).toEqual([]);
    });
  });

  describe('given multiple calls with mocked randomness', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('when random returns different values then should get different skills', () => {
      // Arrange: Create deterministic sequence for skeleton's skills (attack, defend)
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValueOnce(0.1);  // attack (index 0)
      mockRandom.mockReturnValueOnce(0.9);  // defend (index 1)
      mockRandom.mockReturnValueOnce(0.2);  // attack (index 0)

      // Act
      const command1 = getSkeletonAction(gameState, skeletonId);
      const command2 = getSkeletonAction(gameState, skeletonId);
      const command3 = getSkeletonAction(gameState, skeletonId);

      // Assert
      expect(command1.skill).toBe('attack');
      expect(command2.skill).toBe('defend');
      expect(command3.skill).toBe('attack');
    });
  });
});
