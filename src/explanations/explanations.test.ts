import { describe, expect, it } from 'vitest'
import { CNN_STAGES } from '../types/cnn'
import { EXPLANATIONS } from '.'

describe('teaching-mode coverage', () => {
  it.each(['beginner', 'math', 'exam'] as const)('populates every stage in %s mode', (mode) => {
    for (const stage of CNN_STAGES) {
      const explanation = EXPLANATIONS[mode][stage.id]
      expect(explanation?.headline.trim()).toBeTruthy()
      expect(explanation?.body.trim()).toBeTruthy()
      expect(explanation?.interactiveGoal.trim()).toBeTruthy()
      expect(explanation?.keyTakeaway.trim()).toBeTruthy()
    }
  })
})
