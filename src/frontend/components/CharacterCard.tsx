import { CharacterModel } from '../../backend/core/types';
import { getSkills } from '../../backend/skills/skillDefinitions';

interface CharacterCardProps {
  template: CharacterModel;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function CharacterCard({ template, onDragStart, onDragEnd }: CharacterCardProps) {
  return (
    <div
      className="character-card"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <h3>{template.name}</h3>
      <div className="character-stats">
        <p>HP: {template.maxHealth}</p>
        <p>Power: {template.power}</p>
        <p>Magic: {template.magic}</p>
        <p>Defense: {template.defense}</p>
        <p>Initiative: {template.initiative}</p>
      </div>
      <div className="character-skills">
        <strong>Skills:</strong> {getSkills(template.skillTypes).map(s => s.name).join(', ')}
      </div>
    </div>
  );
}
