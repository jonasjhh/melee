import { GameState, SkillType } from './types.js';

/**
 * Abstract interface for game service
 * This can be implemented as in-browser logic or API calls to a server
 */
export interface IGameService {
  /**
   * Gets the current game state
   */
  getState(): Promise<GameState>;

  /**
   * Creates a new game
   */
  newGame(): Promise<GameState>;

  /**
   * Performs an action in the game
   */
  performAction(action: SkillType): Promise<GameState>;
}

/**
 * Error thrown when game service operations fail
 */
export class GameServiceError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'GameServiceError';
  }
}
