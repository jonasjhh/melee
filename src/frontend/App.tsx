import { useState, useEffect } from 'react';
import { GameState, Skill, ActionCommand, CharacterModel } from '../backend/types';
import { IGameService } from '../backend/gameService';
import { InBrowserGameService } from '../backend/inBrowserGameService';
import { getValidTargets } from '../backend/targetingSystem';
import { getActiveUnit } from '../backend/initiativeSystem';
import { CHARACTER_TEMPLATES } from '../backend/characterModel';
import { getSkills } from '../backend/skillDefinitions';
import './App.css';

// Initialize game service - can easily be swapped to ApiGameService later
const gameService: IGameService = new InBrowserGameService();

interface TargetingState {
  skill: Skill;
  selectedTargets: string[];
  currentStep: number;
}

type GamePhase = 'party-selection' | 'battle';

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('party-selection');
  const [playerParty, setPlayerParty] = useState<CharacterModel[]>([]);
  const [enemyParty, setEnemyParty] = useState<CharacterModel[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetingState, setTargetingState] = useState<TargetingState | null>(null);

  useEffect(() => {
    const init = async () => {
      if (gamePhase === 'battle' && !gameState) {
        try {
          // Set parties if they exist
          if (playerParty.length > 0 && enemyParty.length > 0) {
            (gameService as InBrowserGameService).setParties(playerParty, enemyParty);
          }

          // Create new game with the selected parties
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
  }, [gamePhase, gameState, playerParty, enemyParty]);

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

  const handleAddToPlayerParty = (model: CharacterModel) => {
    if (playerParty.length < 4) {
      setPlayerParty([...playerParty, model]);
    }
  };

  const handleAddToEnemyParty = (model: CharacterModel) => {
    if (enemyParty.length < 4) {
      setEnemyParty([...enemyParty, model]);
    }
  };

  const handleRemoveFromPlayerParty = (index: number) => {
    setPlayerParty(playerParty.filter((_, i) => i !== index));
  };

  const handleRemoveFromEnemyParty = (index: number) => {
    setEnemyParty(enemyParty.filter((_, i) => i !== index));
  };

  const handleStartBattle = () => {
    if (playerParty.length > 0 && enemyParty.length > 0) {
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
    const validTargets = getValidTargets(
      gameState,
      activeUnitId,
      requirement
    );

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
    const availableTemplates = Object.values(CHARACTER_TEMPLATES);

    return (
      <div className="app">
        <h1>Melee Combat - Party Selection</h1>

        <div className="party-selection">
          <div className="character-templates">
            <h2>Available Characters</h2>
            <div className="template-grid">
              {availableTemplates.map((template) => (
                <div key={template.id} className="character-card">
                  <h3>{template.name}</h3>
                  <div className="character-stats">
                    <p>HP: {template.maxHealth}</p>
                    <p>Power: {template.power}</p>
                    <p>Defense: {template.defense}</p>
                    <p>Initiative: {template.initiative}</p>
                  </div>
                  <div className="character-skills">
                    <strong>Skills:</strong> {getSkills(template.skillTypes).map(s => s.name).join(', ')}
                  </div>
                  <div className="add-buttons">
                    <button
                      onClick={() => handleAddToPlayerParty(template)}
                      disabled={playerParty.length >= 4}
                      className="add-player-button"
                    >
                      Add to Player
                    </button>
                    <button
                      onClick={() => handleAddToEnemyParty(template)}
                      disabled={enemyParty.length >= 4}
                      className="add-enemy-button"
                    >
                      Add to Enemy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="selected-parties">
            <div className="party-display player-party-display">
              <h2>Player Party ({playerParty.length}/4)</h2>
              {playerParty.length === 0 ? (
                <p className="empty-party">No characters selected</p>
              ) : (
                <div className="party-list">
                  {playerParty.map((model, idx) => (
                    <div key={idx} className="party-member">
                      <span>{model.name}</span>
                      <button onClick={() => handleRemoveFromPlayerParty(idx)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="party-display enemy-party-display">
              <h2>Enemy Party ({enemyParty.length}/4)</h2>
              {enemyParty.length === 0 ? (
                <p className="empty-party">No characters selected</p>
              ) : (
                <div className="party-list">
                  {enemyParty.map((model, idx) => (
                    <div key={idx} className="party-member">
                      <span>{model.name}</span>
                      <button onClick={() => handleRemoveFromEnemyParty(idx)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleStartBattle}
            disabled={playerParty.length === 0 || enemyParty.length === 0}
            className="start-battle-button"
          >
            Start Battle
          </button>
        </div>
      </div>
    );
  }

  // Battle Phase
  if (!gameState) {
    return <div className="loading">Loading...</div>;
  }

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
          <button onClick={() => setTargetingState(null)}>Cancel</button>
        </div>
      )}

      <div className="battlefield-grid">
        {gameState.grid.cells.map((row, rowIdx) => (
          <div key={rowIdx} className="grid-row">
            {row.map((cell, colIdx) => {
              const unit = cell.unitId ? gameState.grid.units.get(cell.unitId) : null;
              const isActive = unit?.id === activeUnitId;
              const isValid = unit ? isValidTarget(unit.id) : false;

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`grid-cell ${cell.team} ${isActive ? 'active' : ''} ${unit && unit.health === 0 ? 'dead' : ''}`}
                  onClick={() => unit && unit.health > 0 && handleUnitClick(unit.id)}
                  style={{ cursor: isValid ? 'pointer' : 'default' }}
                >
                  {unit && unit.health > 0 ? (
                    <div className={`unit ${isValid ? 'valid-target' : ''}`}>
                      <div className="unit-name">{unit.name}</div>
                      <div className="health-bar">
                        <div
                          className="health-fill"
                          style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                        />
                      </div>
                      <div className="unit-stats">
                        {unit.health}/{unit.maxHealth} HP
                      </div>
                      {unit.buffs.length > 0 && (
                        <div className="buffs">
                          {unit.buffs.map((buff, idx) => {
                            const buffIcon = {
                              defending: '🛡️',
                              haste: '⚡',
                              bless: '✨',
                              regen: '💚'
                            }[buff.type] || '•';
                            return (
                              <span key={idx} className={`buff-icon ${buff.type}`} title={`${buff.type} (${buff.duration} turns)`}>
                                {buffIcon}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : unit && unit.health === 0 ? (
                    <div className="unit dead-unit">
                      <div className="unit-name">{unit.name}</div>
                      <div className="dead-marker">💀</div>
                    </div>
                  ) : (
                    <div className="empty-cell">-</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {isPlayerTurn && !gameState.gameOver && activeUnit && (
        <div className="skills">
          <h3>Your Skills</h3>
          <div className="skill-buttons">
            {activeUnit.skills.map((skill, index) => (
              <button
                key={index}
                onClick={() => handleSkillClick(skill)}
                disabled={loading || targetingState !== null}
                className={`skill-button ${skill.type}`}
                title={skill.description}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>
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
          <h2>
            {gameState.winner === 'player' ? '🎉 Victory!' : '💀 Defeat!'}
          </h2>
          <button onClick={startNewGame} className="new-game-button">
            New Game
          </button>
        </div>
      )}

      {!gameState.gameOver && (
        <div className="game-controls">
          <button onClick={startNewGame} className="reset-button">
            Reset Game
          </button>
          <button onClick={handleBackToPartySelection} className="back-button">
            Back to Party Selection
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
