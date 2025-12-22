import { GameState, ActionCommand, CharacterModel, Party } from './types.js';
import { createEmptyGrid, placeUnit } from './gridSystem.js';
import { createTurnOrder, getActiveUnit, isPlayerControlled } from './initiativeSystem.js';
import { executeBattleAction } from './battleSimulator.js';
import { getSkeletonAction } from './ai.js';
import { CHARACTER_TEMPLATES } from './characterModel.js';
import { createParty, createUnitsFromParty } from './partyComposer.js';

/**
 * Strategy for getting the next action for a unit
 */
export type ActionStrategy = (state: GameState, unitId: string) => ActionCommand;

/**
 * Configuration for the game orchestrator
 */
export interface GameOrchestratorConfig {
  defenderStrategy?: ActionStrategy;
  playerParty?: Party;
  enemyParty?: Party;
}

/**
 * Create default player party (2 heroes)
 */
function createDefaultPlayerParty(): Party {
  return createParty('player-party', 'Heroes', [
    CHARACTER_TEMPLATES.WARRIOR,
    CHARACTER_TEMPLATES.CLERIC,
  ]);
}

/**
 * Create default enemy party (2 skeletons)
 */
function createDefaultEnemyParty(): Party {
  return createParty('enemy-party', 'Enemies', [
    CHARACTER_TEMPLATES.SKELETON,
    CHARACTER_TEMPLATES.SKELETON,
  ]);
}

/**
 * Creates a new game with customizable parties on a 4x4 grid
 */
export function createGame(config: GameOrchestratorConfig = {}): GameState {
  const playerParty = config.playerParty || createDefaultPlayerParty();
  const enemyParty = config.enemyParty || createDefaultEnemyParty();

  let grid = createEmptyGrid();

  // Create units from parties
  // Player team starts at row 0, enemy team starts at row 2
  const playerUnits = createUnitsFromParty(playerParty, 'player', 0);
  const enemyUnits = createUnitsFromParty(enemyParty, 'enemy', 2);

  // Place all units on grid
  playerUnits.forEach(unit => {
    grid = placeUnit(grid, unit, unit.position);
  });

  enemyUnits.forEach(unit => {
    grid = placeUnit(grid, unit, unit.position);
  });

  const turnOrder = createTurnOrder(grid);
  const playerControlledUnits = new Set(playerUnits.map(u => u.id));

  return {
    grid,
    turnOrder,
    playerControlledUnits,
    gameOver: false,
    log: [
      `Battle begins! ${playerParty.name} (${playerUnits.length}) vs ${enemyParty.name} (${enemyUnits.length})!`
    ],
  };
}

/**
 * Create a game with specific character models
 */
export function createGameWithModels(
  playerModels: CharacterModel[],
  enemyModels: CharacterModel[]
): GameState {
  const playerParty = createParty('player-party', 'Player Team', playerModels);
  const enemyParty = createParty('enemy-party', 'Enemy Team', enemyModels);

  return createGame({ playerParty, enemyParty });
}

/**
 * Executes an action in the game
 * Automatically handles AI turns until the next player-controlled unit
 */
export function executeAction(
  state: GameState,
  command: ActionCommand,
  config: GameOrchestratorConfig = {}
): GameState {
  const { defenderStrategy = getSkeletonAction } = config;

  // Execute player command
  let newState = executeBattleAction(state, command);

  // AI loop: keep executing AI turns until next player-controlled unit
  while (!newState.gameOver) {
    const activeUnitId = getActiveUnit(newState.turnOrder);

    if (isPlayerControlled(activeUnitId, newState.playerControlledUnits)) {
      // Next turn is player-controlled, stop
      break;
    }

    // AI turn
    const aiCommand = defenderStrategy(newState, activeUnitId);
    newState = executeBattleAction(newState, aiCommand);
  }

  return newState;
}
