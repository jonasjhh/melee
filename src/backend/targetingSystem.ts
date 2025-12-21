import { GameState, Skill, TargetRequirement, Unit } from './types.js';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Get all valid targets for a given targeting requirement
 */
export function getValidTargets(
  state: GameState,
  activeUnitId: string,
  requirement: TargetRequirement
): Unit[] {
  const allUnits = [state.hero, state.skeleton];

  switch (requirement.type) {
    case 'enemy':
      // Enemies are units that are not the active unit and are alive
      return allUnits.filter((u) => u.id !== activeUnitId && u.health > 0);

    case 'ally':
      // Currently with only 2 units (hero vs skeleton), ally means self
      // This is set up for future party members where ally would include other team members
      return allUnits.filter((u) => u.id === activeUnitId && u.health > 0);

    case 'self':
      // Self targeting - only the active unit
      return allUnits.filter((u) => u.id === activeUnitId);

    case 'none':
      // No targeting needed
      return [];

    default:
      return [];
  }
}

/**
 * Validate that the provided targets are valid for the given skill
 */
export function validateTargets(
  skill: Skill,
  targets: string[],
  state: GameState,
  activeUnitId: string
): ValidationResult {
  // Calculate expected number of targets
  const expectedCount = skill.targeting.reduce((sum, req) => sum + req.count, 0);

  if (targets.length !== expectedCount) {
    return {
      valid: false,
      error: `Expected ${expectedCount} target(s), but got ${targets.length}`,
    };
  }

  // Validate each target against requirements
  let targetIndex = 0;

  for (const requirement of skill.targeting) {
    const validTargets = getValidTargets(state, activeUnitId, requirement);
    const validIds = new Set(validTargets.map((u) => u.id));

    for (let i = 0; i < requirement.count; i++) {
      const targetId = targets[targetIndex++];

      if (!validIds.has(targetId)) {
        return {
          valid: false,
          error: `Invalid target: ${targetId} is not a valid ${requirement.type} target`,
        };
      }
    }
  }

  return { valid: true };
}
