import { useState, useEffect } from 'react';
import { GameState, Skill, ActionCommand } from '../backend/types';
import { IGameService } from '../backend/gameService';
import { InBrowserGameService } from '../backend/inBrowserGameService';
import { getValidTargets } from '../backend/targetingSystem';
import './App.css';

// Initialize game service - can easily be swapped to ApiGameService later
const gameService: IGameService = new InBrowserGameService();

interface TargetingState {
  skill: Skill;
  selectedTargets: string[];
  currentStep: number;
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetingState, setTargetingState] = useState<TargetingState | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      const state = await gameService.getState();
      setGameState(state);
      setError(null);
    } catch (err) {
      setError('Failed to initialize game');
      console.error('Failed to fetch game state:', err);
    }
  };

  const startNewGame = async () => {
    setLoading(true);
    setError(null);
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

  const handleSkillClick = (skill: Skill) => {
    if (!gameState || gameState.gameOver || loading || gameState.currentTurn !== 'hero') {
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

    // Validate this is a valid target
    const validTargets = getValidTargets(
      gameState,
      gameState.currentTurn,
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
    const requirement = targetingState.skill.targeting[targetingState.currentStep];
    const validTargets = getValidTargets(gameState, gameState.currentTurn, requirement);
    return validTargets.some((u) => u.id === unitId);
  };

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={initializeGame}>Retry</button>
      </div>
    );
  }

  if (!gameState) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <h1>Melee Combat</h1>

      {targetingState && (
        <div className="targeting-indicator">
          <p>Select target for {targetingState.skill.name}</p>
          <p>
            Step {targetingState.currentStep + 1} of {targetingState.skill.targeting.length}
          </p>
          <button onClick={() => setTargetingState(null)}>Cancel</button>
        </div>
      )}

      <div className="battlefield">
        <div
          className={`unit hero ${isValidTarget('hero') ? 'valid-target' : ''}`}
          onClick={() => handleUnitClick('hero')}
          style={{ cursor: isValidTarget('hero') ? 'pointer' : 'default' }}
        >
          <h2>{gameState.hero.name}</h2>
          <div className="health-bar">
            <div
              className="health-fill"
              style={{
                width: `${(gameState.hero.health / gameState.hero.maxHealth) * 100}%`,
              }}
            />
          </div>
          <div className="health-text">
            {gameState.hero.health} / {gameState.hero.maxHealth}
          </div>
          {gameState.hero.isDefending && (
            <div className="status defending">🛡️ Defending</div>
          )}
        </div>

        <div className="vs">VS</div>

        <div
          className={`unit skeleton ${isValidTarget('skeleton') ? 'valid-target' : ''}`}
          onClick={() => handleUnitClick('skeleton')}
          style={{ cursor: isValidTarget('skeleton') ? 'pointer' : 'default' }}
        >
          <h2>{gameState.skeleton.name}</h2>
          <div className="health-bar">
            <div
              className="health-fill skeleton-health"
              style={{
                width: `${(gameState.skeleton.health / gameState.skeleton.maxHealth) * 100}%`,
              }}
            />
          </div>
          <div className="health-text">
            {gameState.skeleton.health} / {gameState.skeleton.maxHealth}
          </div>
          {gameState.skeleton.isDefending && (
            <div className="status defending">🛡️ Defending</div>
          )}
        </div>
      </div>

      <div className="skills">
        <h3>Your Skills</h3>
        <div className="skill-buttons">
          {gameState.hero.skills.map((skill, index) => (
            <button
              key={index}
              onClick={() => handleSkillClick(skill)}
              disabled={
                gameState.gameOver ||
                loading ||
                gameState.currentTurn !== 'hero'
              }
              className={`skill-button ${skill.type}`}
              title={skill.description}
            >
              {skill.name}
            </button>
          ))}
        </div>
      </div>

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
            {gameState.winner === 'hero' ? '🎉 Victory!' : '💀 Defeat!'}
          </h2>
          <button onClick={startNewGame} className="new-game-button">
            New Game
          </button>
        </div>
      )}

      {!gameState.gameOver && (
        <button onClick={startNewGame} className="reset-button">
          Reset Game
        </button>
      )}
    </div>
  );
}

export default App;
