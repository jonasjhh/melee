import { IGameService, GameServiceError } from './gameService.js';
import { GameState, ActionCommand } from './types.js';
import { createGame, executeAction } from './gameOrchestrator.js';
import { SKILLS } from './skills.js';
import { validateTargets } from './targetingSystem.js';

/**
 * In-browser implementation of game service
 * Runs all game logic in the browser without server calls
 */
export class InBrowserGameService implements IGameService {
  private gameState: GameState;

  constructor() {
    this.gameState = createGame();
  }

  async getState(): Promise<GameState> {
    return Promise.resolve({ ...this.gameState });
  }

  async newGame(): Promise<GameState> {
    try {
      this.gameState = createGame();
      return Promise.resolve({ ...this.gameState });
    } catch (error) {
      console.error('Failed to create new game:', error);
      throw new GameServiceError(
        'Failed to create new game',
        'NEW_GAME_FAILED'
      );
    }
  }

  async performAction(command: ActionCommand): Promise<GameState> {
    try {
      const skill = SKILLS[command.skill];
      if (!skill) {
        throw new GameServiceError('Invalid skill', 'INVALID_SKILL');
      }

      // Validate targets
      const validation = validateTargets(
        skill,
        command.targets,
        this.gameState,
        this.gameState.currentTurn
      );

      if (!validation.valid) {
        throw new GameServiceError(
          validation.error || 'Invalid targets',
          'INVALID_TARGETS'
        );
      }

      this.gameState = executeAction(this.gameState, command);
      return Promise.resolve({ ...this.gameState });
    } catch (error) {
      if (error instanceof GameServiceError) {
        throw error;
      }
      console.error('Failed to perform action:', error);
      throw new GameServiceError(
        'Failed to perform action',
        'ACTION_FAILED'
      );
    }
  }
}
