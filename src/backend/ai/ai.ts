import { GameState, SkillType, ActionCommand, Skill, Unit } from '../core/types.js';
import { SKILLS } from '../skills/skills.js';
import { getValidTargets } from '../systems/targetingSystem.js';

/**
 * AI that chooses skills and intelligently selects targets
 */
export function getSkeletonAction(state: GameState, unitId: string): ActionCommand {
  const unit = state.grid.units.get(unitId);
  if (!unit) {
    return { skill: 'wait', targets: [] };
  }

  // Use the unit's actual available skills
  const availableSkillTypes: SkillType[] = unit.skills.map(s => s.type);

  // Filter out 'wait' and 'move' for AI selection (use wait as fallback)
  const usefulSkills = availableSkillTypes.filter(t => t !== 'wait' && t !== 'move');

  // Choose a random skill from useful skills, or wait if none available
  const chosenSkillType = usefulSkills.length > 0
    ? usefulSkills[Math.floor(Math.random() * usefulSkills.length)]
    : 'wait';

  const skill = SKILLS[chosenSkillType];
  const targets = selectTargets(skill, state, unitId);

  return { skill: chosenSkillType, targets };
}

/**
 * Select targets for a skill using smart heuristics
 */
function selectTargets(
  skill: Skill,
  state: GameState,
  activeUnitId: string
): string[] {
  const targets: string[] = [];

  for (const requirement of skill.targeting) {
    const candidates = getValidTargets(state, activeUnitId, requirement);

    if (candidates.length === 0) continue;

    // Smart targeting heuristics
    let selected: Unit;
    switch (requirement.type) {
      case 'enemy':
      case 'enemy-any':
        // Target highest health enemy (most threatening)
        selected = candidates.sort((a, b) => b.health - a.health)[0];
        break;
      case 'ally':
      case 'ally-any':
        // Target lowest health ally (most in need of healing)
        selected = candidates.sort((a, b) => a.health - b.health)[0];
        break;
      case 'self':
        selected = candidates[0]; // Only one option
        break;
      default:
        selected = candidates[0];
    }

    targets.push(selected.id);
  }

  return targets;
}
