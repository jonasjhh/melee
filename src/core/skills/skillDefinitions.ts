import { Skill } from '../types/index.js';

// Re-export skill definitions from the definitions directory
export {
  SKILL_DEFINITIONS,
  DEFAULT_SKILL_TYPES,
  getSkillDefinition,
  getSkills,
} from './definitions/index.js';

// Re-export for backwards compatibility
import { SKILL_DEFINITIONS, getSkillDefinition } from './definitions/index.js';

export const SKILLS = SKILL_DEFINITIONS;
export const getSkill = getSkillDefinition;

// Default skill set for basic units
export const DEFAULT_SKILLS: Skill[] = [
  SKILL_DEFINITIONS.attack,
  SKILL_DEFINITIONS.defend,
  SKILL_DEFINITIONS.wait,
  SKILL_DEFINITIONS.move,
];
