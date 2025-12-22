import { IGameService, GameServiceError } from '../core/gameService.js';
import { GameState, ActionCommand, CharacterModel } from '../core/types.js';
import { createGame, executeAction, createGameWithModels, createGameWithPositionedModels } from '../game/gameOrchestrator.js';
import { SKILLS } from '../skills/skills.js';
import { validateTargets } from '../systems/targetingSystem.js';
import { PositionedModel } from '../game/partyComposer.js';

/**
 * In-browser implementation of game service
 * Runs all game logic in the browser without server calls
 */
export class InBrowserGameService implements IGameService {
  private gameState: GameState;
  private playerModels: CharacterModel[] | null = null;
  private enemyModels: CharacterModel[] | null = null;
  private playerPositionedModels: PositionedModel[] | null = null;
  private enemyPositionedModels: PositionedModel[] | null = null;

  constructor() {
    this.gameState = createGame();
  }

  /**
   * Set the parties to use for the next game
   */
  setParties(playerModels: CharacterModel[], enemyModels: CharacterModel[]): void {
    this.playerModels = playerModels;
    this.enemyModels = enemyModels;
  }

  /**
   * Set the positioned parties to use for the next game
   */
  setPositionedParties(playerModels: PositionedModel[], enemyModels: PositionedModel[]): void {
    this.playerPositionedModels = playerModels;
    this.enemyPositionedModels = enemyModels;
  }

  async getState(): Promise<GameState> {
    return Promise.resolve({ ...this.gameState });
  }

  async newGame(): Promise<GameState> {
    try {
      if (this.playerPositionedModels && this.enemyPositionedModels) {
        this.gameState = createGameWithPositionedModels(this.playerPositionedModels, this.enemyPositionedModels);
      } else if (this.playerModels && this.enemyModels) {
        this.gameState = createGameWithModels(this.playerModels, this.enemyModels);
      } else {
        this.gameState = createGame();
      }
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

      // Get active unit ID from turn order
      const activeUnitId = this.gameState.turnOrder.unitOrder[this.gameState.turnOrder.currentUnitIndex];

      // Validate targets
      const validation = validateTargets(
        skill,
        command.targets,
        this.gameState,
        activeUnitId
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
