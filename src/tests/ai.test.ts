import { describe, it, expect } from 'vitest';
import { getSkeletonAction } from '../backend/ai';
import { createGame } from '../backend/gameOrchestrator';

describe('AI Logic', () => {
  it('should return valid action command', () => {
    const gameState = createGame();
    const command = getSkeletonAction(gameState);

    expect(command).toHaveProperty('skill');
    expect(command).toHaveProperty('targets');
    expect(['attack', 'defend', 'heal']).toContain(command.skill);
    expect(Array.isArray(command.targets)).toBe(true);
  });

  it('should randomly vary actions', () => {
    const gameState = createGame();
    const skills = new Set();

    // Run 100 times to ensure we get variety
    for (let i = 0; i < 100; i++) {
      const command = getSkeletonAction(gameState);
      skills.add(command.skill);
    }

    // With 100 iterations, we should get multiple different skills
    expect(skills.size).toBeGreaterThan(1);
  });

  it('should include targets when needed', () => {
    const gameState = createGame();
    const command = getSkeletonAction(gameState);

    // Attack and heal need targets
    if (command.skill === 'attack' || command.skill === 'heal') {
      expect(command.targets.length).toBeGreaterThan(0);
    }
    // Defend doesn't need targets
    if (command.skill === 'defend') {
      expect(command.targets.length).toBe(0);
    }
  });
});
