import { GameState } from '../../backend/core/types';
import { getActiveUnit } from '../../backend/systems/initiativeSystem';

interface BattleGridProps {
  gameState: GameState;
  isValidTarget: (unitId: string) => boolean;
  onUnitClick: (unitId: string) => void;
}

export function BattleGrid({ gameState, isValidTarget, onUnitClick }: BattleGridProps) {
  const activeUnitId = getActiveUnit(gameState.turnOrder);

  return (
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
                className={`grid-cell ${cell.team} ${isActive ? 'active' : ''} ${
                  unit && unit.health === 0 ? 'dead' : ''
                }`}
                onClick={() => unit && unit.health > 0 && onUnitClick(unit.id)}
                style={{ cursor: isValid ? 'pointer' : 'default' }}
              >
                {unit && unit.health > 0 ? (
                  <div className={`unit ${isValid ? 'valid-target' : ''}`}>
                    <div className="unit-name">{unit.name}</div>
                    <div className="unit-health-container">
                      <div className="health-bar">
                        <div
                          className="health-fill"
                          style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                        />
                      </div>
                      <div className="unit-stats">
                        {unit.health}/{unit.maxHealth}
                      </div>
                    </div>
                    {unit.buffs.length > 0 && (
                      <div className="buffs">
                        {unit.buffs.map((buff, idx) => {
                          const buffIcon =
                            {
                              defending: '🛡️',
                              haste: '⚡',
                              bless: '✨',
                              regen: '💚',
                            }[buff.type] || '•';
                          return (
                            <span
                              key={idx}
                              className={`buff-icon ${buff.type}`}
                              title={`${buff.type} (${buff.duration} turns)`}
                            >
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
  );
}
