import { Skill } from '../../types/index.js';

export const defend: Skill = {
  type: 'defend',
  name: 'Defend',
  description: 'Take a defensive stance, reducing damage taken',
  targeting: [],
  buffType: 'defending',
  buffDuration: 1, // Until next turn
};
