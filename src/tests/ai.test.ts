import { describe, it, expect } from 'vitest';
import { getSkeletonAction } from '../backend/ai';

describe('AI Logic', () => {
  it('should return attack or defend', () => {
    const action = getSkeletonAction();
    expect(['attack', 'defend']).toContain(action);
  });

  it('should randomly vary actions', () => {
    const actions = new Set();

    // Run 100 times to ensure we get both actions
    for (let i = 0; i < 100; i++) {
      actions.add(getSkeletonAction());
    }

    // With 100 iterations, we should get both actions
    expect(actions.size).toBeGreaterThan(1);
  });
});
