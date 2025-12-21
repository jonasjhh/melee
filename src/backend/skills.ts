import { Skill } from './types.js';

export const SKILLS: Record<string, Skill> = {
  skip: {
    type: 'skip',
    name: 'Skip',
    targeting: [], // No targets needed - auto-execute
  },
  attack: {
    type: 'attack',
    name: 'Attack',
    description: 'Deal 20 damage to an enemy',
    targeting: [{ type: 'enemy', count: 1 }],
  },
  defend: {
    type: 'defend',
    name: 'Defend',
    description: 'Take a defensive stance, reducing incoming damage',
    targeting: [], // Auto-execute, self-buff
  },
  heal: {
    type: 'heal',
    name: 'Heal',
    description: 'Restore 30 HP to an ally',
    targeting: [{ type: 'ally', count: 1 }],
  },
};

export const DEFAULT_SKILLS: Skill[] = [
  SKILLS.skip,
  SKILLS.attack,
  SKILLS.defend,
  SKILLS.heal,
  SKILLS.skip, // Placeholder for future skills
  SKILLS.skip, // Placeholder for future skills
];
