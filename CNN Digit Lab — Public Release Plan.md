# CNN Digit Lab — Public Release Plan (Tensor Aurora)

<aside>
🌌

**CNN Digit Lab — Tensor Aurora edition.** This is the revised plan. It separates the *Internal MVP* (a private checkpoint to prove the pipeline works) from the *Public Release v1* (a premium, animated, 3Blue1Brown-*caliber* educational experience you actually publish). The MVP is no longer the goal — it's step one of the path to the real product.

</aside>

<aside>
⚖️

**On the 3Blue1Brown benchmark:** we use it only as a *quality and clarity bar* — elegance, pacing, mathematical storytelling. We do **not** copy its branding, color palette (no signature blue-on-black + Pi creatures), fonts, assets, or visual identity. Tensor Aurora is its own theme. Inspiration, not imitation.

</aside>

---

# 1. Internal MVP vs Public Release v1 vs Dream v2

| Dimension | 🔧 Internal MVP | 🚀 Public Release v1 | 🎬 Dream v2 (Cinematic) |
| --- | --- | --- | --- |
| Purpose | Prove the pipeline works end-to-end. Private checkpoint only. | The version you publish on GitHub and share. Must feel premium and teach. | A flagship interactive lesson — portfolio centerpiece, conference-demo quality. |
| Features | Draw → preprocess → predict → softmax bars. Console-logged activations. | All 13 animated stages, 3 teaching modes, architecture timeline, feature maps, responsive UI, deployed demo. | Guided narrated tour, scrubbable timeline scenes, audio/voiceover option, comparison of multiple digits, shareable deep-links to a stage. |
| Quality bar | "It runs and predicts correctly on my machine." | "A stranger learns how a CNN works and it feels polished." | "People share it because it's beautiful and clear." |
| What must work | Real prediction with correct shapes. | Real prediction + real activations + smooth animations + clear text on every stage. | Everything in v1, flawless on mobile, narrated, zero jank. |
| What can be faked / simulated | Everything visual. No animations needed. | The *kernel weights shown* in the convolution animation can be illustrative (a representative filter), and the dense-layer connection lines can be a sampled subset — as long as it's labeled as a simplified view. | Almost nothing should feel faked; simplifications must be explicitly labeled. |
| What must be real | Model, preprocessing, prediction. | Prediction, preprocessing/centering, extracted intermediate activations, feature maps, softmax probabilities, tensor shapes. | All of v1's real elements + real per-filter kernel weights in the animation. |
| Acceptable to publish? | ❌ Never publish this alone. | ✅ Publish when the Section 8 checklist passes. | ✅ Publish as v2 after v1 is stable and has real users/feedback. |

<aside>
💡

The trap to avoid: treating the Internal MVP as something you "clean up later" into the public version. It isn't. The MVP is throwaway-grade plumbing whose only job is to de-risk the ML. The public version is a *product* built deliberately on top of that proven plumbing.

</aside>

---

# 2. Public Release v1 — Quality Bar

<aside>
🎯

This is the contract. Every item below must be **true, real, and non-broken** before you share the link publicly. If any item is a placeholder or fake, v1 is not ready.

</aside>

## Hard requirements (all must pass)

- [ ]  **Real drawing canvas** — mouse + touch, responsive brush, Clear, Run.
- [ ]  **Solid preprocessing + centering** — bounding-box crop, center-of-mass shift, MNIST-style normalization. Verified accuracy on *your own* drawings.
- [ ]  **Real TensorFlow.js prediction** — pre-trained model, in-browser inference, correct top-1 on clean digits.
- [ ]  **Intermediate activations extracted** — real per-layer outputs from a multi-output activation model (not mocked arrays).
- [ ]  **Architecture timeline** — full pipeline, clickable, active/done/future states.
- [ ]  **Tensor shape labels** — correct, verified against `model.summary()`, shown on every stage.
- [ ]  **Feature map viewer** — real conv activations as heatmaps, channel selector.
- [ ]  **Animated convolution explanation** — sliding 3×3 kernel, patch×kernel, sum+bias → output cell.
- [ ]  **Animated ReLU explanation** — negatives visibly collapse to zero.
- [ ]  **Animated max pooling explanation** — 2×2 window, max highlight, shrink to output.
- [ ]  **Animated flattening explanation** — maps morph into a 1D vector.
- [ ]  **Dense + softmax visualization** — signal flow + probability bars + confidence.
- [ ]  **Beginner / Math / Exam modes** — all three populated for every stage.
- [ ]  **Clean responsive UI** — works on laptop and tablet; graceful (even if reduced) on phone.
- [ ]  **README with screenshots/GIFs** — shows the product without cloning it.
- [ ]  **Deployed demo link** — live, loads the model, predicts. Linked at top of README.
- [ ]  **No broken / fake placeholders** — nothing in the published build says "TODO" or shows dead controls.

## Explicitly NOT required for v1

- Perfect phone layout (tablet-good is enough).
- Voiceover / narration (that's v2).
- Real per-filter kernel weights in the convolution *animation* (a labeled representative kernel is acceptable in v1).
- Deep-linkable stages, multi-digit comparison (v2).

---

# 3. Animation Bible

<aside>
🎬

Global motion principles for Tensor Aurora: **ease, don't bounce** (use soft ease-out curves, ~`cubic-bezier(0.22, 1, 0.36, 1)`); **one idea on screen at a time**; **glow = activation, dim = inactive**; respect `prefers-reduced-motion` with instant states; all data-driven motion is keyed to a `stepIndex`, never wall-clock time.

</aside>

### Stage 1 — Drawing → normalized image

| Field | Spec |
| --- | --- |
| Visual goal | Show the raw stroke becoming a clean, centered, normalized image. |
| User sees | Their drawing, then a ghosted bounding box snapping around it, then it re-centers. |
| Moves | The cropped digit slides to canvas center; bounding box contracts to ink. |
| Glows | The bounding box edge pulses once when locked. |
| Fades | Off-center original fades to 40% as the centered version fades in. |
| Transforms | Crop → translate-to-center → scale-to-fit. |
| Timing | ~700ms total; crop 200ms, center 300ms, settle 200ms. |
| Controls | Replay button; auto-plays once after Run. |
| Math beside | centroid (x̄, ȳ) = Σ(value·position)/Σ(value); shift = center − centroid. |
| Performance | Cheap (single image transform). No concern. |

### Stage 2 — Image → 28×28 tensor grid

| Visual goal | Reveal that the image *is* a grid of numbers. |
| --- | --- |
| User sees | The image dissolving into a 28×28 grid; cells fade from picture to numeric/intensity squares. |
| Moves | Grid lines draw in; cells "pop" in a quick staggered wave (top-left → bottom-right). |
| Glows | High-intensity cells glow brighter (aurora heat scale). |
| Fades | Photographic image fades as discretized grid fades in. |
| Transforms | Continuous image → quantized 28×28 cells. |
| Timing | ~800ms with 1ms/cell stagger capped so total feels snappy. |
| Controls | Toggle: show values vs show intensity. |
| Math beside | Tensor shape badge [1, 28, 28, 1]; "784 numbers, each 0–1". |
| Performance | 784 cells — render to canvas, not 784 DOM nodes, if animating intensity live. |

### Stage 3 — Pixel intensity hover

| Visual goal | Let the user feel that each cell holds a real number. |
| --- | --- |
| User sees | Hovered cell enlarges slightly; a tooltip shows value (e.g. 0.87) + (row, col). |
| Moves / glows | Hovered cell scales 1.15× and gains a ring glow; neighbors dim subtly. |
| Fades | Tooltip fades in ~120ms. |
| Timing | Instant, hover-driven; no auto sequence. |
| Controls | Pure hover/tap. |
| Math beside | value ∈ [0,1]; mention grayscale = single channel. |
| Performance | Use event delegation; avoid per-cell React state. |

### Stage 4 — 3×3 kernel sliding

| Visual goal | Show the kernel scanning the image position by position. |
| --- | --- |
| User sees | A glowing 3×3 frame stepping across the 28×28 grid left→right, top→bottom. |
| Moves | The frame translates one stride at a time; output grid fills the matching cell. |
| Glows | Current 3×3 patch glows; the just-computed output cell flashes. |
| Fades | Previously computed output cells stay, slightly dimmed. |
| Transforms | Input patch → single output value. |
| Timing | Step-driven: ~150ms per step in auto-play; instant when scrubbing. |
| Controls | Play / Pause / Step / Reset / speed slider / scrubber. |
| Math beside | output(i,j) = Σ patch⊙kernel + b; output size = (28−3)+1 = 26. |
| Performance | Don't re-render whole grid per step; move only the frame + update one output cell. |

### Stage 5 — Patch × kernel multiplication

| Visual goal | Make the elementwise multiply concrete. |
| --- | --- |
| User sees | The current 3×3 patch and the 3×3 kernel side by side; pairs multiply into a 3×3 products grid. |
| Moves | Each cell pair animates: patch value and kernel value slide together → product appears. |
| Glows | Active multiplied pair glows; result cell pops. |
| Fades | Completed products settle to steady state. |
| Timing | ~80ms per cell, staggered; ~720ms for all 9 (skippable). |
| Controls | Step through the 9 multiplications, or auto. |
| Math beside | pᵢⱼ × kᵢⱼ shown per cell; highlight sign (negative products in a cool hue). |
| Performance | Only 9 cells — SVG/DOM is fine here. |

### Stage 6 — Sum + bias → feature map cell

| Visual goal | Show 9 products collapsing into one number, then placed in the map. |
| --- | --- |
| User sees | The 9 product cells fly into a single accumulator; "+ bias" appears; result drops into the feature map at (i,j). |
| Moves | Products converge to center; the summed value travels to its output-grid position. |
| Glows | Accumulator glows as it sums; destination cell flashes on arrival. |
| Fades | Product cells fade after merging. |
| Timing | ~500ms converge + ~250ms travel. |
| Controls | Tied to Stage 4/5 stepper. |
| Math beside | z = Σ₉ (p⊙k) + b; (pre-activation, before ReLU). |
| Performance | Single traveling element; cheap. |

### Stage 7 — Multiple filters → multiple feature maps

| Visual goal | Show depth: one image, many filters, many maps. |
| --- | --- |
| User sees | 8 feature maps fan out / stack into a 26×26×8 volume; each lights up with its own pattern. |
| Moves | Maps slide into a stacked "deck"; user can fan them out. |
| Glows | Each map's strong activations glow; selected map brightens. |
| Fades | Unselected maps dim to ~50%. |
| Timing | ~600ms fan-out, staggered per map. |
| Controls | Click a map to inspect; "show first 8" default; channel selector. |
| Math beside | output depth = number of filters; shape 26×26×8. |
| Performance | Render maps as canvas thumbnails; lazy-render non-visible channels. |

### Stage 8 — ReLU: negatives → zero

| Visual goal | Show non-linearity physically clipping negatives. |
| --- | --- |
| User sees | A feature map where negative (cool-hued) cells drain to zero/black while positives stay. |
| Moves | Negative cells animate value → 0 (color collapses to background); a small ReLU graph draws its hinge. |
| Glows | Surviving positive cells briefly brighten. |
| Fades | Negatives fade out to zero state. |
| Timing | ~600ms sweep across the map. |
| Controls | Toggle before/after; replay. |
| Math beside | ReLU(x) = max(0, x); plot of the hinge. |
| Performance | Canvas recolor; avoid per-cell DOM transitions on large maps. |

### Stage 9 — MaxPool 2×2 selection

| Visual goal | Show downsampling that keeps the strongest signal. |
| --- | --- |
| User sees | A 2×2 window steps with stride 2; the max cell highlights and jumps into a smaller output grid. |
| Moves | Window steps; max value travels to the shrunk map. |
| Glows | The winning (max) cell glows; the 3 losers dim. |
| Fades | Non-max cells fade as the window leaves. |
| Timing | Step-driven ~150ms/window. |
| Controls | Play / Step / scrub. |
| Math beside | out = max(2×2 region); 26×26 → 13×13. |
| Performance | Same frame-move pattern as convolution. |

### Stage 10 — Flatten → vector

| Visual goal | Show 3D volume unrolling into a 1D line. |
| --- | --- |
| User sees | The 5×5×16 volume unstacks and its cells line up into a long 400-length strip. |
| Moves | Cells peel off and snap into a single row using layout animation. |
| Glows | The forming vector shimmers left→right as it fills. |
| Fades | Source volume fades once unrolled. |
| Timing | ~900ms; cap animated cells (animate a representative subset if 400 is too heavy). |
| Controls | Replay; hover a vector cell to trace it back to its map location. |
| Math beside | 5×5×16 = 400; row-major order note. |
| Performance | 400 layout-animated nodes is the danger zone — animate a subset, render rest static. |

### Stage 11 — Dense layer signal flow

| Visual goal | Show the vector feeding weighted connections into neurons. |
| --- | --- |
| User sees | The 400-vector connects (sampled subset of lines) to 64 neurons, then to 10 outputs; signal pulses travel the lines. |
| Moves | Light pulses flow along edges; neuron nodes brighten by activation. |
| Glows | Strongly activated neurons glow hotter. |
| Fades | Weak connections render faint/translucent. |
| Timing | ~1s flowing pulse loop (pausable). |
| Controls | Toggle: show all (faint) vs top-k connections. |
| Math beside | a = ReLU(Wx + b); note this is a *simplified, sampled* wiring view. |
| Performance | Never draw all 400×64 lines fully opaque — sample + use canvas/WebGL if needed. |

### Stage 12 — Softmax probability reveal

| Visual goal | Show raw scores becoming a probability distribution. |
| --- | --- |
| User sees | 10 logits normalize; bars for 0–9 grow to their probabilities; the winner bar surges and locks. |
| Moves | Bars animate height/width to final value; percentages count up. |
| Glows | Winning digit's bar glows; others muted. |
| Fades | Logit numbers fade as probabilities fade in. |
| Timing | ~800ms grow + count-up. |
| Controls | Hover a bar for exact probability; replay. |
| Math beside | softmax(z)ᵢ = e^{zᵢ} / Σⱼ e^{zⱼ}; sums to 1. |
| Performance | 10 bars — trivial. |

### Stage 13 — Final prediction explanation

| Visual goal | Land the conclusion + honest caveat. |
| --- | --- |
| User sees | Large predicted digit + confidence %, with a one-line "why" and a "why it might be wrong" note. |
| Moves | Predicted digit scales in; confidence ring fills. |
| Glows | Confidence ring glows proportional to certainty. |
| Fades | Pipeline dims to spotlight the result. |
| Timing | ~500ms. |
| Controls | "Run again" / "Try another digit". |
| Math beside | argmax of softmax; confidence = max probability. |
| Performance | Trivial. |

---

# 4. Inspired Storytelling Structure (Interactive Lesson)

<aside>
📖

The app is a lesson with chapters. Each chapter answers one question in three registers and ends with something the user *does*. This is the spine that turns a demo into an explanation.

</aside>

## Q1 — What does the CNN see?

- **Plain:** Not a picture — a grid of brightness numbers.
- **Math:** A tensor of shape [1, 28, 28, 1], values in [0,1].
- **Visual:** Image dissolves into the 28×28 number grid (Stage 2).
- **Interactive:** Hover cells to read their values.

## Q2 — Why does the image become numbers?

- **Plain:** Computers only do math; brightness becomes numbers it can multiply.
- **Math:** Grayscale intensity → normalized float; 784 values.
- **Visual:** Photographic → quantized grid transition.
- **Interactive:** Toggle "picture vs numbers".

## Q3 — What does a kernel actually do?

- **Plain:** A tiny pattern-detector that scans for one feature (like an edge).
- **Math:** output(i,j) = Σ patch⊙kernel + b.
- **Visual:** Kernel slides; patch×kernel; sum+bias → cell (Stages 4–6).
- **Interactive:** Step the kernel; watch one output cell compute.

## Q4 — Why do filters create depth?

- **Plain:** Each filter looks for a different feature, so you get a stack of maps.
- **Math:** N filters → output depth N (26×26×8).
- **Visual:** Maps fan out into a volume (Stage 7).
- **Interactive:** Select different filters and compare what each detects.

## Q5 — Why does ReLU matter?

- **Plain:** Without it, stacking layers is just one big linear function — no real learning power.
- **Math:** ReLU(x)=max(0,x); introduces non-linearity.
- **Visual:** Negatives collapse to zero (Stage 8).
- **Interactive:** Toggle before/after ReLU.

## Q6 — Why does pooling reduce size?

- **Plain:** Keep the strongest signal, drop detail, get cheaper and more robust.
- **Math:** max over 2×2; 26×26 → 13×13.
- **Visual:** Window picks the max, grid shrinks (Stage 9).
- **Interactive:** Step the pooling window.

## Q7 — Why flatten?

- **Plain:** Dense layers want a single list of numbers, not a 3D block.
- **Math:** 5×5×16 → 400-vector.
- **Visual:** Volume unrolls into a strip (Stage 10).
- **Interactive:** Hover a vector cell to trace its origin.

## Q8 — What does the dense layer do?

- **Plain:** Combines all features to weigh evidence for each digit.
- **Math:** a = ReLU(Wx+b), then logits for 10 classes.
- **Visual:** Signal flows through sampled connections (Stage 11).
- **Interactive:** Toggle top-k connections.

## Q9 — Why does softmax give probabilities?

- **Plain:** Turns raw scores into confidences that add up to 100%.
- **Math:** softmax(z)ᵢ = e^{zᵢ}/Σ e^{zⱼ}.
- **Visual:** Bars grow to probabilities (Stage 12).
- **Interactive:** Hover bars for exact values.

## Q10 — Why can the model still be wrong?

- **Plain:** It only learned from MNIST-style digits; weird strokes, thickness, or centering confuse it.
- **Math:** Distribution shift — your input differs from training data.
- **Visual:** Show a misclassified example + its (wrong) confident bars.
- **Interactive:** "Break the model" challenge: draw something to fool it.

<aside>
🧩

Q10 is the honesty chapter and the most memorable one — letting users *try to fool the model* teaches generalization better than any paragraph. Keep it.

</aside>

---

# 5. Technical Architecture for Premium Animation

| Tech | Use it for | Don't use it for | Complexity | Performance | Fit |
| --- | --- | --- | --- | --- | --- |
| SVG | Crisp small grids, kernel frames, connection lines, axis/graphs (ReLU plot) | Hundreds+ animated nodes (flatten, dense full wiring) | Low | Good at low node counts, degrades past ~1–2k nodes | ✅ Core for most stage visuals |
| Canvas 2D | Feature map heatmaps, 28×28 intensity grid, large recolor sweeps (ReLU) | Rich per-element interactivity/hit-testing | Medium | Excellent for many cells | ✅ Core for pixel/feature-map rendering |
| HTML/CSS animations | Simple UI transitions, hovers, fades, bars | Coordinated multi-step data sequences | Low | Great (GPU compositing) | ✅ For chrome/UI |
| Framer Motion | Layout/enter-exit transitions, staggered reveals, shared-layout (flatten morph), orchestration | Per-frame numeric simulations on thousands of nodes | Medium | Good; watch node counts | ✅ Primary orchestration layer |
| GSAP | Precise timelines, scrubbable sequences, fine easing control | Overkill if Framer already covers it | Medium | Excellent | ⚠️ Optional — add only if Framer timelines feel limiting |
| Rive | Pre-authored interactive vector animations (mascots, decorative loops) | Data-driven animations bound to live tensor values | Medium (external tool) | Excellent | ❌ Skip — our animations must reflect real data, not pre-baked |
| Manim clips | Pre-rendered intro/explainer video snippets | Anything interactive or input-dependent | High (Python pipeline) | N/A (video) | ⚠️ Optional v2 — nice for a README/demo intro, not in-app interactivity |
| WebGL / Three.js | Dense-layer particle/signal flow, 3D feature-volume, thousands of points | Simple 2D grids (overkill, slow to build) | High | Best for massive node counts | ⚠️ v2 for the cinematic dense/flatten scenes only |

## Recommended final stack

<aside>
🏛️

**v1 stack:** **Framer Motion** (orchestration + layout morphs) + **Canvas 2D** (pixel grids & feature maps) + **SVG** (kernel frames, lines, math plots) + **Tailwind/CSS** (UI chrome). This trio covers all 13 stages cleanly without heavy dependencies.

**Add later only if needed:** **GSAP** if you want a master scrubbable timeline; **WebGL/Three.js** for the v2 cinematic dense-layer/flatten scenes; **Manim** clips for a README intro video.

</aside>

**Architectural rule:** every data-driven animation is a pure function of `(activationData, stepIndex)`. A single `useTimeline` hook owns play/pause/step/scrub and emits `stepIndex`; components just render the current frame. This keeps motion deterministic, debuggable, and scrubbable — and lets you swap the rendering tech per stage without touching the logic.

---

# 6. Revised File Structure

```
cnn-digit-lab/
├── public/
│   ├── model/                  # model.json + weight shards
│   └── samples/                # sample digit images
├── docs/                       # design docs, animation bible, ADRs
│   ├── animation-bible.md
│   ├── architecture.md
│   └── launch-checklist.md
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── scenes/                 # full-screen orchestrated lesson scenes
│   │   ├── LessonShell.tsx     # chapter navigation + timeline
│   │   ├── IntroScene.tsx
│   │   └── PredictionScene.tsx
│   ├── stages/                 # one folder per pipeline stage (1 of 13)
│   │   ├── DrawingStage/
│   │   ├── TensorGridStage/
│   │   ├── ConvolutionStage/
│   │   ├── ReluStage/
│   │   ├── PoolingStage/
│   │   ├── FlattenStage/
│   │   ├── DenseStage/
│   │   └── SoftmaxStage/
│   ├── components/             # reusable presentational UI
│   │   ├── ui/                 # buttons, cards, badges, ModeToggle
│   │   ├── TimelineStepper.tsx
│   │   ├── ShapeBadge.tsx
│   │   └── FeatureMapGrid.tsx
│   ├── animations/             # motion primitives & presets
│   │   ├── transitions.ts      # easing curves, durations, variants
│   │   ├── useTimeline.ts      # play/pause/step/scrub -> stepIndex
│   │   ├── KernelFrame.tsx
│   │   └── SignalFlow.tsx
│   ├── canvas/                 # canvas renderers (perf-critical)
│   │   ├── PixelGridRenderer.ts
│   │   ├── FeatureMapRenderer.ts
│   │   └── heatScale.ts
│   ├── ml/                     # all model logic
│   │   ├── loadModel.ts
│   │   ├── preprocess.ts
│   │   ├── activationModel.ts
│   │   ├── runInference.ts
│   │   └── memory.ts           # tf.tidy / dispose helpers
│   ├── math/                   # pure math + formula rendering
│   │   ├── convolution.ts      # reference impl for animation values
│   │   ├── pooling.ts
│   │   ├── softmax.ts
│   │   └── formulas.tsx        # KaTeX formula components
│   ├── explanations/           # teaching content
│   │   ├── beginner.ts
│   │   ├── math.ts
│   │   └── exam.ts
│   ├── hooks/
│   │   ├── useLabStore.ts      # Zustand store
│   │   ├── useModel.ts
│   │   └── useReducedMotion.ts
│   ├── assets/                 # icons, fonts, static svg
│   ├── types/
│   │   └── cnn.ts
│   └── styles/
│       └── index.css
├── testing/                    # tests live mirrored to src
│   ├── ml/preprocess.test.ts
│   ├── math/softmax.test.ts
│   └── e2e/predict.spec.ts     # Playwright smoke test
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

# 7. Build Roadmap for the Real Public Version

<aside>
🧭

Strict, phased, and it does **not** stop at MVP. Each phase has a goal, tasks, acceptance criteria, failure modes, and a copy-paste coding-agent prompt. Do them in order; ship each phase to a branch and verify before moving on.

</aside>

## Phase 0 — Visual reference & design direction

- **Goal:** Lock the Tensor Aurora look before coding visuals.
- **Tasks:** Define palette (aurora gradient: deep indigo → violet → teal → mint highlight), type scale, motion tokens (durations/easings), heat scale for activations. Build a one-page style tile.
- **Acceptance:** A documented design-tokens file + a static mockup of the 3-zone layout approved by you.
- **What can go wrong:** Skipping this → inconsistent visuals later. Over-designing → analysis paralysis.
- **Prompt:**

```
Create a design-tokens module (src/styles/tokens.ts + CSS variables) for a theme called
"Tensor Aurora": a dark UI with an aurora gradient accent (deep indigo -> violet -> teal
-> mint highlight). Define color tokens, an activation heat scale (low->high), spacing,
type scale, and motion tokens (durations + easing cubic-bezier values). Then build a
static StyleTile.tsx page showcasing buttons, cards, a shape badge, and a sample
feature-map heat gradient. No app logic yet.
```

## Phase 1 — Internal MVP pipeline

- **Goal:** Prove draw → preprocess → predict → softmax works.
- **Tasks:** Vite+React+TS+Tailwind scaffold, DrawCanvas, rough preprocess, load model, predict, basic softmax bars.
- **Acceptance:** Drawing a clean digit returns correct top-1 most of the time (console + minimal UI).
- **What can go wrong:** Wrong color polarity (MNIST is white-on-black); wrong tensor shape.
- **Prompt:**

```
Scaffold a Vite react-ts app "cnn-digit-lab" with Tailwind, Zustand, @tensorflow/tfjs,
framer-motion. Build DrawCanvas (280x280, mouse+touch, white-on-black, Clear+Run).
Add src/ml/preprocess.ts (grayscale -> 28x28 -> normalize 0-1 -> tf.tensor4d [1,28,28,1]),
src/ml/loadModel.ts (load /model/model.json, log layer names + summary), and
src/ml/runInference.ts (predict, argmax, confidence, dispose tensors). Wire Run to show
the predicted digit and 10 raw softmax bars. Keep it minimal; this is an internal checkpoint.
```

## Phase 2 — Preprocessing correctness

- **Goal:** Make it accurate on *your own* messy drawings.
- **Tasks:** Bounding-box crop, center-of-mass shift, padding, MNIST-matched resize; debug view rendering the 28×28 back to screen.
- **Acceptance:** Clear, measurable accuracy improvement on hand-drawn digits vs Phase 1.
- **What can go wrong:** Over-thinning strokes; off-by-one in centering; mismatched normalization mean/std.
- **Prompt:**

```
Upgrade src/ml/preprocess.ts to mimic MNIST preprocessing: threshold to find the digit's
bounding box, crop, resize the longest side to 20px, paste into a 28x28 canvas, then shift
so the center of mass is centered. Keep normalization to 0-1. Add a DebugPreview component
that renders the final 28x28 tensor back to the screen so I can visually verify orientation,
polarity, and centering. Add a unit test for the centroid-shift math.
```

## Phase 3 — Activation extraction

- **Goal:** Real intermediate activations from the model.
- **Tasks:** Build multi-output activation model from real layer names; return {layerName, shape, values}; dispose tensors; store in Zustand.
- **Acceptance:** `tf.memory().numTensors` stable across repeated runs; shapes match summary.
- **What can go wrong:** Hardcoded wrong layer names; memory leaks.
- **Prompt:**

```
Create src/ml/activationModel.ts that builds a tf.model multi-output activation model from
the loaded LayersModel, reading REAL layer names from model.layers (log them; do not hardcode
guesses). Update runInference to return an array of { layerName, shape, values } for the conv,
pool, and dense layers, disposing every intermediate tensor. Store results in the Zustand store
(src/hooks/useLabStore.ts). Add a dev overlay showing tf.memory().numTensors to confirm no leaks.
```

## Phase 4 — Feature map viewer

- **Goal:** Show real conv activations beautifully.
- **Tasks:** Canvas heat renderer (Tensor Aurora scale), first-8 default + channel selector, shape labels.
- **Acceptance:** Map count == filter count; selecting channels updates instantly; 60fps on scroll.
- **What can go wrong:** 784/large maps as DOM nodes → jank. Use canvas.
- **Prompt:**

```
Create src/canvas/FeatureMapRenderer.ts and src/components/FeatureMapGrid.tsx. Render each
feature map channel to a small canvas using the Tensor Aurora heat scale (src/canvas/heatScale.ts).
Show the first 8 channels by default with a channel selector for the rest. Label each grid with
layer name and shape (e.g. 26x26x8). Pull data from the Zustand activations. Ensure smooth
performance by rendering to canvas, not per-cell DOM.
```

## Phase 5 — Animation engine foundation

- **Goal:** The deterministic motion system everything else uses.
- **Tasks:** `useTimeline` hook (play/pause/step/reset/speed/scrub → stepIndex), motion tokens, reduced-motion support, a TimelineStepper UI.
- **Acceptance:** A throwaway demo animates a value purely from stepIndex; scrubbing works; reduced-motion shows instant states.
- **What can go wrong:** Time-based animations that can't scrub; ignoring reduced-motion.
- **Prompt:**

```
Create src/animations/useTimeline.ts: a hook managing { stepIndex, isPlaying, speed } with
play/pause/step/reset/seek actions and an internal rAF loop that advances stepIndex at the
chosen speed. Add src/hooks/useReducedMotion.ts and src/animations/transitions.ts (shared
easing + duration tokens + framer variants). Build components/TimelineStepper.tsx with
play/pause/step/reset and a scrubber bound to a totalSteps prop. Demo it animating a single
value purely as a function of stepIndex.
```

## Phase 6 — Convolution cinematic stage

- **Goal:** The centerpiece: sliding kernel, multiply, sum+bias → map (Stages 4–6).
- **Tasks:** KernelFrame over canvas grid, 3×3 multiply panel (SVG), accumulator+bias, output fill; all keyed to stepIndex; formulas beside.
- **Acceptance:** Stepping advances exactly one kernel position; output cell matches a reference math impl; smooth at default speed.
- **What can go wrong:** Re-rendering the whole grid per step; mismatch between animation and real math.
- **Prompt:**

```
Build stages/ConvolutionStage. Use a canvas-rendered input grid with an SVG KernelFrame that
moves one stride per stepIndex (from useTimeline). At each step show a side SVG panel of the
3x3 patch x kernel multiplication, then sum + bias, then fill the corresponding output-map cell.
Compute values with src/math/convolution.ts (reference impl) so the animation matches real math.
Show the formula output(i,j)=sum(patch*kernel)+b and the shape note 28->26 beside it. Only move
the frame and update one output cell per step; do not re-render the whole grid.
```

## Phase 7 — ReLU / pooling / flatten stages

- **Goal:** Stages 8–10 animated.
- **Tasks:** ReLU recolor sweep + hinge plot; pooling window + max travel; flatten unroll (animate subset, render rest static).
- **Acceptance:** ReLU zeroes negatives correctly; pooling output == max of each window and halves dims; flatten vector length 400 with no jank.
- **What can go wrong:** Flatten animating 400 layout nodes → jank.
- **Prompt:**

```
Build three stages reusing useTimeline. (1) stages/ReluStage: animate negative feature-map cells
collapsing to zero on a canvas, with an SVG plot of ReLU(x)=max(0,x). (2) stages/PoolingStage:
a 2x2 stride-2 window stepping over a map, highlighting the max and sending it to a smaller
output grid; values from src/math/pooling.ts. (3) stages/FlattenStage: morph a 5x5x16 volume into
a 400-length vector using framer layout animations, but animate only a representative subset of
cells and render the rest static for performance. Add shape labels and captions to each.
```

## Phase 8 — Dense / softmax stage

- **Goal:** Stages 11–13.
- **Tasks:** Sampled signal-flow (SVG or canvas), softmax bars with count-up, final prediction + confidence ring + honesty note.
- **Acceptance:** Bars sum ~1, winner == argmax; connection view labeled as simplified; no full 400×64 opaque draw.
- **What can go wrong:** Drawing all dense connections → unreadable + slow.
- **Prompt:**

```
Build stages/DenseStage and stages/SoftmaxStage. DenseStage: visualize the 400-vector connecting
through 64 neurons to 10 outputs using a SAMPLED subset of connection lines with animated signal
pulses; brighten neurons by activation; label it "simplified view". SoftmaxStage: animate 10
probability bars growing to their values with counting percentages, highlight the argmax, and show
a large predicted digit with a confidence ring. Add a short "why it might be wrong" note. Use real
activation + probability data from the store.
```

## Phase 9 — Teaching modes

- **Goal:** Beginner / Math / Exam everywhere.
- **Tasks:** explanations/{beginner,math,exam}.ts keyed by stage; ModeToggle; ExplanationPanel reads mode + current stage.
- **Acceptance:** Switching mode changes text for every stage; no empty strings.
- **What can go wrong:** Missing entries for some stage/mode combo.
- **Prompt:**

```
Create src/explanations/{beginner,math,exam}.ts as records keyed by stage id, each with text for
all 13 stages (no gaps). Build components/ModeToggle.tsx (beginner|math|exam) writing to the
Zustand store, and components/ExplanationPanel.tsx that renders the correct text for the current
stage + mode. Math mode should render formulas with KaTeX (src/math/formulas.tsx). Add a test
that asserts every stage has all three modes populated.
```

## Phase 10 — Polish, performance, responsive

- **Goal:** Premium feel, smooth, works across screens.
- **Tasks:** 60fps audit, memoization, lazy stage mounting, responsive 3-zone → stacked layout, reduced-motion paths, empty/error states.
- **Acceptance:** No dropped frames on mid-tier laptop; usable on tablet; phone gracefully stacks.
- **What can go wrong:** Animations fighting React re-renders; layout breaking on small screens.
- **Prompt:**

```
Do a performance and responsiveness pass. Lazy-mount only the active stage, memoize heavy
components, and ensure canvas renderers don't re-run on unrelated state changes. Make the 3-zone
layout responsive: side-by-side on desktop, stacked on tablet/phone with the timeline becoming a
horizontal scroller. Honor prefers-reduced-motion by showing final states instantly. Add loading,
empty, and error states for model load and inference. Verify 60fps with the React Profiler.
```

## Phase 11 — README, screenshots, demo video, deployment

- **Goal:** Make it shareable and live.
- **Tasks:** README with GIFs/screenshots + live link; capture a short demo; deploy (GitHub Pages or Vercel) with correct base path.
- **Acceptance:** Live demo loads + predicts; README renders media; base-path assets resolve.
- **What can go wrong:** GitHub Pages base path → model 404s; huge unoptimized GIFs.
- **Prompt:**

```
Write a polished README.md (title, live demo link, animated GIF, features, tech stack, how it
works, CNN architecture table, local setup, deployment, roadmap, known limitations, license).
Configure deployment: for GitHub Pages set vite base to "/cnn-digit-lab/", add a gh-pages deploy
script, ensure public/model ships in the build, and use a base-aware fetch path for model.json.
Document the Vercel path too. List exact commands to capture and compress demo GIFs.
```

## Phase 12 — Public launch checklist

- **Goal:** Decide, deliberately, that it's ready.
- **Tasks:** Run Section 8 checklist; fix blockers; tag v1.0.0.
- **Acceptance:** Every Section 8 item checked; GitHub release tagged.
- **What can go wrong:** Shipping with a known broken control or fake placeholder.
- **Prompt:**

```
Run through the launch checklist in docs/launch-checklist.md. For each unchecked item, create a
GitHub issue with a clear acceptance criterion. Once all are green, bump version to 1.0.0, write
release notes summarizing features and known limitations, and tag the release.
```

---

# 8. Public Launch Checklist

<aside>
🚦

Do not publish until **every** box is checked. A single fake placeholder or broken control breaks the "premium" promise.

</aside>

## UX

- [ ]  Clear entry point; user knows to draw and hit Run within 5 seconds.
- [ ]  Every control does something real (no dead buttons).
- [ ]  Stage navigation is obvious; user can replay/scrub.

## ML correctness

- [ ]  Correct top-1 on clean hand-drawn digits (spot-check 0–9).
- [ ]  Activations are real (verified shapes vs `model.summary()`).
- [ ]  Softmax bars sum to ~1 and winner == argmax.

## Animation smoothness

- [ ]  60fps on a mid-tier laptop for every stage.
- [ ]  No layout thrash; scrubbing is smooth.
- [ ]  `prefers-reduced-motion` path verified.

## Educational clarity

- [ ]  All 13 stages have Beginner/Math/Exam text (no gaps).
- [ ]  Formulas render correctly.
- [ ]  "Why it can be wrong" chapter present.

## Performance

- [ ]  Initial load (incl. model) acceptable; loading state shown.
- [ ]  `tf.memory().numTensors` stable across repeated runs (no leak).
- [ ]  Bundle size reasonable; assets compressed.

## Mobile responsiveness

- [ ]  Tablet layout fully usable.
- [ ]  Phone gracefully stacks; canvas + bars readable.

## README quality

- [ ]  Live demo link at top.
- [ ]  Animated GIF/screenshots of key stages.
- [ ]  Setup, deployment, architecture, limitations, license.

## GitHub repo polish

- [ ]  Clean commit history / sensible structure.
- [ ]  LICENSE file (MIT).
- [ ]  No secrets, no dead TODOs in shipped code.
- [ ]  Issues/roadmap visible.

## Demo link

- [ ]  Deployed, loads model, predicts on first try.
- [ ]  Correct base-path asset loading.

## Screenshots / GIFs

- [ ]  Convolution, feature maps, softmax captured.
- [ ]  Compressed (no 30MB GIFs).

## Known limitations

- [ ]  Honestly documented (MNIST-style only, can misclassify unusual strokes, desktop-first, simplified dense view).

---

# 9. AI / Tool Stack

| Stage | Tool | Why / use it for | Don't use it for | Essential? |
| --- | --- | --- | --- | --- |
| Planning | This Notion doc + ChatGPT/Claude | Break work into phases, refine scope, draft tickets | Don't let it invent ML facts — verify shapes in code | Essential |
| UI design | Figma (+ optional AI plugins) | Lay out the 3-zone UI, design tokens, the Tensor Aurora style tile | Don't pixel-perfect every screen before coding; don't export messy auto-code | Recommended |
| Frontend coding | Cursor or VS Code + Claude/Copilot | Implement components phase-by-phase via the prompts above | Don't "build everything in one shot"; small focused prompts only | Essential |
| ML model training | Python + Keras (Colab) → tfjs-converter | Train MNIST CNN offline, convert to TF.js LayersModel | Don't train in the browser | Essential |
| Animation design | Framer Motion (code) + Figma for storyboards | Prototype motion, define easing/timing | Don't author data-driven animations in a no-code tool | Essential (Framer) |
| Mathematical animation | Manim (optional) | Pre-rendered explainer clips for README/intro | Don't use for interactive in-app stages | Optional |
| Debugging | Browser DevTools + React Profiler + tf.memory() | Find leaks, re-render storms, fps drops | Don't rely on console.log alone for perf | Essential |
| Testing | Vitest (unit) + Playwright (e2e smoke) | Test preprocess/softmax math; smoke-test predict flow | Don't aim for 100% coverage on animations | Recommended |
| Deployment | Vercel or GitHub Pages + gh-pages | Host the live demo | Watch base path on Pages | Essential |
| README / demo | ScreenStudio / Kap / ffmpeg + ChatGPT for copy | Capture + compress GIFs, draft README prose | Don't ship uncompressed multi-MB GIFs | Recommended |

<aside>
🧰

**Minimum essential set to actually ship v1:** Colab+Keras (train), Cursor/VS Code + an AI assistant (build), Framer Motion + Canvas + SVG (animate), Vitest+Playwright (verify), Vercel (deploy), ffmpeg/Kap (demo GIFs). Everything else is optional polish.

</aside>

---

# 10. Strict Guidance — The Path Without Getting Lost

<aside>
🛞

I'm keeping your dream intact — the public v1 *is* the animated, premium, educational product, not a stripped MVP. But there's exactly one way to get there without drowning, and it's about **order and discipline**, not ambition.

</aside>

## The three-tier mental model (hold all three at once)

- **Internal MVP** = private proof the ML works. Ugly is fine. Never published.
- **Public Release v1** = the real product. Animated, clear, honest, deployed. This is what you share.
- **Dream v2** = cinematic upgrade (WebGL scenes, narration, deep-links). Only after v1 has real users.

## The non-negotiable order

The single biggest risk is building beautiful animations on top of a pipeline that doesn't actually predict your drawings. So:

1. **Phases 1–3 first, always.** Prediction + preprocessing + real activations. *Nothing visual is allowed to block these.*
2. **Phase 4 (feature maps) is your motivation reward** — the first time it looks impressive, and it validates activation extraction.
3. **Phase 5 (animation engine) before any cinematic stage.** Build the `stepIndex` system once; every stage reuses it. Skipping this = rewriting animations five times.
4. **Then Phases 6–8** add the cinematic stages one at a time. Convolution first (it's the centerpiece and the hardest — if you can do it, the rest are variations).
5. **Phases 9–12** make it teach, perform, and ship.

## Strict rules to not get lost

- **One stage at a time, fully done, before the next.** "Fully done" = real data + animation + all 3 explanation modes + responsive.
- **Never animate before the underlying number is real.** Every animation must reflect actual activation/math values, with simplifications explicitly labeled.
- **Label every simplification.** The sampled dense connections and representative kernel weights must say "simplified view" — honesty *is* the educational value.
- **Keep the model tiny.** 8/16 filters is correct. Resist "upgrading" it; bigger = slower animations and no teaching benefit.
- **Protect the MVP boundary.** Don't polish MVP code into v1; rebuild deliberately on proven plumbing.
- **Timebox the design phase (Phase 0).** A style tile and tokens, then move. Don't redesign forever.

## What "good enough to publish" actually means

When Section 8's checklist is fully green *and* a friend who doesn't know CNNs can use it and explain back to you what a kernel does — that's the bar. Not "every feature I imagined," but "every shipped feature is real, smooth, and teaches." Ship v1 at that line; pour the rest into v2.

<aside>
✅

**Bottom line:** Your dream is the target, not a reduced MVP. Reach it by being ruthless about *order*: prove the ML (1–3), reward yourself with feature maps (4), build the animation engine once (5), then add cinematic stages one-by-one (6–8), make it teach and perform (9–10), and ship deliberately against the checklist (11–12). Keep every animation tied to real data, label every simplification, and never let a beautiful frame hide a broken pipeline.

</aside>