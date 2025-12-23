import { Skill } from '../../types/index.js';

export const wait: Skill = {
  type: 'wait',
  name: 'Wait',
  description: 'Wait this turn and gain +5 initiative next round',
  targeting: [],
  buffType: 'haste',
  buffDuration: 1,
  buffValue: 5, // +5 initiative for next turn
};
