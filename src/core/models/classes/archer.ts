import { CharacterModel } from '../../types/index.js';
import { createCharacterModel } from '../characterModel.js';

/**
 * Ranged Attacker - Medium HP, ranged bolt attacks
 */
export const ARCHER: CharacterModel = createCharacterModel(
  'archer',
  'Archer',
  80,  // maxHealth
  20,  // power
  15,  // magic
  4,   // defense
  12,  // initiative (fast)
  ['bolt'] // Unique skill: bolt
);
