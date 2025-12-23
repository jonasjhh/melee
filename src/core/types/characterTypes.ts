import { SkillType } from './skillTypes.js';

export interface CharacterModel {
  id: string;
  name: string;
  maxHealth: number;
  power: number;
  magic: number;
  defense: number;
  initiative: number;
  skillTypes: SkillType[]; // Which skills this model can use
}

export interface Party {
  id: string;
  name: string;
  models: CharacterModel[]; // Array of character models in this party
}
