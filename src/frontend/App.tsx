import { useState, useEffect } from 'react';
import { GameState, SkillType } from '../backend/types';
import { IGameService } from '../backend/gameService';
import { InBrowserGameService } from '../backend/inBrowserGameService';
import './App.css';

// Initialize game service - can easily be swapped to ApiGameService later
const gameService: IGameService = new InBrowserGameService();

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const performAction = async (action: SkillType) => {
    if (!gameState || gameState.gameOver || loading) return;

    setLoading(true);
    setError(null);
    try {
      const state = await gameService.performAction(action);
      setGameState(state);
    } catch (err) {
      setError('Failed to perform action');
      console.error('Failed to perform action:', err);
    } finally {
      setLoading(false);
    }
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

      <div className="battlefield">
        <div className="unit hero">
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

        <div className="unit skeleton">
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
              onClick={() => performAction(skill.type)}
              disabled={
                gameState.gameOver ||
                loading ||
                gameState.currentTurn !== 'hero'
              }
              className={`skill-button ${skill.type}`}
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
