import { describe, expect, it } from 'vitest';
import { argmax, softmax } from './classification';
import { computeConv2D } from './convolution';
import { flattenVolume } from './flatten';
import { computeMaxPool2D } from './pooling';

describe('classification math', () => {
  it('softmax returns probabilities that sum to approximately 1', () => {
    const probabilities = softmax([-2, 0, 3, 8]);
    const sum = probabilities.reduce((total, value) => total + value, 0);

    expect(sum).toBeCloseTo(1, 10);
    expect(probabilities.every(value => value >= 0 && value <= 1)).toBe(true);
  });

  it('argmax returns the index of the largest value', () => {
    expect(argmax([0.1, 0.8, 0.3, 0.2])).toBe(1);
  });
});

describe('CNN shape transforms', () => {
  it('valid 3x3 convolution maps 28x28 to 26x26', () => {
    const input = new Float32Array(28 * 28).fill(1);
    const kernel = new Float32Array(9).fill(1);

    const output = computeConv2D(input, 28, kernel, 3, 1, 0, 0);

    expect(output).toHaveLength(26 * 26);
    expect(output[0]).toBe(9);
  });

  it('2x2 max pooling maps 26x26 to 13x13', () => {
    const input = Float32Array.from({ length: 26 * 26 }, (_, index) => index);

    const output = computeMaxPool2D(input, 26, 2);

    expect(output).toHaveLength(13 * 13);
  });

  it('flattens a 5x5x16 volume into 400 values', () => {
    const volume = Float32Array.from({ length: 5 * 5 * 16 }, (_, index) => index);

    const output = flattenVolume(volume, [1, 5, 5, 16]);

    expect(output).toHaveLength(400);
    expect(output).toEqual(volume);
  });
});
