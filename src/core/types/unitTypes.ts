import { GridPosition, TeamId } from './gridTypes.js';
import { Skill } from './skillTypes.js';
import { Buff } from './buffTypes.js';

export interface Unit {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  power: number; // Physical attack power
  magic: number; // Magic power for spells
  defense: number;
  initiative: number;
  position: GridPosition;
  team: TeamId;
  skills: Skill[];
  buffs: Buff[]; // Active buffs on this unit
  modelId?: string; // Reference to the character model this was created from
}
