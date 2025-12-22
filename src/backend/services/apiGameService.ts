import { IGameService, GameServiceError } from '../core/gameService.js';
import { GameState, ActionCommand } from '../core/types.js';

/**
 * API-based implementation of game service
 * Makes HTTP calls to a game server
 * This can be swapped in later when you have a backend server
 */
export class ApiGameService implements IGameService {
  constructor(private apiUrl: string) {}

  async getState(): Promise<GameState> {
    try {
      const response = await fetch(`${this.apiUrl}/api/game/state`);
      if (!response.ok) {
        throw new Error('Failed to fetch game state');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get game state:', error);
      throw new GameServiceError(
        'Failed to get game state from server',
        'GET_STATE_FAILED'
      );
    }
  }

  async newGame(): Promise<GameState> {
    try {
      const response = await fetch(`${this.apiUrl}/api/game/new`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to create new game');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create new game:', error);
      throw new GameServiceError(
        'Failed to create new game on server',
        'NEW_GAME_FAILED'
      );
    }
  }

  async performAction(command: ActionCommand): Promise<GameState> {
    try {
      const response = await fetch(`${this.apiUrl}/api/game/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error('Failed to perform action');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to perform action:', error);
      throw new GameServiceError(
        'Failed to perform action on server',
        'ACTION_FAILED'
      );
    }
  }
}
