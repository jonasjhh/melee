import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../../../frontend/hooks/useDragAndDrop';
import { CHARACTER_TEMPLATES } from '../../../backend/models/characterModel';

describe('useDragAndDrop', () => {
  describe('startDragFromTemplate', () => {
    it('should set draggedTemplate and clear draggedFrom', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;
      const mockEvent = {
        dataTransfer: { effectAllowed: '' },
      } as React.DragEvent;

      act(() => {
        result.current.startDragFromTemplate(warrior, mockEvent);
      });

      expect(result.current.draggedTemplate).toBe(warrior);
      expect(result.current.draggedFrom).toBeNull();
      expect(mockEvent.dataTransfer.effectAllowed).toBe('copy');
    });
  });

  describe('startDragFromGrid', () => {
    it('should set both draggedTemplate and draggedFrom', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;
      const mockEvent = {
        dataTransfer: { effectAllowed: '' },
      } as React.DragEvent;

      act(() => {
        result.current.startDragFromGrid(2, 1, 'player', warrior, mockEvent);
      });

      expect(result.current.draggedTemplate).toBe(warrior);
      expect(result.current.draggedFrom).toEqual({ team: 'player', row: 2, col: 1 });
      expect(mockEvent.dataTransfer.effectAllowed).toBe('move');
    });
  });

  describe('endDrag', () => {
    it('should clear both draggedTemplate and draggedFrom', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;
      const mockEvent = {
        dataTransfer: { effectAllowed: '' },
      } as React.DragEvent;

      act(() => {
        result.current.startDragFromGrid(2, 1, 'player', warrior, mockEvent);
      });

      expect(result.current.draggedTemplate).toBe(warrior);
      expect(result.current.draggedFrom).toEqual({ team: 'player', row: 2, col: 1 });

      act(() => {
        result.current.endDrag();
      });

      expect(result.current.draggedTemplate).toBeNull();
      expect(result.current.draggedFrom).toBeNull();
    });
  });

  describe('isDragging', () => {
    it('should return true when dragging from the specified position', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;
      const mockEvent = {
        dataTransfer: { effectAllowed: '' },
      } as React.DragEvent;

      act(() => {
        result.current.startDragFromGrid(2, 1, 'player', warrior, mockEvent);
      });

      expect(result.current.isDragging(2, 1, 'player')).toBe(true);
    });

    it('should return false when not dragging from the specified position', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const warrior = CHARACTER_TEMPLATES.WARRIOR;
      const mockEvent = {
        dataTransfer: { effectAllowed: '' },
      } as React.DragEvent;

      act(() => {
        result.current.startDragFromGrid(2, 1, 'player', warrior, mockEvent);
      });

      expect(result.current.isDragging(0, 0, 'player')).toBe(false);
      expect(result.current.isDragging(2, 1, 'enemy')).toBe(false);
    });

    it('should return false when not dragging at all', () => {
      const { result } = renderHook(() => useDragAndDrop());

      expect(result.current.isDragging(0, 0, 'player')).toBe(false);
    });
  });
});
