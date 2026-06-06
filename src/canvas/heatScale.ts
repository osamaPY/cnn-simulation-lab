/**
 * Tensor Aurora Heat Scale
 * 
 * Maps normalized values (0.0 to 1.0) to the Tensor Aurora color gradient:
 * - 0.0: Dim Indigo/Black (rgb(5, 2, 12))
 * - 0.5: Teal (rgb(13, 148, 136))
 * - 1.0: Mint (rgb(52, 211, 153))
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

const COLOR_LOW: RGB = { r: 5, g: 2, b: 12 };       // #05020c (Dim Indigo/Black)
const COLOR_MID: RGB = { r: 13, g: 148, b: 136 };   // #0d9488 (Teal)
const COLOR_HIGH: RGB = { r: 52, g: 211, b: 153 };  // #34d399 (Mint)

/**
 * Returns the interpolated RGB color for a given normalized value in [0, 1].
 */
export function getAuroraColor(val: number): RGB {
  // Clamp value between 0.0 and 1.0
  const t = Math.max(0, Math.min(1, val));

  if (t <= 0.5) {
    // Interpolate between Low and Mid (scaled to [0..1] range for the sub-interval)
    const factor = t * 2;
    return {
      r: Math.round(COLOR_LOW.r + (COLOR_MID.r - COLOR_LOW.r) * factor),
      g: Math.round(COLOR_LOW.g + (COLOR_MID.g - COLOR_LOW.g) * factor),
      b: Math.round(COLOR_LOW.b + (COLOR_MID.b - COLOR_LOW.b) * factor),
    };
  } else {
    // Interpolate between Mid and High (scaled to [0..1] range for the sub-interval)
    const factor = (t - 0.5) * 2;
    return {
      r: Math.round(COLOR_MID.r + (COLOR_HIGH.r - COLOR_MID.r) * factor),
      g: Math.round(COLOR_MID.g + (COLOR_HIGH.g - COLOR_MID.g) * factor),
      b: Math.round(COLOR_MID.b + (COLOR_HIGH.b - COLOR_MID.b) * factor),
    };
  }
}

/**
 * Returns the CSS rgb string for a given normalized value.
 */
export function getAuroraColorString(val: number): string {
  const { r, g, b } = getAuroraColor(val);
  return `rgb(${r}, ${g}, ${b})`;
}
