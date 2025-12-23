import { Skill } from '../../types/index.js';

export const bolt: Skill = {
  type: 'bolt',
  name: 'Bolt',
  description: 'Ranged attack - can target any enemy',
  targeting: [{ type: 'enemy-any', count: 1 }],
  range: 'ranged',
  damageMultiplier: 0.8, // Slightly weaker than melee
};
