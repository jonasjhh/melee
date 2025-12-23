import { CharacterModel } from '../../types/index.js';
import { createCharacterModel } from '../characterModel.js';

/**
 * Melee Fighter - High HP and power, front-line attacker
 */
export const WARRIOR: CharacterModel = createCharacterModel(
  'warrior',
  'Warrior',
  120, // maxHealth
  25,  // power
  0,   // magic
  8,   // defense
  8,   // initiative
  []   // No unique skills, only defaults
);
