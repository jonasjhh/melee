export type SkillType = 'skip' | 'attack' | 'defend' | 'heal' | 'bolt' | 'leech' | 'haste' | 'bless' | 'regen';

export type TargetType = 'enemy' | 'ally' | 'self' | 'none' | 'enemy-any' | 'ally-any';

export type RangeType = 'melee' | 'ranged'; // Melee = front row only, Ranged = any row

export interface TargetRequirement {
  type: TargetType;
  count: number;
  range?: RangeType; // Optional range restriction
}

export interface ActionCommand {
  skill: SkillType;
  targets: string[]; // Array of unit IDs
}

export type BuffType = 'haste' | 'bless' | 'regen' | 'defending';

export interface Buff {
  type: BuffType;
  duration: number; // Turns remaining
  value: number; // Magnitude of effect (e.g., +10 power for bless, +5 HP/turn for regen)
  source?: string; // Unit ID that applied the buff
}

export interface Skill {
  type: SkillType;
  name: string;
  description?: string;
  targeting: TargetRequirement[]; // Array supports multi-step targeting
  range?: RangeType; // Default is 'melee' for attack, 'ranged' for bolt
  damageMultiplier?: number; // For attack/bolt/leech damage calculations
  healAmount?: number; // For heal/leech
  buffType?: BuffType; // For haste/bless/regen
  buffDuration?: number; // How many turns the buff lasts
  buffValue?: number; // Magnitude of the buff effect
}

export interface GridPosition {
  row: number; // 0-3
  col: number; // 0-1
}

export type TeamId = 'player' | 'enemy';

export interface GridCell {
  position: GridPosition;
  unitId: string | null;
  team: TeamId;
}

export interface BattleGrid {
  cells: GridCell[][];
  units: Map<string, Unit>;
}

export interface TurnOrder {
  roundNumber: number;
  unitOrder: string[]; // Unit IDs in initiative order
  currentUnitIndex: number;
  actedThisRound: Set<string>;
}

export interface Unit {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  power: number; // Renamed from attack for clarity
  defense: number;
  initiative: number;
  position: GridPosition;
  team: TeamId;
  skills: Skill[];
  buffs: Buff[]; // Active buffs on this unit
  modelId?: string; // Reference to the character model this was created from
}

export interface GameState {
  grid: BattleGrid;
  turnOrder: TurnOrder;
  playerControlledUnits: Set<string>; // Which units player controls
  gameOver: boolean;
  winner?: TeamId;
  log: string[];
}

// Character Model System
export interface CharacterModel {
  id: string;
  name: string;
  maxHealth: number;
  power: number;
  defense: number;
  initiative: number;
  skillTypes: SkillType[]; // Which skills this model can use
}

export interface Party {
  id: string;
  name: string;
  models: CharacterModel[]; // Array of character models in this party
}
