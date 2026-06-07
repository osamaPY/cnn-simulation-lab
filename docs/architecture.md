# Architecture

## System Overview

CNN Digit Lab is a client-only Vite application. Drawing, preprocessing, TensorFlow.js inference, activation extraction, and visualization all run in the browser.

```text
DrawCanvas
  -> preprocessCanvas
  -> Zustand lab store
  -> TensorFlow.js LayersModel
  -> prediction + copied activation arrays
  -> active stage visualization
```

## Runtime Boundaries

### ML pipeline

- `src/ml/loadModel.ts` loads `model/model.json` relative to Vite's deployment base.
- `src/ml/preprocess.ts` converts a drawing canvas to a normalized `[1, 28, 28, 1]` tensor input.
- `src/ml/runInference.ts` wraps temporary tensor work in `tf.tidy`.
- `src/ml/activationModel.ts` builds a cached multi-output model, copies activation values into `Float32Array`, and disposes output tensors.

### Application state

`src/hooks/useLabStore.ts` contains lesson navigation, preprocessing results, predictions, copied activation arrays, and model status. Components subscribe to narrow state slices to reduce unrelated rerenders.

### Visualization

- Canvas handles large grids, feature maps, and progressive outputs.
- SVG handles small, interactive diagrams and sampled connection views.
- Framer Motion handles stage transitions and a limited number of UI elements.
- Heavy stages are lazy-loaded and only the active stage is mounted.

### Deterministic animation

`src/animations/useTimeline.ts` owns a global `stepIndex`, speed, and playback state. Data-driven stages derive their visual state from `stepIndex`, allowing play, pause, step, reset, and scrubbing.

## Model Contract

The training script defines:

| Layer | Output |
| --- | --- |
| Input | `28 x 28 x 1` |
| Conv2D, 8 filters | `26 x 26 x 8` |
| MaxPool | `13 x 13 x 8` |
| Conv2D, 16 filters | `11 x 11 x 16` |
| MaxPool | `5 x 5 x 16` |
| Flatten | `400` |
| Dense + ReLU | `64` |
| Dense + Softmax | `10` |

All displayed production shape labels should be verified against this contract and the exported model summary before launch.

## Deployment Contract

Static model files must exist at:

```text
public/model/model.json
public/model/group*.bin
```

Vite copies `public/` into the deployment root. Model loading uses `import.meta.env.BASE_URL`, which supports both root deployments and the `/cnn_simulation/` GitHub Pages base.

## Testing Strategy

Tests protect durable contracts rather than visual implementation:

- classification math
- convolution, pooling, and flatten shapes
- preprocessing bounding box and center of mass
- normalized preprocessing output

Visual snapshots are intentionally avoided.
