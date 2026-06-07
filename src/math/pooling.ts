/**
 * Max Pooling operations for CNN Digit Lab
 * Downsamples spatial dimensions (26x26 -> 13x13 output maps using 2x2 filters with stride 2).
 */

/**
 * Extracts a spatial window from a flat input grid at the specified pool coordinates.
 */
export function getPoolingWindow(
  input: Float32Array,
  inputDim: number,
  row: number,
  col: number,
  poolSize: number
): Float32Array {
  const window = new Float32Array(poolSize * poolSize);
  const startRow = row * poolSize;
  const startCol = col * poolSize;

  for (let r = 0; r < poolSize; r++) {
    for (let c = 0; c < poolSize; c++) {
      const inputRow = startRow + r;
      const inputCol = startCol + c;
      window[r * poolSize + c] = input[inputRow * inputDim + inputCol];
    }
  }
  return window;
}

/**
 * Finds the maximum value in a window and returns its value and localized index.
 */
export function maxPoolWindow(window: Float32Array): { maxVal: number; maxIndex: number } {
  let maxVal = -Infinity;
  let maxIndex = 0;

  for (let i = 0; i < window.length; i++) {
    if (window[i] > maxVal) {
      maxVal = window[i];
      maxIndex = i;
    }
  }
  return { maxVal, maxIndex };
}

/**
 * Performs 2D Max Pooling on an input grid.
 */
export function computeMaxPool2D(input: Float32Array, inputDim: number, poolSize: number): Float32Array {
  const outputDim = Math.floor(inputDim / poolSize);
  const output = new Float32Array(outputDim * outputDim);
  for (let r = 0; r < outputDim; r++) {
    for (let c = 0; c < outputDim; c++) {
      const win = getPoolingWindow(input, inputDim, r, c, poolSize);
      const { maxVal } = maxPoolWindow(win);
      output[r * outputDim + c] = maxVal;
    }
  }
  return output;
}
