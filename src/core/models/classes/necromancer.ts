import { CharacterModel } from '../../types/index.js';
import { createCharacterModel } from '../characterModel.js';

/**
 * Necromancer Enemy - Ranged caster with life steal
 */
export const NECROMANCER: CharacterModel = createCharacterModel(
  'necromancer',
  'Necromancer',
  70,  // maxHealth
  10,  // power
  22,  // magic
  4,   // defense
  10,  // initiative
  ['bolt', 'leech', 'regen'] // Unique skills: dark magic
);
