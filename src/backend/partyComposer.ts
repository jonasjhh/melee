import { Party, CharacterModel, Unit, GridPosition, TeamId } from './types.js';
import { getSkills } from './skillDefinitions.js';

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
  return {
    id: unitId,
    name: model.name,
    health: model.maxHealth,
    maxHealth: model.maxHealth,
    power: model.power,
    defense: model.defense,
    initiative: model.initiative,
    position,
    team,
    skills: getSkills(model.skillTypes),
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
