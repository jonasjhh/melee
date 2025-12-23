import { Party, CharacterModel, Unit, GridPosition, TeamId } from '../core/types.js';
import { getSkills, DEFAULT_SKILL_TYPES } from '../skills/skillDefinitions.js';

/**
 * Positioned model - pairs a character model with a grid position
 */
export interface PositionedModel {
  model: CharacterModel;
  position: GridPosition;
}

/**
 * Create a party from character models
 */
export function createParty(
  id: string,
  name: string,
  models: CharacterModel[]
): Party {
  return {
    id,
    name,
    models,
  };
}

/**
 * Create a unit from a character model
 */
export function createUnitFromModel(
  model: CharacterModel,
  unitId: string,
  position: GridPosition,
  team: TeamId
): Unit {
  // Combine default skills with unique skills from the model
  const allSkillTypes = [...DEFAULT_SKILL_TYPES, ...model.skillTypes];

  return {
    id: unitId,
    name: model.name,
    health: model.maxHealth,
    maxHealth: model.maxHealth,
    power: model.power,
    magic: model.magic,
    defense: model.defense,
    initiative: model.initiative,
    position,
    team,
    skills: getSkills(allSkillTypes),
    buffs: [],
    modelId: model.id,
  };
}

/**
 * Create units from a party
 * Places units on the grid based on party size and team
 */
export function createUnitsFromParty(
  party: Party,
  team: TeamId,
  startingRow: number
): Unit[] {
  const units: Unit[] = [];

  // Place units in a 2-column grid starting at startingRow
  // First 2 models go in front row, rest in back row
  party.models.forEach((model, index) => {
    const col = index % 2; // Alternate between columns 0 and 1
    const row = startingRow + Math.floor(index / 2); // Move to next row after 2 units
    const unitId = `${team}-${model.id}-${index}`;

    const position: GridPosition = { row, col };
    units.push(createUnitFromModel(model, unitId, position, team));
  });

  return units;
}

/**
 * Create units from positioned models
 * Uses the exact positions specified in the positioned models
 */
export function createUnitsFromPositionedModels(
  positionedModels: PositionedModel[],
  team: TeamId
): Unit[] {
  const units: Unit[] = [];

  positionedModels.forEach((pm, index) => {
    const unitId = `${team}-${pm.model.id}-${index}`;
    units.push(createUnitFromModel(pm.model, unitId, pm.position, team));
  });

  return units;
}

/**
 * Validate party composition
 */
export function validateParty(party: Party): { valid: boolean; error?: string } {
  if (party.models.length === 0) {
    return { valid: false, error: 'Party must have at least one character' };
  }

  if (party.models.length > 4) {
    return { valid: false, error: 'Party cannot have more than 4 characters' };
  }

  return { valid: true };
}
