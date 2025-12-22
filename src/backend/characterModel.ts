import { CharacterModel, SkillType } from './types.js';

/**
 * Create a character model with specified stats and skills
 */
export function createCharacterModel(
  id: string,
  name: string,
  maxHealth: number,
  power: number,
  defense: number,
  initiative: number,
  skillTypes: SkillType[]
): CharacterModel {
  return {
    id,
    name,
    maxHealth,
    power,
    defense,
    initiative,
    skillTypes,
  };
}

/**
 * Pre-defined character model templates
 */
export const CHARACTER_TEMPLATES = {
  /**
   * Melee Fighter - High HP and power, front-line attacker
   */
  WARRIOR: createCharacterModel(
    'warrior',
    'Warrior',
    120, // maxHealth
    25,  // power
    8,   // defense
    8,   // initiative
    ['attack', 'defend', 'skip']
  ),

  /**
   * Ranged Attacker - Medium HP, ranged bolt attacks
   */
  ARCHER: createCharacterModel(
    'archer',
    'Archer',
    80,  // maxHealth
    20,  // power
    4,   // defense
    12,  // initiative (fast)
    ['bolt', 'attack', 'defend', 'skip']
  ),

  /**
   * Healer/Support - Low HP, healing and buffs
   */
  CLERIC: createCharacterModel(
    'cleric',
    'Cleric',
    70,  // maxHealth
    12,  // power (weak attacks)
    6,   // defense
    10,  // initiative
    ['heal', 'bless', 'regen', 'defend', 'skip']
  ),

  /**
   * Mage - Low HP, high power, ranged and life-steal
   */
  MAGE: createCharacterModel(
    'mage',
    'Mage',
    60,  // maxHealth
    30,  // power (very high)
    3,   // defense (very low)
    9,   // initiative
    ['bolt', 'leech', 'haste', 'skip']
  ),

  /**
   * Tank - Very high HP and defense, low power
   */
  PALADIN: createCharacterModel(
    'paladin',
    'Paladin',
    150, // maxHealth (very high)
    18,  // power
    12,  // defense (very high)
    6,   // initiative (slow)
    ['attack', 'defend', 'heal', 'bless', 'skip']
  ),

  /**
   * Basic Enemy - Balanced stats
   */
  SKELETON: createCharacterModel(
    'skeleton',
    'Skeleton',
    80,  // maxHealth
    15,  // power
    3,   // defense
    8,   // initiative
    ['attack', 'defend', 'skip']
  ),

  /**
   * Necromancer Enemy - Ranged caster with life steal
   */
  NECROMANCER: createCharacterModel(
    'necromancer',
    'Necromancer',
    70,  // maxHealth
    22,  // power
    4,   // defense
    10,  // initiative
    ['bolt', 'leech', 'regen', 'skip']
  ),

  /**
   * Orc Brute - High damage melee
   */
  ORC: createCharacterModel(
    'orc',
    'Orc',
    100, // maxHealth
    28,  // power (very high)
    5,   // defense
    7,   // initiative
    ['attack', 'defend', 'skip']
  ),
} as const;

/**
 * Get a character model template by ID
 */
export function getCharacterTemplate(id: string): CharacterModel | undefined {
  const templates = CHARACTER_TEMPLATES as Record<string, CharacterModel>;
  return templates[id.toUpperCase()];
}

/**
 * Get all available character templates
 */
export function getAllCharacterTemplates(): CharacterModel[] {
  return Object.values(CHARACTER_TEMPLATES);
}
