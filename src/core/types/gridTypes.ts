import { Unit } from './unitTypes.js';

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
