import { getAuroraColor } from './heatScale';

interface RenderOptions {
  canvas: HTMLCanvasElement;
  values: Float32Array;
  width: number;
  height: number;
  channelIndex: number;
  numChannels: number;
  globalMin: number;
  globalMax: number;
}

/**
 * Renders a specific channel of an activation layer to a canvas.
 * Handles reshaping from flat 1D layout: (row * width + col) * numChannels + channelIndex
 */
export function renderFeatureMap(options: RenderOptions) {
  const { canvas, values, width, height, channelIndex, numChannels } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const canvasW = canvas.width;
  const canvasH = canvas.height;
  
  // Calculate cell dimensions
  const cellW = canvasW / width;
  const cellH = canvasH / height;

  // 1. Calculate channel-specific min/max for optimal contrast stretching
  let chMin = Infinity;
  let chMax = -Infinity;

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const idx = (r * width + c) * numChannels + channelIndex;
      const val = values[idx];
      if (val < chMin) chMin = val;
      if (val > chMax) chMax = val;
    }
  }

  // Handle case where channel is completely uniform
  if (chMin === chMax) {
    chMin = 0;
    chMax = chMax === 0 ? 1 : chMax;
  }

  // 2. Render cells
  ctx.clearRect(0, 0, canvasW, canvasH);

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const idx = (r * width + c) * numChannels + channelIndex;
      const val = values[idx];

      // Normalize to [0, 1] using min/max of this channel
      const normVal = (val - chMin) / (chMax - chMin);
      
      const { r: cr, g: cg, b: cb } = getAuroraColor(normVal);
      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;

      // Fill cell grid rectangle
      ctx.fillRect(
        Math.floor(c * cellW),
        Math.floor(r * cellH),
        Math.ceil(cellW),
        Math.ceil(cellH)
      );
    }
  }
}
export type { RenderOptions };
