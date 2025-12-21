export type SkillType = 'skip' | 'attack' | 'defend' | 'heal';

export type TargetType = 'enemy' | 'ally' | 'self' | 'none';

export interface TargetRequirement {
  type: TargetType;
  count: number;
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
}

export interface Unit {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  isDefending: boolean;
  skills: Skill[];
}

export interface GameState {
  hero: Unit;
  skeleton: Unit;
  currentTurn: 'hero' | 'skeleton';
  gameOver: boolean;
  winner?: 'hero' | 'skeleton';
  log: string[];
}
