import { describe, expect, it } from 'vitest';
import {
  calculateCenterOfMass,
  findInkBoundingBox,
  preprocessCanvas
} from './preprocess';

function createRgbaGrid(width: number, height: number) {
  return new Uint8ClampedArray(width * height * 4);
}

function setInkPixel(pixels: Uint8ClampedArray, width: number, x: number, y: number, value = 255) {
  pixels[(y * width + x) * 4] = value;
}

describe('preprocessing helpers', () => {
  it('detects the bounding box around ink pixels', () => {
    const pixels = createRgbaGrid(5, 5);
    setInkPixel(pixels, 5, 1, 2);
    setInkPixel(pixels, 5, 3, 4);

    const result = findInkBoundingBox(pixels, 5, 5);

    expect(result.boundingBox).toEqual({ minX: 1, minY: 2, maxX: 3, maxY: 4 });
    expect(result.nonzeroPixelCount).toBe(2);
  });

  it('calculates center of mass for a simple synthetic grid', () => {
    const values = new Float32Array(3 * 3);
    values[0 * 3 + 0] = 1;
    values[2 * 3 + 2] = 3;

    const center = calculateCenterOfMass(values, 3, 3);

    expect(center.x).toBeCloseTo(1.5);
    expect(center.y).toBeCloseTo(1.5);
  });

  it('returns a normalized 784-value tensor for an empty canvas', () => {
    const pixels = createRgbaGrid(280, 280);
    const canvas = {
      width: 280,
      height: 280,
      getContext: () => ({
        getImageData: () => ({ data: pixels })
      })
    } as unknown as HTMLCanvasElement;

    const result = preprocessCanvas(canvas);

    expect(result.data).toHaveLength(784);
    expect(result.shape).toEqual([1, 28, 28, 1]);
    expect(Array.from(result.data).every(value => value >= 0 && value <= 1)).toBe(true);
  });
});
