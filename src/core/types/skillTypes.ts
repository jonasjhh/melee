export type SkillType = 'wait' | 'attack' | 'defend' | 'move' | 'heal' | 'bolt' | 'leech' | 'haste' | 'bless' | 'regen';

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

export interface Skill {
  type: SkillType;
  name: string;
  description?: string;
  targeting: TargetRequirement[]; // Array supports multi-step targeting
  range?: RangeType; // Default is 'melee' for attack, 'ranged' for bolt
  damageMultiplier?: number; // For attack/bolt/leech damage calculations
  healAmount?: number; // For heal/leech
  buffType?: import('./buffTypes.js').BuffType; // For haste/bless/regen
  buffDuration?: number; // How many turns the buff lasts
  buffValue?: number; // Magnitude of the buff effect
}
