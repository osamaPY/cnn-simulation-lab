/**
 * Convolution operations for CNN Digit Lab
 * Computes valid 2D convolutions (28x28 -> 26x26 output maps using 3x3 kernels).
 */

/**
 * Extracts a 3x3 sub-patch from a flat 28x28 image grid at the specified top-left coordinates.
 */
export function getPatch(input28: Float32Array, row: number, col: number): Float32Array {
  const patch = new Float32Array(9);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const inputRow = row + r;
      const inputCol = col + c;
      patch[r * 3 + c] = input28[inputRow * 28 + inputCol];
    }
  }
  return patch;
}

/**
 * Computes the elementwise dot product (Hadamard product sum) of a 3x3 patch and a 3x3 kernel,
 * then adds a scalar bias.
 */
export function convolvePatch(
  patch: Float32Array,
  kernel: number[] | Float32Array,
  bias: number
): number {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += patch[i] * kernel[i];
  }
  return sum + bias;
}

/**
 * Computes a full valid 2D convolution over a 28x28 grid, yielding a flat 26x26 output map.
 */
export function computeValidConv2D(
  input28: Float32Array,
  kernel: number[] | Float32Array,
  bias: number
): Float32Array {
  const output = new Float32Array(26 * 26);
  for (let r = 0; r < 26; r++) {
    for (let c = 0; c < 26; c++) {
      const patch = getPatch(input28, r, c);
      const val = convolvePatch(patch, kernel, bias);
      output[r * 26 + c] = val;
    }
  }
  return output;
}

/**
 * Representative Educational Kernel
 * Preset as a Vertical Edge Detector.
 * High values in the center column, negative values on the sides.
 */
export const REPRESENTATIVE_KERNEL = [
  -1,  2, -1,
  -1,  2, -1,
  -1,  2, -1
];

export const REPRESENTATIVE_BIAS = -0.15;
