import { Unit, SkillType } from './types.js';

export interface BattleState {
  attacker: Unit;
  defender: Unit;
  currentTurn: 'attacker' | 'defender';
  gameOver: boolean;
  winner?: 'attacker' | 'defender';
  log: string[];
}

export interface BattleConfig {
  attackDamage: number;
  defendDamageReduction: number;
}

const DEFAULT_CONFIG: BattleConfig = {
  attackDamage: 20,
  defendDamageReduction: 0.5,
};

/**
 * Creates a new battle state with the given units
 */
export function createBattle(
  attacker: Unit,
  defender: Unit,
  _config: Partial<BattleConfig> = {}
): BattleState {

  return {
    attacker: { ...attacker },
    defender: { ...defender },
    currentTurn: 'attacker',
    gameOver: false,
    log: [`Battle started! ${attacker.name} vs ${defender.name}`],
  };
}

/**
 * Executes a single action in the battle
 * This is pure battle logic - no AI, no side effects
 */
export function executeBattleAction(
  state: BattleState,
  action: SkillType,
  config: Partial<BattleConfig> = {}
): BattleState {
  if (state.gameOver) {
    return state;
  }

  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const newState = {
    ...state,
    attacker: { ...state.attacker },
    defender: { ...state.defender },
    log: [...state.log],
  };

  const activeUnit =
    newState.currentTurn === 'attacker' ? newState.attacker : newState.defender;
  const targetUnit =
    newState.currentTurn === 'attacker' ? newState.defender : newState.attacker;

  switch (action) {
    case 'skip':
      newState.log.push(`${activeUnit.name} skipped their turn.`);
      activeUnit.isDefending = false;
      break;

    case 'attack': {
      let damage = fullConfig.attackDamage;
      if (targetUnit.isDefending) {
        damage = Math.floor(damage * fullConfig.defendDamageReduction);
        newState.log.push(
          `${activeUnit.name} attacks! ${targetUnit.name} defends and takes ${damage} damage.`
        );
        targetUnit.isDefending = false;
      } else {
        newState.log.push(
          `${activeUnit.name} attacks ${targetUnit.name} for ${damage} damage!`
        );
      }
      targetUnit.health = Math.max(0, targetUnit.health - damage);
      activeUnit.isDefending = false;
      break;
    }

    case 'defend':
      activeUnit.isDefending = true;
      newState.log.push(`${activeUnit.name} takes a defensive stance.`);
      break;
  }

  // Check for game over
  if (newState.attacker.health <= 0) {
    newState.gameOver = true;
    newState.winner = 'defender';
    newState.log.push(`Game Over! ${newState.defender.name} wins!`);
  } else if (newState.defender.health <= 0) {
    newState.gameOver = true;
    newState.winner = 'attacker';
    newState.log.push(`Game Over! ${newState.attacker.name} wins!`);
  } else {
    // Switch turns
    newState.currentTurn =
      newState.currentTurn === 'attacker' ? 'defender' : 'attacker';
  }

  return newState;
}

/**
 * Gets the current active unit
 */
export function getActiveUnit(state: BattleState): Unit {
  return state.currentTurn === 'attacker' ? state.attacker : state.defender;
}

/**
 * Gets the current target unit
 */
export function getTargetUnit(state: BattleState): Unit {
  return state.currentTurn === 'attacker' ? state.defender : state.attacker;
}
