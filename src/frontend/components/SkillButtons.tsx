import { Skill } from '../../backend/core/types';

interface SkillButtonsProps {
  skills: Skill[];
  onSkillClick: (skill: Skill) => void;
  disabled: boolean;
}

export function SkillButtons({ skills, onSkillClick, disabled }: SkillButtonsProps) {
  return (
    <div className="skills">
      <h3>Your Skills</h3>
      <div className="skill-buttons">
        {skills.map((skill, index) => (
          <button
            key={index}
            onClick={() => onSkillClick(skill)}
            disabled={disabled}
            className={`skill-button ${skill.type}`}
            title={skill.description}
          >
            {skill.name}
          </button>
        ))}
      </div>
    </div>
  );
}
