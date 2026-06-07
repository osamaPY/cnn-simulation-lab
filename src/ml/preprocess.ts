export interface PreprocessResult {
  data: Float32Array; // Size 784 (28x28)
  shape: [number, number, number, number]; // [1, 28, 28, 1]
  debug: {
    boundingBox: { minX: number; minY: number; maxX: number; maxY: number } | null;
    centerOfMass: { x: number; y: number };
    shift: { dx: number; dy: number };
    nonzeroPixelCount: number;
  };
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function findInkBoundingBox(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  threshold = 30
): { boundingBox: BoundingBox | null; nonzeroPixelCount: number } {
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let nonzeroPixelCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const red = pixels[(y * width + x) * 4];
      if (red > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        nonzeroPixelCount++;
      }
    }
  }

  return {
    boundingBox: nonzeroPixelCount > 0 ? { minX, minY, maxX, maxY } : null,
    nonzeroPixelCount
  };
}

export function calculateCenterOfMass(
  values: ArrayLike<number>,
  width: number,
  height: number
): { x: number; y: number } {
  let totalMass = 0;
  let sumX = 0;
  let sumY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = values[y * width + x];
      if (value > 0) {
        totalMass += value;
        sumX += x * value;
        sumY += y * value;
      }
    }
  }

  return totalMass > 0
    ? { x: sumX / totalMass, y: sumY / totalMass }
    : { x: width / 2, y: height / 2 };
}

/**
 * Preprocesses a 280x280 drawing canvas into an MNIST-compatible 28x28 float array.
 * Steps:
 * 1. Find bounding box of the ink.
 * 2. Crop and resize the longest side to 20px (maintaining aspect ratio).
 * 3. Place on a temporary 28x28 canvas.
 * 4. Compute center of mass (centroid) of the 28x28 intensities.
 * 5. Translate the image so the center of mass is centered at (14.0, 14.0).
 * 6. Extract normalized intensities in [0, 1].
 */
export function preprocessCanvas(canvas: HTMLCanvasElement): PreprocessResult {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }

  // 1. Read pixel data (RGBA)
  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  // 2. Find ink bounding box
  const { boundingBox, nonzeroPixelCount } = findInkBoundingBox(pixels, width, height);

  // If canvas is empty, return zeroed representation
  if (nonzeroPixelCount === 0) {
    return {
      data: new Float32Array(784),
      shape: [1, 28, 28, 1],
      debug: {
        boundingBox: null,
        centerOfMass: { x: 14, y: 14 },
        shift: { dx: 0, dy: 0 },
        nonzeroPixelCount: 0
      }
    };
  }

  const { minX, minY, maxX, maxY } = boundingBox!;
  const boxW = maxX - minX + 1;
  const boxH = maxY - minY + 1;

  // 3. Resize longest side to 20px
  let newW: number;
  let newH: number;
  if (boxW > boxH) {
    newW = 20;
    newH = Math.max(1, Math.round(boxH * (20 / boxW)));
  } else {
    newH = 20;
    newW = Math.max(1, Math.round(boxW * (20 / boxH)));
  }

  // Offscreen canvas for cropping and scaling to 20px box
  const resizeCanvas = document.createElement('canvas');
  resizeCanvas.width = newW;
  resizeCanvas.height = newH;
  const resizeCtx = resizeCanvas.getContext('2d')!;
  
  // Fill black
  resizeCtx.fillStyle = '#000000';
  resizeCtx.fillRect(0, 0, newW, newH);
  // Draw cropped image scaled down
  resizeCtx.drawImage(canvas, minX, minY, boxW, boxH, 0, 0, newW, newH);

  // 4. Place onto a temporary 28x28 canvas for center-of-mass calculation
  const massCanvas = document.createElement('canvas');
  massCanvas.width = 28;
  massCanvas.height = 28;
  const massCtx = massCanvas.getContext('2d')!;
  
  // Fill black
  massCtx.fillStyle = '#000000';
  massCtx.fillRect(0, 0, 28, 28);
  
  // Draw the 20px resized image roughly in the center
  const initialX = Math.round((28 - newW) / 2);
  const initialY = Math.round((28 - newH) / 2);
  massCtx.drawImage(resizeCanvas, initialX, initialY);

  // Calculate center of mass
  const massImgData = massCtx.getImageData(0, 0, 28, 28);
  const massPixels = massImgData.data;
  
  const massValues = new Float32Array(28 * 28);
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      massValues[y * 28 + x] = massPixels[(y * 28 + x) * 4];
    }
  }

  const { x: centX, y: centY } = calculateCenterOfMass(massValues, 28, 28);

  // 5. Shift image so center of mass lies exactly at (14.0, 14.0)
  const dx = 14.0 - centX;
  const dy = 14.0 - centY;

  // Create final 28x28 canvas
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = 28;
  finalCanvas.height = 28;
  const finalCtx = finalCanvas.getContext('2d')!;
  
  // Fill black
  finalCtx.fillStyle = '#000000';
  finalCtx.fillRect(0, 0, 28, 28);

  // Translate by center-of-mass shift and draw the initial 28x28 grid
  finalCtx.translate(dx, dy);
  finalCtx.drawImage(massCanvas, 0, 0);

  // Extract final preprocessed pixel values and normalize to [0, 1]
  const finalImgData = finalCtx.getImageData(0, 0, 28, 28);
  const finalPixels = finalImgData.data;
  const normalizedData = new Float32Array(784);

  for (let i = 0; i < 784; i++) {
    // Red channel intensity / 255.0
    normalizedData[i] = finalPixels[i * 4] / 255.0;
  }

  return {
    data: normalizedData,
    shape: [1, 28, 28, 1],
    debug: {
      boundingBox: { minX, minY, maxX, maxY },
      centerOfMass: { x: centX, y: centY },
      shift: { dx, dy },
      nonzeroPixelCount
    }
  };
}
