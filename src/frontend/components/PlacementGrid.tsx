import { CharacterModel } from '../../backend/core/types';
import { PartyGrid } from '../models/types';

interface PlacementGridProps {
  grid: PartyGrid;
  team: 'player' | 'enemy';
  draggedTemplate: CharacterModel | null;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (row: number, col: number, e: React.DragEvent) => void;
  onDragStartFromGrid: (row: number, col: number, e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: (row: number, col: number) => boolean;
}

export function PlacementGrid({
  grid,
  team,
  draggedTemplate,
  onDragOver,
  onDrop,
  onDragStartFromGrid,
  onDragEnd,
  isDragging,
}: PlacementGridProps) {
  const rowLabels = ['Row 1', 'Row 2', 'Row 3', 'Row 4'];
  const isPlayerTeam = team === 'player';

  return (
    <div className="placement-grid">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="placement-row">
          {[0, 1].map((localCol) => {
            // Map to actual grid columns: player uses 0-1, enemy uses 2-3
            const actualCol = isPlayerTeam ? localCol : localCol + 2;
            const key = `${row}-${actualCol}`;
            const unit = grid[key];
            const isDraggingThis = isDragging(row, actualCol);

            // Determine if this is front or back based on team
            // For player: col 1 is front (right), col 0 is back (left)
            // For enemy: col 3 is front (right), col 2 is back (left)
            const isFront = isPlayerTeam ? actualCol === 1 : actualCol === 3;
            const positionLabel = isFront ? 'Front' : 'Back';

            return (
              <div
                key={key}
                className={`placement-cell ${unit ? 'occupied' : ''} ${isDraggingThis ? 'dragging' : ''}`}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(row, actualCol, e)}
              >
                {unit ? (
                  <div
                    className="placed-unit"
                    draggable
                    onDragStart={(e) => onDragStartFromGrid(row, actualCol, e)}
                    onDragEnd={onDragEnd}
                  >
                    <div className="unit-name">{unit.name}</div>
                    <div className="unit-mini-stats">
                      HP: {unit.maxHealth} | PWR: {unit.power}
                    </div>
                  </div>
                ) : (
                  <div className="empty-slot">
                    {draggedTemplate ? 'Drop here' : `${rowLabels[row]} ${positionLabel}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
