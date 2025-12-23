import { Skill } from '../../types/index.js';

export const heal: Skill = {
  type: 'heal',
  name: 'Heal',
  description: 'Restore health to an ally using magic',
  targeting: [{ type: 'ally-any', count: 1 }],
  range: 'ranged',
};
