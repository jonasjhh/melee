import { CharacterModel } from '../../types/index.js';
import { createCharacterModel } from '../characterModel.js';

/**
 * Mage - Low HP, high magic, ranged and life-steal
 */
export const MAGE: CharacterModel = createCharacterModel(
  'mage',
  'Mage',
  60,  // maxHealth
  10,  // power (low physical)
  30,  // magic (very high)
  3,   // defense (very low)
  9,   // initiative
  ['bolt', 'leech', 'haste'] // Unique skills: offensive and speed magic
);
