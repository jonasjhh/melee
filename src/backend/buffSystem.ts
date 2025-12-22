import { Unit, Buff, BuffType } from './types.js';

/**
 * Apply a buff to a unit
 */
export function applyBuff(
  unit: Unit,
  type: BuffType,
  duration: number,
  value: number,
  source?: string
): Unit {
  // Check if buff of same type already exists
  const existingBuffIndex = unit.buffs.findIndex(b => b.type === type);

  if (existingBuffIndex !== -1) {
    // Refresh/stack the buff (replace with new duration if longer)
    const existingBuff = unit.buffs[existingBuffIndex];
    const newBuffs = [...unit.buffs];
    newBuffs[existingBuffIndex] = {
      ...existingBuff,
      duration: Math.max(existingBuff.duration, duration),
      value: Math.max(existingBuff.value, value),
      source,
    };
    return { ...unit, buffs: newBuffs };
  }

  // Add new buff
  const newBuff: Buff = { type, duration, value, source };
  return { ...unit, buffs: [...unit.buffs, newBuff] };
}

/**
 * Remove a buff from a unit by type
 */
export function removeBuff(unit: Unit, type: BuffType): Unit {
  return {
    ...unit,
    buffs: unit.buffs.filter(b => b.type !== type),
  };
}

/**
 * Decrease all buff durations by 1 and remove expired buffs
 */
export function decrementBuffDurations(unit: Unit): Unit {
  const updatedBuffs = unit.buffs
    .map(buff => ({ ...buff, duration: buff.duration - 1 }))
    .filter(buff => buff.duration > 0);

  return { ...unit, buffs: updatedBuffs };
}

/**
 * Get the total value of a specific buff type on a unit
 */
export function getBuffValue(unit: Unit, type: BuffType): number {
  return unit.buffs
    .filter(b => b.type === type)
    .reduce((total, buff) => total + buff.value, 0);
}

/**
 * Check if unit has a specific buff
 */
export function hasBuff(unit: Unit, type: BuffType): boolean {
  return unit.buffs.some(b => b.type === type);
}

/**
 * Get effective power including bless buffs
 */
export function getEffectivePower(unit: Unit): number {
  return unit.power + getBuffValue(unit, 'bless');
}

/**
 * Get effective initiative including haste buffs
 */
export function getEffectiveInitiative(unit: Unit): number {
  return unit.initiative + getBuffValue(unit, 'haste');
}

/**
 * Check if unit is defending (from defend buff or defending status)
 */
export function isDefending(unit: Unit): boolean {
  return hasBuff(unit, 'defending');
}

/**
 * Apply regen healing to a unit
 * Returns the unit with updated health and a log message if healing occurred
 */
export function applyRegenHealing(unit: Unit): { unit: Unit; healingDone: number } {
  const regenValue = getBuffValue(unit, 'regen');

  if (regenValue === 0 || unit.health === unit.maxHealth) {
    return { unit, healingDone: 0 };
  }

  const actualHealing = Math.min(regenValue, unit.maxHealth - unit.health);
  const healedUnit = { ...unit, health: unit.health + actualHealing };

  return { unit: healedUnit, healingDone: actualHealing };
}
