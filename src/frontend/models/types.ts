import { CharacterModel } from '../../backend/core/types';

export type GamePhase = 'party-selection' | 'battle';

export interface PartyGrid {
  [key: string]: CharacterModel | null; // key is "row-col", e.g. "0-0"
}

export interface DragState {
  template: CharacterModel | null;
  from: {
    team: 'player' | 'enemy';
    row: number;
    col: number;
  } | null;
}
