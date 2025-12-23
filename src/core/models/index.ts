import { CharacterModel } from '../types/index.js';

// Re-export classes and monsters
export * from './classes/index.js';
export * from './monsters/index.js';

// Aggregate imports
import { WARRIOR, ARCHER, CLERIC, MAGE, PALADIN, NECROMANCER } from './classes/index.js';
import { SKELETON, ORC } from './monsters/index.js';

/**
 * All character model templates
 */
export const CHARACTER_TEMPLATES = {
  WARRIOR,
  ARCHER,
  CLERIC,
  MAGE,
  PALADIN,
  NECROMANCER,
  SKELETON,
  ORC,
} as const;

/**
 * Player character classes
 */
export const CLASS_TEMPLATES = {
  WARRIOR,
  ARCHER,
  CLERIC,
  MAGE,
  PALADIN,
  NECROMANCER,
} as const;

/**
 * Enemy monster templates
 */
export const MONSTER_TEMPLATES = {
  SKELETON,
  ORC,
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

/**
 * Get all player class templates
 */
export function getAllClassTemplates(): CharacterModel[] {
  return Object.values(CLASS_TEMPLATES);
}

/**
 * Get all monster templates
 */
export function getAllMonsterTemplates(): CharacterModel[] {
  return Object.values(MONSTER_TEMPLATES);
}
