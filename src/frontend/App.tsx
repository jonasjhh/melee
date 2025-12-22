import { useState, useEffect } from 'react';
import { GameState, Skill, ActionCommand } from '../backend/core/types';
import { IGameService } from '../backend/core/gameService';
import { InBrowserGameService } from '../backend/services/inBrowserGameService';
import { getValidTargets } from '../backend/systems/targetingSystem';
import { getActiveUnit } from '../backend/systems/initiativeSystem';
import { GamePhase } from './models/types';
import { usePartyGrid } from './hooks/usePartyGrid';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { PartySelectionPhase } from './components/PartySelectionPhase';
import { BattlePhase } from './components/BattlePhase';
import './App.css';

// Initialize game service - can easily be swapped to ApiGameService later
const gameService: IGameService = new InBrowserGameService();

interface TargetingState {
  skill: Skill;
  selectedTargets: string[];
  currentStep: number;
}

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('party-selection');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetingState, setTargetingState] = useState<TargetingState | null>(null);

  const partyGrid = usePartyGrid();
  const dragAndDrop = useDragAndDrop();

  useEffect(() => {
    const init = async () => {
      if (gamePhase === 'battle' && !gameState) {
        try {
          const playerPositionedModels = partyGrid.getPlayerPositionedModels();
          const enemyPositionedModels = partyGrid.getEnemyPositionedModels();

          if (playerPositionedModels.length > 0 && enemyPositionedModels.length > 0) {
            (gameService as InBrowserGameService).setPositionedParties(playerPositionedModels, enemyPositionedModels);
          }

          const state = await gameService.newGame();
          setGameState(state);
          setError(null);
        } catch (err) {
          setError('Failed to initialize game');
          console.error('Failed to fetch game state:', err);
        }
      }
    };

    init();
  }, [gamePhase, gameState, partyGrid]);

  const startNewGame = async () => {
    setLoading(true);
    setError(null);
    setTargetingState(null);
    try {
      const state = await gameService.newGame();
      setGameState(state);
    } catch (err) {
      setError('Failed to start new game');
      console.error('Failed to start new game:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragAndDrop.draggedFrom ? 'move' : 'copy';
  };

  const handleDrop = (row: number, col: number, team: 'player' | 'enemy', e: React.DragEvent) => {
    e.preventDefault();

    if (!dragAndDrop.draggedTemplate) return;

    if (dragAndDrop.draggedFrom) {
      // Moving from grid
      partyGrid.moveUnit(
        dragAndDrop.draggedFrom.row,
        dragAndDrop.draggedFrom.col,
        dragAndDrop.draggedFrom.team,
        row,
        col,
        team
      );
    } else {
      // Placing from template list
      partyGrid.placeUnit(row, col, team, dragAndDrop.draggedTemplate);
    }

    dragAndDrop.endDrag();
  };

  const handleDragStartFromGrid = (row: number, col: number, team: 'player' | 'enemy', e: React.DragEvent) => {
    const key = `${row}-${col}`;
    const grid = team === 'player' ? partyGrid.playerGrid : partyGrid.enemyGrid;
    const unit = grid[key];

    if (unit) {
      dragAndDrop.startDragFromGrid(row, col, team, unit, e);
    }
  };

  const handleStartBattle = () => {
    const playerCount = partyGrid.getPlayerModels().length;
    const enemyCount = partyGrid.getEnemyModels().length;

    if (playerCount > 0 && enemyCount > 0) {
      setGamePhase('battle');
    }
  };

  const handleBackToPartySelection = () => {
    setGamePhase('party-selection');
    setGameState(null);
    setTargetingState(null);
  };

  const handleSkillClick = (skill: Skill) => {
    if (!gameState || gameState.gameOver || loading) return;

    const activeUnitId = getActiveUnit(gameState.turnOrder);
    if (!gameState.playerControlledUnits.has(activeUnitId)) {
      return;
    }

    // Auto-execute if no targeting needed
    if (skill.targeting.length === 0) {
      performAction({ skill: skill.type, targets: [] });
      return;
    }

    // Enter targeting mode
    setTargetingState({
      skill,
      selectedTargets: [],
      currentStep: 0,
    });
  };

  const handleUnitClick = (unitId: string) => {
    if (!targetingState || !gameState) return;

    const { skill, selectedTargets, currentStep } = targetingState;
    const requirement = skill.targeting[currentStep];

    const activeUnitId = getActiveUnit(gameState.turnOrder);

    // Validate this is a valid target
    const validTargets = getValidTargets(gameState, activeUnitId, requirement);

    if (!validTargets.some((u) => u.id === unitId)) return;

    const newTargets = [...selectedTargets, unitId];
    const newStep = currentStep + 1;

    // Check if we've completed all targeting steps
    if (newStep >= skill.targeting.length) {
      // Execute!
      performAction({ skill: skill.type, targets: newTargets });
      setTargetingState(null);
    } else {
      // Move to next targeting step
      setTargetingState({
        skill,
        selectedTargets: newTargets,
        currentStep: newStep,
      });
    }
  };

  const performAction = async (command: ActionCommand) => {
    if (!gameState || gameState.gameOver || loading) return;

    setLoading(true);
    setError(null);
    try {
      const state = await gameService.performAction(command);
      setGameState(state);
    } catch (err) {
      setError('Failed to perform action');
      console.error('Failed to perform action:', err);
    } finally {
      setLoading(false);
    }
  };

  const isValidTarget = (unitId: string): boolean => {
    if (!targetingState || !gameState) return false;
    const activeUnitId = getActiveUnit(gameState.turnOrder);
    const requirement = targetingState.skill.targeting[targetingState.currentStep];
    const validTargets = getValidTargets(gameState, activeUnitId, requirement);
    return validTargets.some((u) => u.id === unitId);
  };

  if (error && gamePhase === 'battle') {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => setGamePhase('party-selection')}>Back to Party Selection</button>
      </div>
    );
  }

  // Party Selection Phase
  if (gamePhase === 'party-selection') {
    return (
      <PartySelectionPhase
        playerGrid={partyGrid.playerGrid}
        enemyGrid={partyGrid.enemyGrid}
        draggedTemplate={dragAndDrop.draggedTemplate}
        onClearGrid={partyGrid.clearGrid}
        onStartBattle={handleStartBattle}
        onDragStart={dragAndDrop.startDragFromTemplate}
        onDragStartFromGrid={handleDragStartFromGrid}
        onDragEnd={dragAndDrop.endDrag}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        isDragging={dragAndDrop.isDragging}
      />
    );
  }

  // Battle Phase
  if (!gameState) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <BattlePhase
      gameState={gameState}
      loading={loading}
      targetingState={targetingState}
      onSkillClick={handleSkillClick}
      onUnitClick={handleUnitClick}
      onCancelTargeting={() => setTargetingState(null)}
      onStartNewGame={startNewGame}
      onBackToPartySelection={handleBackToPartySelection}
      isValidTarget={isValidTarget}
    />
  );
}

export default App;
