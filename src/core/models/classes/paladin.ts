import { CharacterModel } from '../../types/index.js';
import { createCharacterModel } from '../characterModel.js';

/**
 * Tank - Very high HP and defense, low power
 */
export const PALADIN: CharacterModel = createCharacterModel(
  'paladin',
  'Paladin',
  150, // maxHealth (very high)
  18,  // power
  15,  // magic
  12,  // defense (very high)
  6,   // initiative (slow)
  ['heal', 'bless'] // Unique skills: supportive holy magic
);
