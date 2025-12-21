import { SkillType } from './types.js';

/**
 * Simple AI that randomly chooses between attack and defend
 */
export function getSkeletonAction(): SkillType {
  const actions: SkillType[] = ['attack', 'defend'];
  const randomIndex = Math.floor(Math.random() * actions.length);
  return actions[randomIndex];
}
