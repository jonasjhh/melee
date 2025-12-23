import { CharacterModel } from '../../types/index.js';
import { createCharacterModel } from '../characterModel.js';

/**
 * Orc Brute - High damage melee
 */
export const ORC: CharacterModel = createCharacterModel(
  'orc',
  'Orc',
  100, // maxHealth
  28,  // power (very high)
  0,   // magic
  5,   // defense
  7,   // initiative
  []   // No unique skills, only defaults
);
