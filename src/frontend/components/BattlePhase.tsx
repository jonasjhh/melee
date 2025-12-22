import { GameState, Skill } from '../../backend/core/types';
import { getActiveUnit } from '../../backend/systems/initiativeSystem';
import { BattleGrid } from './BattleGrid';
import { SkillButtons } from './SkillButtons';

interface TargetingState {
  skill: Skill;
  selectedTargets: string[];
  currentStep: number;
}

interface BattlePhaseProps {
  gameState: GameState;
  loading: boolean;
  targetingState: TargetingState | null;
  onSkillClick: (skill: Skill) => void;
  onUnitClick: (unitId: string) => void;
  onCancelTargeting: () => void;
  onStartNewGame: () => void;
  onBackToPartySelection: () => void;
  isValidTarget: (unitId: string) => boolean;
}

export function BattlePhase({
  gameState,
  loading,
  targetingState,
  onSkillClick,
  onUnitClick,
  onCancelTargeting,
  onStartNewGame,
  onBackToPartySelection,
  isValidTarget,
}: BattlePhaseProps) {
  const activeUnitId = getActiveUnit(gameState.turnOrder);
  const activeUnit = gameState.grid.units.get(activeUnitId);
  const isPlayerTurn = gameState.playerControlledUnits.has(activeUnitId);

  return (
    <div className="app">
      <h1>Melee Combat</h1>

      <div className="turn-indicator">
        <h3>Round {gameState.turnOrder.roundNumber}</h3>
        <p>
          {isPlayerTurn ? '🎮 Your Turn' : '🤖 Enemy Turn'}: {activeUnit?.name}
        </p>
      </div>

      {targetingState && (
        <div className="targeting-indicator">
          <p>Select target for {targetingState.skill.name}</p>
          <p>
            Step {targetingState.currentStep + 1} of {targetingState.skill.targeting.length}
          </p>
          <button onClick={onCancelTargeting}>Cancel</button>
        </div>
      )}

      <BattleGrid gameState={gameState} isValidTarget={isValidTarget} onUnitClick={onUnitClick} />

      {isPlayerTurn && !gameState.gameOver && activeUnit && (
        <SkillButtons
          skills={activeUnit.skills}
          onSkillClick={onSkillClick}
          disabled={loading || targetingState !== null}
        />
      )}

      <div className="game-log">
        <h3>Battle Log</h3>
        <div className="log-content">
          {gameState.log.map((entry, index) => (
            <div key={index} className="log-entry">
              {entry}
            </div>
          ))}
        </div>
      </div>

      {gameState.gameOver && (
        <div className="game-over">
          <h2>{gameState.winner === 'player' ? '🎉 Victory!' : '💀 Defeat!'}</h2>
          <button onClick={onStartNewGame} className="new-game-button">
            New Game
          </button>
        </div>
      )}

      {!gameState.gameOver && (
        <div className="game-controls">
          <button onClick={onStartNewGame} className="reset-button">
            Reset Game
          </button>
          <button onClick={onBackToPartySelection} className="back-button">
            Back to Party Selection
          </button>
        </div>
      )}
    </div>
  );
}
