import { GameState, Skill, TargetRequirement, Unit } from './types.js';
import { getAllUnits } from './gridSystem.js';

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
  const activeUnit = state.grid.units.get(activeUnitId);
  if (!activeUnit) return [];

  const allUnits = getAllUnits(state.grid).filter(u => u.health > 0);

  switch (requirement.type) {
    case 'enemy':
    case 'enemy-any':
      // Enemies are units on the opposing team
      return allUnits.filter(u => u.team !== activeUnit.team);

    case 'ally':
    case 'ally-any':
      // Allies are units on the same team
      return allUnits.filter(u => u.team === activeUnit.team);

    case 'self':
      // Self targeting - only the active unit
      return allUnits.filter(u => u.id === activeUnitId);

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
