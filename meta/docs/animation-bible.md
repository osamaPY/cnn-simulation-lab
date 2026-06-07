# Animation Bible

## Principles

- Motion must explain a transformation, not decorate empty space.
- One stage communicates one primary idea.
- Data-driven motion derives from `stepIndex`, never untracked wall-clock sequences.
- Use the Tensor Aurora smooth-out curve: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Prefer fades, translations, and progressive canvas drawing over bounce or continuous pulsing.
- Glow communicates active signal; dimming communicates inactive context.
- Every stage must remain understandable with reduced motion enabled.

## Performance Rules

- Canvas renders large tensor grids and feature maps.
- SVG is reserved for low-node-count diagrams and sampled connection paths.
- Never animate every dense-layer connection.
- Flatten animates only a representative subset; the full vector renders to canvas.
- Progressive convolution and pooling canvases draw only newly revealed cells.
- Avoid layout-dependent animation loops and repeated DOM measurement.

## Timing

| Interaction | Target |
| --- | --- |
| UI hover/focus | 150–250ms |
| Stage transition | 300–450ms |
| Educational reveal | 500–900ms |
| Step-driven kernel/pool move | ~150ms per step |

Exit transitions should be equal to or faster than entrances.

## Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- stage transitions become instant or opacity-only
- timeline playback jumps to the final state
- flying particles and repeated signal pulses are hidden
- all final values and explanations remain visible

## Stage Expectations

1. Preprocessing: crop, center, normalize.
2. Tensor grid: reveal numerical representation.
3. Pixel probe: hover/tap values.
4–6. Convolution: scan, multiply, sum plus bias.
7. Filters: compare channels.
8. ReLU: visibly clip negative values.
9. Pooling: select max and reduce spatial size.
10. Flatten: sampled cells trace into a full canvas vector.
11. Dense: sampled connections communicate evidence flow.
12. Softmax: probabilities grow and sum to one.
13. Prediction: spotlight result and explain uncertainty.
