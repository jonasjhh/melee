import { GameState, ActionCommand } from '../core/types.js';
import { getTeamUnits } from '../systems/gridSystem.js';
import { getActiveUnit, advanceTurn } from '../systems/initiativeSystem.js';
import { getEffectivePower, isDefending, applyBuff, removeBuff, applyRegenHealing, decrementBuffDurations } from '../systems/buffSystem.js';

export interface BattleConfig {
  attackDamage: number;
  defendDamageReduction: number;
}

/**
 * Calculate damage based on power, defense, and defending status
 */
function calculateDamage(power: number, defense: number, hasDefendingBuff: boolean): number {
  const baseDamage = Math.max(1, power - defense);
  return hasDefendingBuff ? Math.ceil(baseDamage / 2) : baseDamage;
}

/**
 * Executes a single action in the battle
 * This is pure battle logic - no AI, no side effects
 */
export function executeBattleAction(
  state: GameState,
  command: ActionCommand,
  _config: Partial<BattleConfig> = {}
): GameState {
  if (state.gameOver) return state;

  const activeUnitId = getActiveUnit(state.turnOrder);
  let activeUnit = state.grid.units.get(activeUnitId);
  if (!activeUnit) return state;

  const newState = { ...state, log: [...state.log] };

  // Apply regen healing and decrement buff durations at START of turn
  const { unit: regenHealedUnit, healingDone } = applyRegenHealing(activeUnit);
  if (healingDone > 0) {
    newState.log.push(`${regenHealedUnit.name} regenerates ${healingDone} HP.`);
  }

  // Decrement buff durations
  activeUnit = decrementBuffDurations(regenHealedUnit);
  newState.grid.units.set(activeUnitId, activeUnit);

  switch (command.skill) {
    case 'attack': {
      const targetId = command.targets[0];
      const target = newState.grid.units.get(targetId);
      if (!target) break;

      const effectivePower = getEffectivePower(activeUnit);
      const damage = calculateDamage(effectivePower, target.defense, isDefending(target));

      // Remove defending buff after being hit
      let updatedTarget = { ...target, health: Math.max(0, target.health - damage) };
      if (isDefending(target)) {
        updatedTarget = removeBuff(updatedTarget, 'defending');
      }

      newState.grid.units.set(targetId, updatedTarget);

      if (isDefending(target)) {
        newState.log.push(
          `${activeUnit.name} attacks! ${updatedTarget.name} defends and takes ${damage} damage.`
        );
      } else {
        newState.log.push(
          `${activeUnit.name} attacks ${updatedTarget.name} for ${damage} damage!`
        );
      }

      // Check death
      if (updatedTarget.health === 0) {
        newState.log.push(`${updatedTarget.name} has been defeated!`);
      }
      break;
    }

    case 'defend': {
      const buffedUnit = applyBuff(activeUnit, 'defending', 1, 0);
      newState.grid.units.set(activeUnitId, buffedUnit);
      newState.log.push(`${activeUnit.name} takes a defensive stance.`);
      break;
    }

    case 'heal': {
      const targetId = command.targets[0];
      const target = newState.grid.units.get(targetId);
      if (!target) break;

      const healAmount = 30;
      const actualHeal = Math.min(healAmount, target.maxHealth - target.health);

      const healedTarget = { ...target, health: target.health + actualHeal };
      newState.grid.units.set(targetId, healedTarget);

      newState.log.push(
        `${activeUnit.name} heals ${target.name} for ${actualHeal} HP!`
      );
      break;
    }

    case 'bolt': {
      const targetId = command.targets[0];
      const target = newState.grid.units.get(targetId);
      if (!target) break;

      const effectivePower = getEffectivePower(activeUnit);
      const baseDamage = Math.max(1, effectivePower - target.defense);
      const damage = Math.floor(baseDamage * 0.8); // 0.8x damage multiplier

      // Remove defending buff after being hit
      let updatedTarget = { ...target, health: Math.max(0, target.health - damage) };
      if (isDefending(target)) {
        updatedTarget = removeBuff(updatedTarget, 'defending');
      }

      newState.grid.units.set(targetId, updatedTarget);

      newState.log.push(
        `${activeUnit.name} casts Bolt at ${updatedTarget.name} for ${damage} damage!`
      );

      // Check death
      if (updatedTarget.health === 0) {
        newState.log.push(`${updatedTarget.name} has been defeated!`);
      }
      break;
    }

    case 'leech': {
      const targetId = command.targets[0];
      const target = newState.grid.units.get(targetId);
      if (!target) break;

      const effectivePower = getEffectivePower(activeUnit);
      const baseDamage = Math.max(1, effectivePower - target.defense);
      const damage = Math.floor(baseDamage * 0.7); // 0.7x damage multiplier

      // Apply damage to target
      let updatedTarget = { ...target, health: Math.max(0, target.health - damage) };
      if (isDefending(target)) {
        updatedTarget = removeBuff(updatedTarget, 'defending');
      }
      newState.grid.units.set(targetId, updatedTarget);

      // Heal self for 50% of damage dealt
      const healAmount = Math.floor(damage * 0.5);
      const actualHeal = Math.min(healAmount, activeUnit.maxHealth - activeUnit.health);
      const healedActiveUnit = { ...activeUnit, health: activeUnit.health + actualHeal };
      newState.grid.units.set(activeUnitId, healedActiveUnit);

      newState.log.push(
        `${activeUnit.name} leeches ${updatedTarget.name} for ${damage} damage and heals ${actualHeal} HP!`
      );

      // Check death
      if (updatedTarget.health === 0) {
        newState.log.push(`${updatedTarget.name} has been defeated!`);
      }
      break;
    }

    case 'haste': {
      const targetId = command.targets[0];
      const target = newState.grid.units.get(targetId);
      if (!target) break;

      const buffedTarget = applyBuff(target, 'haste', 5, 10);
      newState.grid.units.set(targetId, buffedTarget);
      newState.log.push(`${activeUnit.name} casts Haste on ${target.name}!`);
      break;
    }

    case 'bless': {
      const targetId = command.targets[0];
      const target = newState.grid.units.get(targetId);
      if (!target) break;

      const buffedTarget = applyBuff(target, 'bless', 5, 10);
      newState.grid.units.set(targetId, buffedTarget);
      newState.log.push(`${activeUnit.name} casts Bless on ${target.name}!`);
      break;
    }

    case 'regen': {
      const targetId = command.targets[0];
      const target = newState.grid.units.get(targetId);
      if (!target) break;

      const buffedTarget = applyBuff(target, 'regen', 5, 5);
      newState.grid.units.set(targetId, buffedTarget);
      newState.log.push(`${activeUnit.name} casts Regen on ${target.name}!`);
      break;
    }

    case 'skip': {
      newState.log.push(`${activeUnit.name} skips their turn.`);
      break;
    }
  }

  // Check win condition
  const playerUnits = getTeamUnits(newState.grid, 'player').filter(u => u.health > 0);
  const enemyUnits = getTeamUnits(newState.grid, 'enemy').filter(u => u.health > 0);

  if (playerUnits.length === 0) {
    newState.gameOver = true;
    newState.winner = 'enemy';
    newState.log.push('Game Over! Enemy team wins!');
  } else if (enemyUnits.length === 0) {
    newState.gameOver = true;
    newState.winner = 'player';
    newState.log.push('Game Over! Player team wins!');
  }

  // Advance turn
  if (!newState.gameOver) {
    newState.turnOrder = advanceTurn(newState.turnOrder, newState.grid);
  }

  return newState;
}
