import { beginnerExplanations } from './beginner';
import { mathExplanations } from './math';
import { examExplanations } from './exam';

export interface ExplanationContent {
  headline: string;
  body: string;
  focusFormula?: string;
  interactiveGoal: string;
  keyTakeaway: string;
}

export const EXPLANATIONS_BY_MODE = {
  beginner: beginnerExplanations,
  mathematical: mathExplanations,
  examprep: examExplanations,
};

export const EXPLANATIONS: Record<number, ExplanationContent> = mathExplanations;
