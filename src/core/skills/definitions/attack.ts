import { Skill } from '../../types/index.js';

export const attack: Skill = {
  type: 'attack',
  name: 'Attack',
  description: 'Melee attack a front-row enemy using power',
  targeting: [{ type: 'enemy', count: 1, range: 'melee' }],
  range: 'melee',
  damageMultiplier: 1.0,
};
