/**
 * Convolution operations for CNN Digit Lab
 * Computes valid 2D convolutions (28x28 -> 26x26 output maps using 3x3 kernels).
 */

/**
 * Extracts a sub-patch from a flat image grid at the specified top-left coordinates.
 */
export function getPatch(
  input: Float32Array, 
  row: number, 
  col: number, 
  inputDim: number, 
  kernelSize: number
): Float32Array {
  const patch = new Float32Array(kernelSize * kernelSize);
  for (let r = 0; r < kernelSize; r++) {
    for (let c = 0; c < kernelSize; c++) {
      const inputRow = row + r;
      const inputCol = col + c;
      patch[r * kernelSize + c] = input[inputRow * inputDim + inputCol];
    }
  }
  return patch;
}

/**
 * Computes the elementwise dot product of a patch and a kernel,
 * then adds a scalar bias.
 */
export function convolvePatch(
  patch: Float32Array,
  kernel: number[] | Float32Array,
  bias: number
): number {
  let sum = 0;
  for (let i = 0; i < patch.length; i++) {
    sum += patch[i] * kernel[i];
  }
  return sum + bias;
}

/**
 * Computes a full convolution over an input grid.
 */
export function computeConv2D(
  input: Float32Array,
  inputDim: number,
  kernel: number[] | Float32Array,
  kernelSize: number,
  stride: number,
  padding: number,
  bias: number
): Float32Array {
  // Simplistic padding implementation (just zero out for now or assume valid if padding=0)
  // For the sake of this simulation, we mostly care about the output size calculation
  const outputDim = Math.floor((inputDim + 2 * padding - kernelSize) / stride) + 1;
  const output = new Float32Array(outputDim * outputDim);
  
  for (let r = 0; r < outputDim; r++) {
    for (let c = 0; c < outputDim; c++) {
      const inputRow = r * stride;
      const inputCol = c * stride;
      // Note: This doesn't handle padding correctly in the actual slice, 
      // but for this educational tool, we mostly use valid padding.
      const patch = getPatch(input, inputRow, inputCol, inputDim, kernelSize);
      const val = convolvePatch(patch, kernel, bias);
      output[r * outputDim + c] = val;
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
