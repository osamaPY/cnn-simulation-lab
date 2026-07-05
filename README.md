# CNN Simulation Lab: How Machines "See"

[**Live demo**](https://cnn-simulation-psi.vercel.app)

A browser-based interactive lab to demystify Convolutional Neural Networks (CNNs). Draw a digit, then follow how a real CNN transforms your pixels into feature maps, activations, and final class probabilities: all running client-side with TensorFlow.js.

---

## Features

- **Draw and classify**: Freehand digits on a canvas, then run real-time inference in the browser.
- **Step-by-step stages**: Walk through preprocessing, convolution, ReLU, pooling, flattening, dense layers, softmax, and final prediction.
- **Activation visualizations**: Inspect intermediate feature maps and class probabilities to see what each layer "looks at".
- **Educational controls**: Adjust kernel size, stride, padding, and pooling settings for the *visual explanations* (the underlying CNN model remains fixed).
- **No backend required**: All inference happens locally using TensorFlow.js; no external APIs or servers.

---

## Tech stack

- React + TypeScript (Vite)
- Tailwind CSS
- TensorFlow.js (browser inference)
- Zustand (state management)
- Playwright (end-to-end tests)
- Deployed on Vercel

---

## Architecture

High-level flow:

1. **Canvas input**: User draws a digit using mouse or touch.
2. **Preprocessing**: The drawing is:
   - Converted to grayscale.
   - Cropped to the ink bounding box.
   - Resized to fit a 20×20 region.
   - Placed into a 28×28 canvas.
   - Centered by center-of-mass.
   - Normalized to values in [0, 1].
3. **Model inference**: A small CNN (Conv2D → MaxPool → Conv2D → MaxPool → Flatten → Dense → Dense softmax) is loaded from `public/model/model.json` and run client-side.
4. **Activation extraction**: A multi-output model exposes intermediate activations from convolution, pooling, and dense layers.
5. **Stage UI**: The UI guides the user through each CNN stage and renders activations, explanations, and probabilities.

For deeper details, see the docs in `docs/` and the research scripts in `research/`.

---

## Installation & local development

```bash
# 1. Clone and install
git clone https://github.com/osamaPY/cnn_simulation.git
cd cnn_simulation
npm install

# 2. Start the app
npm run dev
```

End-to-end tests (Playwright):

```bash
npm run test:e2e
```

Python research utilities (training / pure-NumPy explanations):

```bash
cd research
python -m venv venv
source venv/bin/activate   # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
python explain_cnn.py
```

---

## Model card

See `docs/model-card.md` for:

- Dataset and preprocessing assumptions.
- Architecture and training setup.
- Intended use (education / visualization) and limitations.

---

## What I learned building this

- Turning freehand canvas input into a robust MNIST-style tensor via cropping, centering, and normalization.
- Running a CNN completely in the browser using TensorFlow.js, including model loading and caching.
- Extracting and visualizing intermediate activations to make CNNs more explainable.
- Designing a guided, stage-based UI to teach deep learning concepts interactively.

---

## Contributions

Feedback and contributions are welcome. If you have ideas for clearer visualizations, new stages, or better tests, feel free to open an issue or pull request.
