import { IGameService, GameServiceError } from './gameService.js';
import { GameState, SkillType } from './types.js';
import { createGame, executeAction } from './gameOrchestrator.js';

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

  async performAction(action: SkillType): Promise<GameState> {
    try {
      if (!['skip', 'attack', 'defend'].includes(action)) {
        throw new GameServiceError('Invalid action', 'INVALID_ACTION');
      }

      this.gameState = executeAction(this.gameState, action);
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
