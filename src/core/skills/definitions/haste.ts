import { Skill } from '../../types/index.js';

export const haste: Skill = {
  type: 'haste',
  name: 'Haste',
  description: 'Grant +10 initiative to an ally for 5 turns',
  targeting: [{ type: 'ally-any', count: 1 }],
  range: 'ranged',
  buffType: 'haste',
  buffDuration: 5,
  buffValue: 10, // +10 initiative
};
