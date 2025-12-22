import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePartyGrid } from '../../../frontend/hooks/usePartyGrid';
import { CHARACTER_TEMPLATES } from '../../../backend/models/characterModel';

describe('usePartyGrid', () => {
  describe('placeUnit', () => {
    it('should place a unit in the grid', () => {
      const { result } = renderHook(() => usePartyGrid());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;

      act(() => {
        result.current.placeUnit(0, 0, 'player', warrior);
      });

      expect(result.current.playerGrid['0-0']).toBe(warrior);
    });

    it('should place units in different teams independently', () => {
      const { result } = renderHook(() => usePartyGrid());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;
      const skeleton = CHARACTER_TEMPLATES.SKELETON;

      act(() => {
        result.current.placeUnit(0, 0, 'player', warrior);
        result.current.placeUnit(0, 0, 'enemy', skeleton);
      });

      expect(result.current.playerGrid['0-0']).toBe(warrior);
      expect(result.current.enemyGrid['0-0']).toBe(skeleton);
    });
  });

  describe('removeUnit', () => {
    it('should remove a unit from the grid', () => {
      const { result } = renderHook(() => usePartyGrid());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;

      act(() => {
        result.current.placeUnit(0, 0, 'player', warrior);
      });

      expect(result.current.playerGrid['0-0']).toBe(warrior);

      act(() => {
        result.current.removeUnit(0, 0, 'player');
      });

      expect(result.current.playerGrid['0-0']).toBeUndefined();
    });
  });

  describe('moveUnit', () => {
    it('should move a unit within the same team', () => {
      const { result } = renderHook(() => usePartyGrid());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;

      act(() => {
        result.current.placeUnit(0, 0, 'player', warrior);
      });

      act(() => {
        result.current.moveUnit(0, 0, 'player', 1, 1, 'player');
      });

      expect(result.current.playerGrid['0-0']).toBeUndefined();
      expect(result.current.playerGrid['1-1']).toBe(warrior);
    });

    it('should move a unit across teams', () => {
      const { result } = renderHook(() => usePartyGrid());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;

      act(() => {
        result.current.placeUnit(0, 0, 'player', warrior);
      });

      act(() => {
        result.current.moveUnit(0, 0, 'player', 1, 1, 'enemy');
      });

      expect(result.current.playerGrid['0-0']).toBeUndefined();
      expect(result.current.enemyGrid['1-1']).toBe(warrior);
    });

    it('should do nothing when moving to the same cell', () => {
      const { result} = renderHook(() => usePartyGrid());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;

      act(() => {
        result.current.placeUnit(0, 0, 'player', warrior);
      });

      act(() => {
        result.current.moveUnit(0, 0, 'player', 0, 0, 'player');
      });

      expect(result.current.playerGrid['0-0']).toBe(warrior);
    });
  });

  describe('clearGrid', () => {
    it('should clear all units from player grid', () => {
      const { result } = renderHook(() => usePartyGrid());

      act(() => {
        result.current.placeUnit(0, 0, 'player', CHARACTER_TEMPLATES.WARRIOR);
      });

      act(() => {
        result.current.placeUnit(1, 1, 'player', CHARACTER_TEMPLATES.CLERIC);
      });

      expect(Object.keys(result.current.playerGrid).length).toBe(2);

      act(() => {
        result.current.clearGrid('player');
      });

      expect(Object.keys(result.current.playerGrid).length).toBe(0);
    });

    it('should clear all units from enemy grid', () => {
      const { result } = renderHook(() => usePartyGrid());

      act(() => {
        result.current.placeUnit(0, 0, 'enemy', CHARACTER_TEMPLATES.SKELETON);
      });

      act(() => {
        result.current.placeUnit(1, 1, 'enemy', CHARACTER_TEMPLATES.ORC);
      });

      expect(Object.keys(result.current.enemyGrid).length).toBe(2);

      act(() => {
        result.current.clearGrid('enemy');
      });

      expect(Object.keys(result.current.enemyGrid).length).toBe(0);
    });
  });

  describe('getPlayerModels', () => {
    it('should return all player character models', () => {
      const { result } = renderHook(() => usePartyGrid());

      act(() => {
        result.current.placeUnit(0, 0, 'player', CHARACTER_TEMPLATES.WARRIOR);
      });

      act(() => {
        result.current.placeUnit(1, 1, 'player', CHARACTER_TEMPLATES.CLERIC);
      });

      const models = result.current.getPlayerModels();
      expect(models.length).toBe(2);
      expect(models).toContain(CHARACTER_TEMPLATES.WARRIOR);
      expect(models).toContain(CHARACTER_TEMPLATES.CLERIC);
    });

    it('should return empty array when no units are placed', () => {
      const { result } = renderHook(() => usePartyGrid());

      const models = result.current.getPlayerModels();
      expect(models.length).toBe(0);
    });
  });

  describe('getEnemyModels', () => {
    it('should return all enemy character models', () => {
      const { result } = renderHook(() => usePartyGrid());

      act(() => {
        result.current.placeUnit(0, 0, 'enemy', CHARACTER_TEMPLATES.SKELETON);
      });

      act(() => {
        result.current.placeUnit(1, 1, 'enemy', CHARACTER_TEMPLATES.ORC);
      });

      const models = result.current.getEnemyModels();
      expect(models.length).toBe(2);
      expect(models).toContain(CHARACTER_TEMPLATES.SKELETON);
      expect(models).toContain(CHARACTER_TEMPLATES.ORC);
    });
  });
});
