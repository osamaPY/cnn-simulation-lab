# CNN Visual Lab: How Machines "See"

[**Explore the Live Demo**](https://cnn-simulation-psi.vercel.app)

I developed this project to demystify the "black box" nature of Convolutional Neural Networks (CNNs). By visualizing underlying mathematical transformations in real-time, this laboratory demonstrates how raw pixel data from a hand-drawn digit is processed and classified through hierarchical layers of abstraction.

Everything runs directly in the browser using **TensorFlow.js**. All inference is performed client-side, requiring no server-side processing or external APIs.

---

## Key Features

- **Real-Time Visualization**: Watch as your hand-drawn digits are transformed into feature maps and probability distributions.
- **Hierarchical Depth**: Explore every stage of a CNN, from initial spatial normalization to final softmax classification.
- **Mathematical Transparency**: View the actual kernels, activation values, and formulas (LaTeX) driving each layer's decision.
- **Interactive Probing**: Hover over individual pixels and feature maps to inspect raw numerical activations.
- **Research Module**: Includes pure NumPy implementations of core algorithms for educational deep-dives.

---

## Technical Overview

### 1. Interactive Pipeline
Users can trace a digit through the entire classification process:
- **Input Normalization**: Centering and scaling raw drawings for translation and scale invariance.
- **Convolutional Layers**: Feature extraction identifying local patterns (edges, textures).
- **ReLU Activation**: Non-linear filtering to emphasize significant signals.
- **Max Pooling**: Spatial downsampling to retain critical features while reducing dimensionality.
- **Dense Layers**: High-level feature integration for global context.
- **Softmax**: Conversion of raw logits into an interpretable probability distribution.

### 2. Research & Documentation (`/docs`)
The repository includes a dedicated research module and documentation for deep-dives into the implementation:
- `research/explain_cnn.py`: A step-by-step algorithmic walkthrough implemented in pure `numpy`.
- `research/train_mnist.py`: The Keras training script used to generate the production model.
- `docs/research/`: Technical guides on training and optimizing models for TensorFlow.js.

---

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS.
- **Animations**: Framer Motion for high-fidelity interactive flows.
- **Machine Learning**: TensorFlow.js (Inference), Keras/Python (Training).
- **Deployment**: Vercel.

---

## Local Development

To run the project locally:

```bash
# 1. Clone and Install
git clone https://github.com/osamaPY/cnn-visual-lab.git
cd cnn-visual-lab
npm install

# 2. Start the Application
npm run dev
```

To use the Python training utilities:
```bash
cd research
python -m venv venv
source venv/bin/activate # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
python explain_cnn.py
```

---

## Contributions
Feedback and contributions are welcome. If you encounter an issue or have suggestions for enhanced visualizations, please feel free to open a pull request.

*Developed with a focus on educational clarity and matrix mathematics.*
