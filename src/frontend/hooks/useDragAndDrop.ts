import { useState } from 'react';
import { CharacterModel } from '../../backend/core/types';
import { DragState } from '../models/types';

export interface UseDragAndDropReturn {
  draggedTemplate: CharacterModel | null;
  draggedFrom: DragState['from'];
  startDragFromTemplate: (model: CharacterModel, e: React.DragEvent) => void;
  startDragFromGrid: (
    row: number,
    col: number,
    team: 'player' | 'enemy',
    unit: CharacterModel,
    e: React.DragEvent
  ) => void;
  endDrag: () => void;
  isDragging: (row: number, col: number, team: 'player' | 'enemy') => boolean;
}

export function useDragAndDrop(): UseDragAndDropReturn {
  const [draggedTemplate, setDraggedTemplate] = useState<CharacterModel | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<DragState['from']>(null);

  const startDragFromTemplate = (model: CharacterModel, e: React.DragEvent) => {
    setDraggedTemplate(model);
    setDraggedFrom(null);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const startDragFromGrid = (
    row: number,
    col: number,
    team: 'player' | 'enemy',
    unit: CharacterModel,
    e: React.DragEvent
  ) => {
    setDraggedTemplate(unit);
    setDraggedFrom({ team, row, col });
    e.dataTransfer.effectAllowed = 'move';
  };

  const endDrag = () => {
    setDraggedTemplate(null);
    setDraggedFrom(null);
  };

  const isDragging = (row: number, col: number, team: 'player' | 'enemy'): boolean => {
    return draggedFrom?.team === team && draggedFrom.row === row && draggedFrom.col === col;
  };

  return {
    draggedTemplate,
    draggedFrom,
    startDragFromTemplate,
    startDragFromGrid,
    endDrag,
    isDragging,
  };
}
