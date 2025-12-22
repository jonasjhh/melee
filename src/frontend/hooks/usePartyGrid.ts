import { useState } from 'react';
import { CharacterModel } from '../../backend/core/types';
import { PartyGrid } from '../models/types';
import { PositionedModel } from '../../backend/game/partyComposer';

export interface UsePartyGridReturn {
  playerGrid: PartyGrid;
  enemyGrid: PartyGrid;
  setPlayerGrid: (grid: PartyGrid) => void;
  setEnemyGrid: (grid: PartyGrid) => void;
  clearGrid: (team: 'player' | 'enemy') => void;
  placeUnit: (row: number, col: number, team: 'player' | 'enemy', unit: CharacterModel) => void;
  removeUnit: (row: number, col: number, team: 'player' | 'enemy') => void;
  moveUnit: (
    fromRow: number,
    fromCol: number,
    fromTeam: 'player' | 'enemy',
    toRow: number,
    toCol: number,
    toTeam: 'player' | 'enemy'
  ) => void;
  getPlayerModels: () => CharacterModel[];
  getEnemyModels: () => CharacterModel[];
  getPlayerPositionedModels: () => PositionedModel[];
  getEnemyPositionedModels: () => PositionedModel[];
}

export function usePartyGrid(): UsePartyGridReturn {
  const [playerGrid, setPlayerGrid] = useState<PartyGrid>({});
  const [enemyGrid, setEnemyGrid] = useState<PartyGrid>({});

  const clearGrid = (team: 'player' | 'enemy') => {
    if (team === 'player') {
      setPlayerGrid({});
    } else {
      setEnemyGrid({});
    }
  };

  const placeUnit = (row: number, col: number, team: 'player' | 'enemy', unit: CharacterModel) => {
    const key = `${row}-${col}`;
    const grid = team === 'player' ? playerGrid : enemyGrid;
    const setGrid = team === 'player' ? setPlayerGrid : setEnemyGrid;

    setGrid({ ...grid, [key]: unit });
  };

  const removeUnit = (row: number, col: number, team: 'player' | 'enemy') => {
    const key = `${row}-${col}`;
    const grid = team === 'player' ? playerGrid : enemyGrid;
    const setGrid = team === 'player' ? setPlayerGrid : setEnemyGrid;

    const newGrid = { ...grid };
    delete newGrid[key];
    setGrid(newGrid);
  };

  const moveUnit = (
    fromRow: number,
    fromCol: number,
    fromTeam: 'player' | 'enemy',
    toRow: number,
    toCol: number,
    toTeam: 'player' | 'enemy'
  ) => {
    const fromKey = `${fromRow}-${fromCol}`;
    const toKey = `${toRow}-${toCol}`;

    // Same cell - do nothing
    if (fromTeam === toTeam && fromKey === toKey) {
      return;
    }

    const fromGrid = fromTeam === 'player' ? playerGrid : enemyGrid;
    const unit = fromGrid[fromKey];

    if (!unit) return;

    // Moving within same team - atomic operation
    if (fromTeam === toTeam) {
      const setGrid = fromTeam === 'player' ? setPlayerGrid : setEnemyGrid;
      const updatedGrid = { ...fromGrid };
      delete updatedGrid[fromKey];
      updatedGrid[toKey] = unit;
      setGrid(updatedGrid);
    } else {
      // Moving across teams - two separate updates
      const toGrid = toTeam === 'player' ? playerGrid : enemyGrid;
      const setFromGrid = fromTeam === 'player' ? setPlayerGrid : setEnemyGrid;
      const setToGrid = toTeam === 'player' ? setPlayerGrid : setEnemyGrid;

      const newFromGrid = { ...fromGrid };
      delete newFromGrid[fromKey];
      setFromGrid(newFromGrid);

      const newToGrid = { ...toGrid, [toKey]: unit };
      setToGrid(newToGrid);
    }
  };

  const getPlayerModels = (): CharacterModel[] => {
    return Object.values(playerGrid).filter((m): m is CharacterModel => m !== null);
  };

  const getEnemyModels = (): CharacterModel[] => {
    return Object.values(enemyGrid).filter((m): m is CharacterModel => m !== null);
  };

  const getPlayerPositionedModels = (): PositionedModel[] => {
    return Object.entries(playerGrid)
      .filter(([_, model]) => model !== null)
      .map(([key, model]) => {
        const [row, col] = key.split('-').map(Number);
        return {
          model: model!,
          position: { row, col }
        };
      });
  };

  const getEnemyPositionedModels = (): PositionedModel[] => {
    return Object.entries(enemyGrid)
      .filter(([_, model]) => model !== null)
      .map(([key, model]) => {
        const [row, col] = key.split('-').map(Number);
        return {
          model: model!,
          position: { row, col }
        };
      });
  };

  return {
    playerGrid,
    enemyGrid,
    setPlayerGrid,
    setEnemyGrid,
    clearGrid,
    placeUnit,
    removeUnit,
    moveUnit,
    getPlayerModels,
    getEnemyModels,
    getPlayerPositionedModels,
    getEnemyPositionedModels,
  };
}
