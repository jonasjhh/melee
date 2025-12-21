import { Unit, ActionCommand } from './types.js';
import { createHero, createSkeleton } from './unit.js';
import { getSkeletonAction } from './ai.js';
import {
  BattleState,
  createBattle,
  executeBattleAction,
  BattleConfig,
} from './battleSimulator.js';

/**
 * Game-specific state that wraps the battle simulator
 * This layer knows about "hero" and "skeleton" specifically
 */
export interface GameState {
  hero: Unit;
  skeleton: Unit;
  currentTurn: 'hero' | 'skeleton';
  gameOver: boolean;
  winner?: 'hero' | 'skeleton';
  log: string[];
}

/**
 * Strategy for getting the next action for a unit
 */
export type ActionStrategy = (state: GameState) => ActionCommand;

/**
 * Configuration for the game orchestrator
 */
export interface GameOrchestratorConfig {
  battleConfig?: Partial<BattleConfig>;
  defenderStrategy?: ActionStrategy;
}

/**
 * Converts battle state to game state
 */
function battleStateToGameState(battleState: BattleState): GameState {
  return {
    hero: battleState.attacker,
    skeleton: battleState.defender,
    currentTurn: battleState.currentTurn === 'attacker' ? 'hero' : 'skeleton',
    gameOver: battleState.gameOver,
    winner: battleState.winner
      ? battleState.winner === 'attacker'
        ? 'hero'
        : 'skeleton'
      : undefined,
    log: battleState.log,
  };
}

/**
 * Converts game state to battle state
 */
function gameStateToBattleState(gameState: GameState): BattleState {
  return {
    attacker: gameState.hero,
    defender: gameState.skeleton,
    currentTurn: gameState.currentTurn === 'hero' ? 'attacker' : 'defender',
    gameOver: gameState.gameOver,
    winner: gameState.winner
      ? gameState.winner === 'hero'
        ? 'attacker'
        : 'defender'
      : undefined,
    log: gameState.log,
  };
}

/**
 * Creates a new game with hero vs skeleton
 */
export function createGame(config: GameOrchestratorConfig = {}): GameState {
  const hero = createHero();
  const skeleton = createSkeleton();
  const battleState = createBattle(hero, skeleton, config.battleConfig);
  return battleStateToGameState(battleState);
}

/**
 * Executes an action in the game
 * Automatically handles AI turns for the defender
 */
export function executeAction(
  state: GameState,
  command: ActionCommand,
  config: GameOrchestratorConfig = {}
): GameState {
  if (state.gameOver) {
    return state;
  }

  // Default defender strategy is the skeleton AI
  const defenderStrategy =
    config.defenderStrategy || getSkeletonAction;

  // Convert to battle state and execute action
  let battleState = gameStateToBattleState(state);
  battleState = executeBattleAction(battleState, command, config.battleConfig);

  // If it's now defender's turn and game is not over, execute AI action
  if (battleState.currentTurn === 'defender' && !battleState.gameOver) {
    const gameState = battleStateToGameState(battleState);
    const defenderCommand = defenderStrategy(gameState);
    battleState = executeBattleAction(
      battleState,
      defenderCommand,
      config.battleConfig
    );
  }

  return battleStateToGameState(battleState);
}
