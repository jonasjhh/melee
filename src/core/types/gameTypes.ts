import { BattleGrid, TeamId } from './gridTypes.js';
import { TurnOrder } from './turnTypes.js';

export interface GameState {
  grid: BattleGrid;
  turnOrder: TurnOrder;
  playerControlledUnits: Set<string>; // Which units player controls
  gameOver: boolean;
  winner?: TeamId;
  log: string[];
}
