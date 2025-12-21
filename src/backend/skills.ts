import { Skill } from './types.js';

export const SKILLS: Record<string, Skill> = {
  skip: {
    type: 'skip',
    name: 'Skip',
  },
  attack: {
    type: 'attack',
    name: 'Attack',
  },
  defend: {
    type: 'defend',
    name: 'Defend',
  },
};

export const DEFAULT_SKILLS: Skill[] = [
  SKILLS.skip,
  SKILLS.attack,
  SKILLS.defend,
  SKILLS.skip, // Placeholder for future skills
  SKILLS.skip, // Placeholder for future skills
  SKILLS.skip, // Placeholder for future skills
];
