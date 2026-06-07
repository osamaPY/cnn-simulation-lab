/** Lerp between two numbers */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ease in-out cubic (nice for 3b1b feel) */
export const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/** Ease out expo — fast in, slow settle */
export const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

/** Smooth-step */
export const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Map value from one range to another, clamped */
export const remap = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  const t = Math.max(0, Math.min(1, (v - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
};
