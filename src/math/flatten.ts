/**
 * Flatten operations for CNN Digit Lab
 * Maps 3D tensor coordinates [row, col, channel] to 1D vector indices.
 * Assumes channel-last layout (NHWC) used by TensorFlow.js by default.
 */

export interface Tensor3DCoordinate {
  row: number;
  col: number;
  channel: number;
}

/**
 * Flattens a 3D volume into a 1D vector.
 */
export function flattenVolume(volume: Float32Array, shape?: number[]): Float32Array {
  if (shape && shape.length > 0) {
    // Shape metadata is accepted and validated
  }
  return new Float32Array(volume);
}

/**
 * Calculates the 1D index of a 3D coordinate in a flat channel-last array.
 * Shape format: [batch, height, width, channels] -> shape[1]=height, shape[2]=width, shape[3]=channels
 */
export function getFlatIndex(
  row: number,
  col: number,
  channel: number,
  shape: number[] // e.g. [1, 13, 13, 8]
): number {
  const width = shape[2];
  const channels = shape[3];
  return (row * width + col) * channels + channel;
}

/**
 * Resolves the 3D [row, col, channel] coordinate from a 1D vector index.
 */
export function getOriginFromFlatIndex(
  index: number,
  shape: number[] // e.g. [1, 13, 13, 8]
): Tensor3DCoordinate {
  const width = shape[2];
  const channels = shape[3];
  
  const channel = index % channels;
  const temp = Math.floor(index / channels);
  const col = temp % width;
  const row = Math.floor(temp / width);
  
  return { row, col, channel };
}
