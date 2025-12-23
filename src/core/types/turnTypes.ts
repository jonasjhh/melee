export interface TurnOrder {
  roundNumber: number;
  unitOrder: string[]; // Unit IDs in initiative order
  currentUnitIndex: number;
  actedThisRound: Set<string>;
}
