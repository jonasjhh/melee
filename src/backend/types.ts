export type SkillType = 'skip' | 'attack' | 'defend';

export interface Skill {
  type: SkillType;
  name: string;
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
