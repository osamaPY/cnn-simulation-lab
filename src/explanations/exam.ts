import type { ExplanationContent } from './index';

export const examExplanations: Record<number, ExplanationContent> = {
  1: {
    headline: "Spatial Normalization",
    body: "Translation and scaling ensure input scale-invariance and translation-invariance.",
    interactiveGoal: "Learn: Centering centroid at (14, 14) prevents spatial shift errors.",
    keyTakeaway: "Ensures uniform input presentation."
  },
  2: {
    headline: "Min-Max Grayscale Scaling",
    body: "Grayscale pixels are normalized to [0, 1] by dividing by 255.0 to prevent gradient instability.",
    interactiveGoal: "Understand: Standard scaling speeds up model convergence.",
    keyTakeaway: "Maintains numerical stability."
  },
  3: {
    headline: "Tensor Shapes & Rank",
    body: "Batch image input tensor is 4D of shape [Batch, Height, Width, Channels]. Single input: [1, 28, 28, 1].",
    interactiveGoal: "Learn: Grayscale has channel 1; RGB has channel 3.",
    keyTakeaway: "Shape determines parameter compatibility."
  },
  4: {
    headline: "Convolution dimensions",
    body: "Output dimension formula: (W - K + 2P)/S + 1. For 28x28 input and 3x3 kernel: (28 - 3)/1 + 1 = 26.",
    interactiveGoal: "Practice: Compute output for kernel=5, stride=1, padding=2 (Ans: 28).",
    keyTakeaway: "Governed by input size, kernel, padding, and stride."
  },
  5: {
    headline: "Hadamard Dot Product",
    body: "The elementwise multiplication of matrices of identical size before sum accumulation.",
    interactiveGoal: "Distinguish elementwise Hadamard from matrix multiplication.",
    keyTakeaway: "Calculates local alignment scores."
  },
  6: {
    headline: "Parameter Calculations",
    body: "Params = (Kh * Kw * Cin + 1) * Cout. For 3x3 kernel, 1 input channel, 8 output filters: (3*3*1 + 1)*8 = 80.",
    interactiveGoal: "Practice: Calculate params for 5x5 kernel with Cin=8, Cout=16.",
    keyTakeaway: "Weights are shared across spatial locations."
  },
  7: {
    headline: "Feature Maps & Channels",
    body: "Output depth equals the number of filters in the layer. 8 filters yield 8 channels.",
    interactiveGoal: "Learn: Output depth is independent of input channel count.",
    keyTakeaway: "Filters determine depth channels."
  },
  8: {
    headline: "ReLU & Firing",
    body: "ReLU computes f(x) = max(0, x). It solves vanishing gradients but can cause dying ReLU.",
    interactiveGoal: "Practice: Graph ReLU and write its derivative.",
    keyTakeaway: "Introduces non-linearity to models."
  },
  9: {
    headline: "Max Pooling dims",
    body: "Max pooling uses 2x2 window with stride 2. Output size is W / 2, reducing dimensions to 13x13.",
    interactiveGoal: "Learn: Halves spatial width/height but preserves channel depth.",
    keyTakeaway: "Downsamples features and provides translation tolerance."
  },
  10: {
    headline: "Flatten Calculations",
    body: "Unrolls 3D tensor to 1D vector. Total elements must match: H * W * C. For 5x5x16: 400 elements.",
    interactiveGoal: "Verify: Reshapes representation without altering memory contents.",
    keyTakeaway: "Prepares data layout for dense layers."
  },
  11: {
    headline: "Dense layer weights",
    body: "Params = (Inputs * Outputs) + Outputs. From 400 inputs to 64 outputs: (400 * 64) + 64 = 25,664.",
    interactiveGoal: "Practice: Calculate params from 64 inputs to 10 outputs (Ans: 650).",
    keyTakeaway: "Performs global linear mapping."
  },
  12: {
    headline: "Softmax Definition",
    body: "Normalizes raw logits into a probability distribution summing to 1.0.",
    interactiveGoal: "Understand why Softmax is preferred over linear division.",
    keyTakeaway: "Maps logits to a probability simplex."
  },
  13: {
    headline: "Argmax & Out of Distribution",
    body: "Selects the maximum index: argmax(probabilities). Model confidently maps out-of-distribution inputs to 0-9.",
    interactiveGoal: "Understand why out-of-distribution inputs still map to 0-9.",
    keyTakeaway: "Argmax returns the relative maximum score index."
  }
};
