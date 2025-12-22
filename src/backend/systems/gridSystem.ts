import { GridPosition, GridCell, BattleGrid, Unit, TeamId } from '../core/types.js';

export function createEmptyGrid(): BattleGrid {
  const cells: GridCell[][] = [];
  for (let row = 0; row < 4; row++) {
    cells[row] = [];
    for (let col = 0; col < 4; col++) {
      // Columns 0-1 are player side, columns 2-3 are enemy side
      const team: TeamId = col < 2 ? 'player' : 'enemy';
      cells[row][col] = {
        position: { row, col },
        unitId: null,
        team,
      };
    }
  }
  return { cells, units: new Map() };
}

export function placeUnit(grid: BattleGrid, unit: Unit, position: GridPosition): BattleGrid {
  const newCells = grid.cells.map(row => [...row]);
  const newUnits = new Map(grid.units);

  // Remove from old position if exists
  if (grid.units.has(unit.id)) {
    const oldPos = grid.units.get(unit.id)!.position;
    newCells[oldPos.row][oldPos.col].unitId = null;
  }

  // Place at new position
  newCells[position.row][position.col].unitId = unit.id;
  unit.position = position;
  newUnits.set(unit.id, unit);

  return { cells: newCells, units: newUnits };
}

export function getUnitAt(grid: BattleGrid, position: GridPosition): Unit | null {
  const unitId = grid.cells[position.row][position.col].unitId;
  return unitId ? grid.units.get(unitId) || null : null;
}

export function getTeamUnits(grid: BattleGrid, team: TeamId): Unit[] {
  return Array.from(grid.units.values()).filter(u => u.team === team && u.health > 0);
}

export function getAllUnits(grid: BattleGrid): Unit[] {
  return Array.from(grid.units.values());
}

export function updateUnit(grid: BattleGrid, unitId: string, updates: Partial<Unit>): BattleGrid {
  const unit = grid.units.get(unitId);
  if (!unit) return grid;

  const newUnits = new Map(grid.units);
  newUnits.set(unitId, { ...unit, ...updates });

  return { ...grid, units: newUnits };
}
