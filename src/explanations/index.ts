import { mathExplanations } from './math';

export interface ExplanationContent {
  headline: string;
  body: string;
  focusFormula?: string;
  interactiveGoal: string;
  keyTakeaway: string;
}

export const EXPLANATIONS: Record<number, ExplanationContent> = mathExplanations;
