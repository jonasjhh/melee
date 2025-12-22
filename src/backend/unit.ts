import { Unit } from './types.js';
import { DEFAULT_SKILLS } from './skillDefinitions.js';

export function createHero(): Unit {
  return {
    id: 'hero',
    name: 'Hero',
    health: 100,
    maxHealth: 100,
    power: 20,
    defense: 5,
    initiative: 10,
    position: { row: 0, col: 0 }, // Default, will be set when placed
    team: 'player',
    skills: [...DEFAULT_SKILLS],
    buffs: [],
  };
}

export function createSkeleton(): Unit {
  return {
    id: 'skeleton',
    name: 'Skeleton',
    health: 80,
    maxHealth: 80,
    power: 15,
    defense: 3,
    initiative: 8,
    position: { row: 2, col: 0 }, // Default
    team: 'enemy',
    skills: [...DEFAULT_SKILLS],
    buffs: [],
  };
}
