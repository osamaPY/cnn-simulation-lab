/**
 * Max Pooling operations for CNN Digit Lab
 * Downsamples spatial dimensions (26x26 -> 13x13 output maps using 2x2 filters with stride 2).
 */

/**
 * Extracts a 2x2 spatial window from a flat 26x26 input grid at the specified pool coordinates.
 * Stride = 2, so row/col indices on the output map map to 2*row/2*col on the input map.
 */
export function getPoolingWindow(
  input26: Float32Array,
  row: number, // 0 to 12
  col: number  // 0 to 12
): Float32Array {
  const window = new Float32Array(4);
  const startRow = row * 2;
  const startCol = col * 2;

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const inputRow = startRow + r;
      const inputCol = startCol + c;
      window[r * 2 + c] = input26[inputRow * 26 + inputCol];
    }
  }
  return window;
}

/**
 * Finds the maximum value in a 2x2 window and returns its value and localized index (0 to 3).
 */
export function maxPoolWindow(window: Float32Array): { maxVal: number; maxIndex: number } {
  let maxVal = -Infinity;
  let maxIndex = 0;

  for (let i = 0; i < 4; i++) {
    if (window[i] > maxVal) {
      maxVal = window[i];
      maxIndex = i;
    }
  }
  return { maxVal, maxIndex };
}

/**
 * Performs 2D Max Pooling on a 26x26 input grid, producing a 13x13 downsampled output.
 */
export function computeMaxPool2D(input26: Float32Array): Float32Array {
  const output = new Float32Array(13 * 13);
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const win = getPoolingWindow(input26, r, c);
      const { maxVal } = maxPoolWindow(win);
      output[r * 13 + c] = maxVal;
    }
  }
  return output;
}
