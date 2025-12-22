import { Skill, SkillType } from './types.js';

/**
 * Comprehensive skill definitions with all mechanics
 */
export const SKILL_DEFINITIONS: Record<SkillType, Skill> = {
  skip: {
    type: 'skip',
    name: 'Skip',
    description: 'Do nothing this turn',
    targeting: [],
  },

  attack: {
    type: 'attack',
    name: 'Attack',
    description: 'Melee attack a front-row enemy',
    targeting: [{ type: 'enemy', count: 1, range: 'melee' }],
    range: 'melee',
    damageMultiplier: 1.0,
  },

  bolt: {
    type: 'bolt',
    name: 'Bolt',
    description: 'Ranged attack - can target any enemy',
    targeting: [{ type: 'enemy-any', count: 1 }],
    range: 'ranged',
    damageMultiplier: 0.8, // Slightly weaker than melee
  },

  defend: {
    type: 'defend',
    name: 'Defend',
    description: 'Take a defensive stance, reducing damage taken',
    targeting: [],
    buffType: 'defending',
    buffDuration: 1, // Until next turn
  },

  heal: {
    type: 'heal',
    name: 'Heal',
    description: 'Restore 30 HP to an ally',
    targeting: [{ type: 'ally-any', count: 1 }],
    range: 'ranged',
    healAmount: 30,
  },

  leech: {
    type: 'leech',
    name: 'Leech',
    description: 'Damage an enemy and heal yourself for half the damage dealt',
    targeting: [{ type: 'enemy-any', count: 1 }],
    range: 'ranged',
    damageMultiplier: 0.7,
    healAmount: 0.5, // 50% of damage dealt as healing
  },

  haste: {
    type: 'haste',
    name: 'Haste',
    description: 'Increase initiative by 10 for 5 turns',
    targeting: [{ type: 'ally-any', count: 1 }],
    range: 'ranged',
    buffType: 'haste',
    buffDuration: 5,
    buffValue: 10, // +10 initiative
  },

  bless: {
    type: 'bless',
    name: 'Bless',
    description: 'Increase power by 10 for 5 turns',
    targeting: [{ type: 'ally-any', count: 1 }],
    range: 'ranged',
    buffType: 'bless',
    buffDuration: 5,
    buffValue: 10, // +10 power
  },

  regen: {
    type: 'regen',
    name: 'Regen',
    description: 'Heal 5 HP per turn for 5 turns',
    targeting: [{ type: 'ally-any', count: 1 }],
    range: 'ranged',
    buffType: 'regen',
    buffDuration: 5,
    buffValue: 5, // 5 HP per turn
  },
};

/**
 * Get a skill definition by type
 */
export function getSkill(type: SkillType): Skill {
  return SKILL_DEFINITIONS[type];
}

/**
 * Get multiple skill definitions by types
 */
export function getSkills(types: SkillType[]): Skill[] {
  return types.map(type => SKILL_DEFINITIONS[type]);
}

// Legacy export for backwards compatibility
export const SKILLS = SKILL_DEFINITIONS;

// Default skill set for basic units
export const DEFAULT_SKILLS: Skill[] = [
  SKILL_DEFINITIONS.attack,
  SKILL_DEFINITIONS.defend,
  SKILL_DEFINITIONS.heal,
  SKILL_DEFINITIONS.skip,
];
