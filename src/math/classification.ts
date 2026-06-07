export function softmax(logits: ArrayLike<number>): number[] {
  if (logits.length === 0) return [];

  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    if (logits[i] > max) max = logits[i];
  }

  const exponentials = new Array<number>(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    const value = Math.exp(logits[i] - max);
    exponentials[i] = value;
    sum += value;
  }

  return exponentials.map(value => value / sum);
}

export function argmax(values: ArrayLike<number>): number {
  if (values.length === 0) return -1;

  let maxIndex = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[maxIndex]) {
      maxIndex = i;
    }
  }
  return maxIndex;
}
