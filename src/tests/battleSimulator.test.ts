import { describe, it, expect } from 'vitest';
import { createBattle, executeBattleAction } from '../backend/battleSimulator';
import { createHero, createSkeleton } from '../backend/unit';

describe('Battle Simulator', () => {
  it('should create a battle with two units', () => {
    const hero = createHero();
    const skeleton = createSkeleton();
    const battle = createBattle(hero, skeleton);

    expect(battle.attacker.name).toBe('Hero');
    expect(battle.defender.name).toBe('Skeleton');
    expect(battle.currentTurn).toBe('attacker');
    expect(battle.gameOver).toBe(false);
  });

  it('should execute attack action', () => {
    const hero = createHero();
    const skeleton = createSkeleton();
    const battle = createBattle(hero, skeleton);

    const newBattle = executeBattleAction(battle, 'attack');

    expect(newBattle.defender.health).toBeLessThan(skeleton.health);
    expect(newBattle.currentTurn).toBe('defender');
  });

  it('should execute defend action', () => {
    const hero = createHero();
    const skeleton = createSkeleton();
    const battle = createBattle(hero, skeleton);

    const newBattle = executeBattleAction(battle, 'defend');

    expect(newBattle.attacker.isDefending).toBe(true);
  });

  it('should execute skip action', () => {
    const hero = createHero();
    const skeleton = createSkeleton();
    const battle = createBattle(hero, skeleton);
    const initialDefenderHealth = skeleton.health;

    const newBattle = executeBattleAction(battle, 'skip');

    expect(newBattle.defender.health).toBe(initialDefenderHealth);
    expect(newBattle.currentTurn).toBe('defender');
  });

  it('should end battle when attacker wins', () => {
    const hero = createHero();
    const skeleton = createSkeleton();
    const battle = createBattle(hero, skeleton);

    // Reduce defender health to 0
    battle.defender.health = 10;

    const newBattle = executeBattleAction(battle, 'attack');

    expect(newBattle.gameOver).toBe(true);
    expect(newBattle.winner).toBe('attacker');
  });

  it('should end battle when defender wins', () => {
    const hero = createHero();
    const skeleton = createSkeleton();
    let battle = createBattle(hero, skeleton);

    // Switch to defender's turn and reduce attacker health
    battle.currentTurn = 'defender';
    battle.attacker.health = 10;

    battle = executeBattleAction(battle, 'attack');

    expect(battle.gameOver).toBe(true);
    expect(battle.winner).toBe('defender');
  });

  it('should not allow actions after game over', () => {
    const hero = createHero();
    const skeleton = createSkeleton();
    let battle = createBattle(hero, skeleton);

    battle.defender.health = 10;
    battle = executeBattleAction(battle, 'attack');

    expect(battle.gameOver).toBe(true);

    const unchangedBattle = executeBattleAction(battle, 'attack');
    expect(unchangedBattle).toEqual(battle);
  });
});
