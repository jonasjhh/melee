import { Skill } from '../../types/index.js';

export const bless: Skill = {
  type: 'bless',
  name: 'Bless',
  description: 'Grant +10 power to an ally for 5 turns',
  targeting: [{ type: 'ally-any', count: 1 }],
  range: 'ranged',
  buffType: 'bless',
  buffDuration: 5,
  buffValue: 10, // +10 power
};
