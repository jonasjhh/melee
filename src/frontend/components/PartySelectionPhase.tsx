import { CHARACTER_TEMPLATES } from '../../backend/models/characterModel';
import { CharacterModel } from '../../backend/core/types';
import { PartyGrid } from '../models/types';
import { CharacterCard } from './CharacterCard';
import { PlacementGrid } from './PlacementGrid';

interface PartySelectionPhaseProps {
  playerGrid: PartyGrid;
  enemyGrid: PartyGrid;
  draggedTemplate: CharacterModel | null;
  onClearGrid: (team: 'player' | 'enemy') => void;
  onStartBattle: () => void;
  onDragStart: (template: CharacterModel, e: React.DragEvent) => void;
  onDragStartFromGrid: (row: number, col: number, team: 'player' | 'enemy', e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (row: number, col: number, team: 'player' | 'enemy', e: React.DragEvent) => void;
  isDragging: (row: number, col: number, team: 'player' | 'enemy') => boolean;
}

export function PartySelectionPhase({
  playerGrid,
  enemyGrid,
  draggedTemplate,
  onClearGrid,
  onStartBattle,
  onDragStart,
  onDragStartFromGrid,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
}: PartySelectionPhaseProps) {
  const availableTemplates = Object.values(CHARACTER_TEMPLATES);
  const playerCount = Object.values(playerGrid).filter((m) => m !== null).length;
  const enemyCount = Object.values(enemyGrid).filter((m) => m !== null).length;

  return (
    <div className="app">
      <h1>Melee Combat - Party Selection</h1>

      <div className="party-selection">
        <div className="character-templates">
          <h2>Available Characters</h2>
          <p className="placement-instruction">
            Drag characters to the grid to place them. Drag placed units to move them.
          </p>
          <div className="template-grid">
            {availableTemplates.map((template) => (
              <CharacterCard
                key={template.id}
                template={template}
                onDragStart={(e) => onDragStart(template, e)}
                onDragEnd={onDragEnd}
              />
            ))}
          </div>
        </div>

        <div className="selected-parties">
          <div className="party-display player-party-display">
            <div className="party-header">
              <h2>Player Party ({playerCount}/4)</h2>
              <button onClick={() => onClearGrid('player')} className="clear-button">
                Clear
              </button>
            </div>
            <PlacementGrid
              grid={playerGrid}
              team="player"
              draggedTemplate={draggedTemplate}
              onDragOver={onDragOver}
              onDrop={(row, col, e) => onDrop(row, col, 'player', e)}
              onDragStartFromGrid={(row, col, e) => onDragStartFromGrid(row, col, 'player', e)}
              onDragEnd={onDragEnd}
              isDragging={(row, col) => isDragging(row, col, 'player')}
            />
          </div>

          <div className="party-display enemy-party-display">
            <div className="party-header">
              <h2>Enemy Party ({enemyCount}/4)</h2>
              <button onClick={() => onClearGrid('enemy')} className="clear-button">
                Clear
              </button>
            </div>
            <PlacementGrid
              grid={enemyGrid}
              team="enemy"
              draggedTemplate={draggedTemplate}
              onDragOver={onDragOver}
              onDrop={(row, col, e) => onDrop(row, col, 'enemy', e)}
              onDragStartFromGrid={(row, col, e) => onDragStartFromGrid(row, col, 'enemy', e)}
              onDragEnd={onDragEnd}
              isDragging={(row, col) => isDragging(row, col, 'enemy')}
            />
          </div>
        </div>

        <button
          onClick={onStartBattle}
          disabled={playerCount === 0 || enemyCount === 0}
          className="start-battle-button"
        >
          Start Battle
        </button>
      </div>
    </div>
  );
}
