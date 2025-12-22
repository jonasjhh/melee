import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSkeletonAction } from '../backend/ai';
import { createGame } from '../backend/gameOrchestrator';
import { GameState } from '../backend/types';

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

      // Assert
      expect(['attack', 'defend', 'heal']).toContain(command.skill);
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

    it('when getting defend action then should have no targets', () => {
      // Arrange: Mock Math.random to return defend (middle option, index 1)
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.4);

      // Act
      const command = getSkeletonAction(gameState, skeletonId);

      // Assert
      expect(command.skill).toBe('defend');
      expect(command.targets.length).toBe(0);

      // Cleanup
      mockRandom.mockRestore();
    });

    it('when getting heal action then should target ally with lowest health', () => {
      // Arrange: Mock Math.random to return heal (last option, index 2)
      const mockRandom = vi.spyOn(Math, 'random').mockReturnValue(0.8);

      // Act
      const command = getSkeletonAction(gameState, skeletonId);

      // Assert
      expect(command.skill).toBe('heal');
      expect(command.targets.length).toBeGreaterThan(0);

      // Verify target is valid ally
      const targetUnit = gameState.grid.units.get(command.targets[0]);
      expect(targetUnit).toBeDefined();
      expect(targetUnit?.team).toBe('enemy');

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
      // Arrange: Create deterministic sequence
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValueOnce(0.1);  // attack
      mockRandom.mockReturnValueOnce(0.5);  // defend
      mockRandom.mockReturnValueOnce(0.9);  // heal

      // Act
      const command1 = getSkeletonAction(gameState, skeletonId);
      const command2 = getSkeletonAction(gameState, skeletonId);
      const command3 = getSkeletonAction(gameState, skeletonId);

      // Assert
      expect(command1.skill).toBe('attack');
      expect(command2.skill).toBe('defend');
      expect(command3.skill).toBe('heal');
    });
  });
});
