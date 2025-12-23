import { Skill } from '../../types/index.js';

export const regen: Skill = {
  type: 'regen',
  name: 'Regen',
  description: 'Grant regeneration to an ally for 5 turns',
  targeting: [{ type: 'ally-any', count: 1 }],
  range: 'ranged',
  buffType: 'regen',
  buffDuration: 5,
  // buffValue determined by caster's magic stat (magic * 0.2 per turn)
};
