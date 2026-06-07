import type { ExplanationContent } from './index';

export const examExplanations: Record<number, ExplanationContent> = {
  1: {
    headline: "Standardizing the Image",
    body: "Centering the digit's center of mass at coordinate (14, 14) and scaling its bounding box to fit within a canonical 20x20 area inside the 28x28 grid ensures scale-invariance and translation-invariance during network evaluation.",
    interactiveGoal: "Learn: Centering centroid at (14, 14) prevents spatial shift errors during inference.",
    keyTakeaway: "Standardizes input coordinates to remove translation and scaling offsets."
  },
  2: {
    headline: "CNN Architecture Overview",
    body: "Classic VGG-style modular pipeline. Stacking convolutional layers sequentially allows early layers to learn simple Gabor-like filters (edges) while deeper layers combine them into high-level semantic representations.",
    interactiveGoal: "Analyze layer sequence: Conv -> Activation -> Pooling -> Dense -> Softmax.",
    keyTakeaway: "Hierarchical stacking enables feature representation learning at increasing abstractions."
  },
  3: {
    headline: "Tensor Shapes & Scaling",
    body: "Continuous input is discretized into a 28x28 grayscale matrix. Intensities are scaled to [0, 1] by dividing by 255.0. Single image input is represented as a 4D tensor of shape [1, 28, 28, 1].",
    interactiveGoal: "Understand: [Batch, Height, Width, Channels] representation. Normalization prevents gradient instabilities.",
    keyTakeaway: "Quantizes images into structured tensors normalized for numerical stability."
  },
  4: {
    headline: "Convolution Dimensions & Hadamard",
    body: "Computes output shape: (W - K + 2P)/S + 1. For a 28x28 input with 3x3 kernel, stride 1, padding 0: (28 - 3 + 0)/1 + 1 = 26. Elementwise Hadamard product is summed with a bias term.",
    interactiveGoal: "Formula: Output = sum(Patch * Kernel) + bias. Parameters: (Kh * Kw * Cin + 1) * Cout.",
    keyTakeaway: "Governed by input size, kernel dimensions, padding, stride, and weight sharing."
  },
  5: {
    headline: "Feature Depth & Channel Stacking",
    body: "Applying Cout independent filters in parallel produces an output tensor with depth channel dimension Cout. With 8 filters, output shape becomes 26x26x8. Each channel represents a distinct feature projection.",
    interactiveGoal: "Learn: Output depth is determined solely by the number of parallel filters in the layer.",
    keyTakeaway: "Depth channels allow concurrent extraction of diverse feature types."
  },
  6: {
    headline: "ReLU Activation & Non-linearity",
    body: "Computes f(x) = max(0, x). Introduces non-linearity, enabling the network to approximate non-linear decision boundaries. Resolves vanishing gradients but risks 'dying ReLU' if neurons get stuck with negative inputs.",
    interactiveGoal: "Understand: ReLU derivative is 1 for x > 0, and 0 for x < 0. No exponentiation needed.",
    keyTakeaway: "Introduces non-linear mapping without high computational overhead."
  },
  7: {
    headline: "Max Pooling Dimensions",
    body: "Slides a 2x2 window with stride 2, extracting the maximum value. Halves spatial dimensions (26x26 -> 13x13) while preserving depth channels (13x13x8). Reduces spatial dimensions to lower parameter count.",
    interactiveGoal: "Learn: Pooling provides local translation tolerance and reduces overfitting.",
    keyTakeaway: "Downsamples feature maps to achieve translation-tolerant representations."
  },
  8: {
    headline: "Vector Flattening & Dimensions",
    body: "Reshapes a 3D feature volume of shape [H, W, C] into a 1D vector of length D = H * W * C. For MaxPooling output [5, 5, 16], this results in a 400-element vector. Memory layout is typically row-major NHWC.",
    interactiveGoal: "Verify: Flattening alters tensor rank from 3D to 1D without modifying underlying values in memory.",
    keyTakeaway: "Converts spatial feature representations into flat arrays compatible with dense layers."
  },
  9: {
    headline: "Making Connections",
    body: "Computes linear combination a = Wx + b. Parameters calculated as (Inputs * Outputs) + Outputs. From 400 inputs to 64 hidden neurons: (400 * 64) + 64 = 25,664. Learns global representations.",
    interactiveGoal: "Practice: Calculate weight matrix dimensions and bias vectors for fully connected projections.",
    keyTakeaway: "Dense layers perform global linear mapping across all combined features."
  },
  10: {
    headline: "Calculating Certainty",
    body: "Takes raw logits z_i and computes probabilities: exp(z_i) / sum(exp(z_j)). Ensures outputs lie on the probability simplex (all values in [0, 1] and sum to 1.0). Exponentiation accentuates highest scores.",
    interactiveGoal: "Formula: p_i = e^{z_i} / sum(e^{z_j}). Softmax is the multi-class generalization of logistic sigmoid.",
    keyTakeaway: "Maps unbounded real logit vectors into a normalized probability distribution."
  },
  11: {
    headline: "Argmax & Out of Distribution",
    body: "Applies argmax to probabilities to yield index of predicted class. Note that Softmax models are closed-world classifiers and will confidently output a class 0-9 even for out-of-distribution inputs.",
    interactiveGoal: "Understand: Argmax is non-differentiable; Softmax is its smooth, differentiable approximation.",
    keyTakeaway: "Final prediction is the index of maximum probability over the class vector."
  },
  12: {
    headline: "Error Gradients & Weight Updates",
    body: "Calculates the derivative of loss L (e.g. cross-entropy) with respect to weights W using the chain rule: ∂L/∂W = ∂L/∂a * ∂a/∂W. Gradient descent updates weights: W = W - η * ∂L/∂W.",
    interactiveGoal: "Learn: Chain rule calculates credit assignment backward from prediction error to early filters.",
    keyTakeaway: "Backpropagation computes error gradients to optimize weights and minimize classification loss."
  }
};
