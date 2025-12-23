import { Skill } from '../../types/index.js';

export const leech: Skill = {
  type: 'leech',
  name: 'Leech',
  description: 'Drain life from an enemy using magic',
  targeting: [{ type: 'enemy-any', count: 1 }],
  range: 'ranged',
  damageMultiplier: 0.7, // Uses magic stat with 0.7x multiplier
};
