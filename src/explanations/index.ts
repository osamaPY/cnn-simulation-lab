import type { TeachingMode } from '../types/cnn';
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

export const EXPLANATIONS: Record<TeachingMode, Record<number, ExplanationContent>> = {
  beginner: beginnerExplanations,
  math: mathExplanations,
  exam: examExplanations
};
