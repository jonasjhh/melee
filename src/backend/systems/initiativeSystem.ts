import { TurnOrder, BattleGrid } from '../core/types.js';
import { getAllUnits } from './gridSystem.js';

export function createTurnOrder(grid: BattleGrid): TurnOrder {
  // Simple round-robin: player units first, then enemy units
  const allUnits = getAllUnits(grid).filter(u => u.health > 0);

  const playerUnits = allUnits.filter(u => u.team === 'player');
  const enemyUnits = allUnits.filter(u => u.team === 'enemy');

  // All players first, then all enemies
  const unitOrder = [
    ...playerUnits.map(u => u.id),
    ...enemyUnits.map(u => u.id),
  ];

  return {
    roundNumber: 1,
    unitOrder,
    currentUnitIndex: 0,
    actedThisRound: new Set(),
  };
}

export function getActiveUnit(turnOrder: TurnOrder): string {
  return turnOrder.unitOrder[turnOrder.currentUnitIndex];
}

export function advanceTurn(turnOrder: TurnOrder, grid: BattleGrid): TurnOrder {
  const activeUnitId = getActiveUnit(turnOrder);
  const newActedThisRound = new Set(turnOrder.actedThisRound);
  newActedThisRound.add(activeUnitId);

  let newIndex = turnOrder.currentUnitIndex + 1;
  let newRound = turnOrder.roundNumber;

  // Skip dead units
  const aliveUnits = getAllUnits(grid).filter(u => u.health > 0);
  const aliveUnitIds = new Set(aliveUnits.map(u => u.id));

  while (newIndex < turnOrder.unitOrder.length && !aliveUnitIds.has(turnOrder.unitOrder[newIndex])) {
    newIndex++;
  }

  // End of round - wrap around
  if (newIndex >= turnOrder.unitOrder.length) {
    newIndex = 0;
    newRound++;
    newActedThisRound.clear();

    // Skip dead units from start
    while (newIndex < turnOrder.unitOrder.length && !aliveUnitIds.has(turnOrder.unitOrder[newIndex])) {
      newIndex++;
    }
  }

  return {
    roundNumber: newRound,
    unitOrder: turnOrder.unitOrder,
    currentUnitIndex: newIndex,
    actedThisRound: newActedThisRound,
  };
}

export function isPlayerControlled(unitId: string, playerControlledUnits: Set<string>): boolean {
  return playerControlledUnits.has(unitId);
}
