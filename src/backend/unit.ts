import { Unit } from './types.js';
import { DEFAULT_SKILLS } from './skills.js';

export function createHero(): Unit {
  return {
    id: 'hero',
    name: 'Hero',
    health: 100,
    maxHealth: 100,
    isDefending: false,
    skills: [...DEFAULT_SKILLS],
  };
}

export function createSkeleton(): Unit {
  return {
    id: 'skeleton',
    name: 'Skeleton',
    health: 80,
    maxHealth: 80,
    isDefending: false,
    skills: [...DEFAULT_SKILLS],
  };
}
