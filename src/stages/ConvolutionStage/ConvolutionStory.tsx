import { useMemo } from 'react';

interface ConvolutionStoryProps {
  patch: Float32Array;
  kernel: number[];
  products: number[];
  sum: number;
  bias: number;
  output: number;
  progress: number;
  row: number;
  col: number;
  focusPhase: number;
}

function phaseClass(active: boolean, complete: boolean) {
  if (active) return 'convolution-story__phase convolution-story__phase--active';
  if (complete) return 'convolution-story__phase convolution-story__phase--complete';
  return 'convolution-story__phase';
}

export function ConvolutionStory({
  patch,
  kernel,
  products,
  sum,
  bias,
  output,
  progress,
  row,
  col,
  focusPhase,
}: ConvolutionStoryProps) {
  const animatedPhase = Math.min(3, Math.floor(progress * 4));
  const phase = focusPhase > 0 ? focusPhase : animatedPhase;
  const patchCells = useMemo(() => Array.from(patch), [patch]);

  return (
    <section className="convolution-story" aria-label="Animated convolution calculation">
      <header>
        <span>Follow one output cell</span>
        <strong>Patch ({row + 1}, {col + 1}) becomes output ({row}, {col})</strong>
      </header>

      <div className="convolution-story__rail">
        <div className={phaseClass(phase === 0, phase > 0)}>
          <span>1. Read the patch</span>
          <div className="convolution-story__grid">
            {patchCells.map((value, index) => (
              <i key={index} style={{ opacity: Math.max(0.14, value) }}>{value.toFixed(1)}</i>
            ))}
          </div>
          <p>The moving frame selects these nine input values.</p>
        </div>

        <div className="convolution-story__operator" aria-hidden="true">x</div>

        <div className={phaseClass(phase === 1, phase > 1)}>
          <span>2. Apply weights</span>
          <div className="convolution-story__grid">
            {kernel.map((value, index) => <i key={index}>{value}</i>)}
          </div>
          <p>Each input value is multiplied by the aligned kernel weight.</p>
        </div>

        <div className="convolution-story__operator" aria-hidden="true">=</div>

        <div className={phaseClass(phase === 2, phase > 2)}>
          <span>3. Add products</span>
          <div className="convolution-story__products">
            {products.map((value, index) => <i key={index}>{value.toFixed(1)}</i>)}
          </div>
          <strong>sum {sum.toFixed(2)} + bias {bias.toFixed(2)}</strong>
        </div>

        <div className="convolution-story__operator" aria-hidden="true">=</div>

        <div className={phaseClass(phase === 3, false)}>
          <span>4. Write output</span>
          <b>{output.toFixed(3)}</b>
          <p>That single result is written into the feature map.</p>
        </div>
      </div>

      <div className="convolution-story__progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${progress})` }} />
      </div>
    </section>
  );
}
