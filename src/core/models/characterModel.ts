import { CharacterModel, SkillType } from '../types/index.js';

/**
 * Create a character model with specified stats and skills
 */
export function createCharacterModel(
  id: string,
  name: string,
  maxHealth: number,
  power: number,
  magic: number,
  defense: number,
  initiative: number,
  skillTypes: SkillType[]
): CharacterModel {
  return {
    id,
    name,
    maxHealth,
    power,
    magic,
    defense,
    initiative,
    skillTypes,
  };
}

// Re-export everything from models index
export {
  CHARACTER_TEMPLATES,
  CLASS_TEMPLATES,
  MONSTER_TEMPLATES,
  getCharacterTemplate,
  getAllCharacterTemplates,
  getAllClassTemplates,
  getAllMonsterTemplates,
} from './index.js';
