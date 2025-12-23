import { CharacterModel } from '../../types/index.js';
import { createCharacterModel } from '../characterModel.js';

/**
 * Basic Enemy - Balanced stats
 */
export const SKELETON: CharacterModel = createCharacterModel(
  'skeleton',
  'Skeleton',
  80,  // maxHealth
  15,  // power
  0,   // magic
  3,   // defense
  8,   // initiative
  []   // No unique skills, only defaults
);
