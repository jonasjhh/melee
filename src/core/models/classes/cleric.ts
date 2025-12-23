import { CharacterModel } from '../../types/index.js';
import { createCharacterModel } from '../characterModel.js';

/**
 * Healer/Support - Low HP, healing and buffs
 */
export const CLERIC: CharacterModel = createCharacterModel(
  'cleric',
  'Cleric',
  70,  // maxHealth
  12,  // power (weak attacks)
  25,  // magic (high)
  6,   // defense
  10,  // initiative
  ['heal', 'bless', 'regen'] // Unique skills: healing and support
);
