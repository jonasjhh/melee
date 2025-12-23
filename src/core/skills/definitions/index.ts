import { Skill, SkillType } from '../../types/index.js';

// Individual skill exports
export { wait } from './wait.js';
export { attack } from './attack.js';
export { defend } from './defend.js';
export { move } from './move.js';
export { bolt } from './bolt.js';
export { heal } from './heal.js';
export { leech } from './leech.js';
export { haste } from './haste.js';
export { bless } from './bless.js';
export { regen } from './regen.js';

// Aggregate imports for convenience
import { wait } from './wait.js';
import { attack } from './attack.js';
import { defend } from './defend.js';
import { move } from './move.js';
import { bolt } from './bolt.js';
import { heal } from './heal.js';
import { leech } from './leech.js';
import { haste } from './haste.js';
import { bless } from './bless.js';
import { regen } from './regen.js';

/**
 * All skill definitions
 */
export const SKILL_DEFINITIONS: Record<SkillType, Skill> = {
  wait,
  attack,
  defend,
  move,
  bolt,
  heal,
  leech,
  haste,
  bless,
  regen,
};

/**
 * Default skill types that all units get automatically
 */
export const DEFAULT_SKILL_TYPES: SkillType[] = ['attack', 'defend', 'wait', 'move'];

/**
 * Get a skill definition by type
 */
export function getSkillDefinition(type: SkillType): Skill {
  return SKILL_DEFINITIONS[type];
}

/**
 * Get multiple skill definitions
 */
export function getSkills(types: SkillType[]): Skill[] {
  return types.map(type => SKILL_DEFINITIONS[type]);
}
