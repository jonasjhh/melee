import { describe, it, expect } from 'vitest';
import { createHero, createSkeleton } from '../../backend/models/unit';
import { isDefending } from '../../backend/systems/buffSystem';

describe('Unit Creation', () => {
  it('should create a hero with correct properties', () => {
    const hero = createHero();

    expect(hero.id).toBe('hero');
    expect(hero.name).toBe('Hero');
    expect(hero.health).toBe(100);
    expect(hero.maxHealth).toBe(100);
    expect(isDefending(hero)).toBe(false);
    expect(hero.skills).toHaveLength(4); // DEFAULT_SKILLS has 4 skills
  });

  it('should create a skeleton with correct properties', () => {
    const skeleton = createSkeleton();

    expect(skeleton.id).toBe('skeleton');
    expect(skeleton.name).toBe('Skeleton');
    expect(skeleton.health).toBe(80);
    expect(skeleton.maxHealth).toBe(80);
    expect(isDefending(skeleton)).toBe(false);
    expect(skeleton.skills).toHaveLength(4); // DEFAULT_SKILLS has 4 skills
  });

  it('should have attack, defend, and skip skills', () => {
    const hero = createHero();
    const skillTypes = hero.skills.map(s => s.type);

    expect(skillTypes).toContain('attack');
    expect(skillTypes).toContain('defend');
    expect(skillTypes).toContain('skip');
  });
});
