import type { ExplanationContent } from './index';

export const mathExplanations: Record<number, ExplanationContent> = {
  1: {
    headline: "Spatial Normalization",
    body: "Translates the drawing centroid to the grid center (14, 14) and scales it to fit a 20x20 bounding box.",
    focusFormula: "x_{centered} = S \\cdot (x - x_{centroid}) + 14",
    interactiveGoal: "Observe coordinate translation and scaling alignment.",
    keyTakeaway: "Ensures translation and scale invariance."
  },
  2: {
    headline: "Rasterization & Scaling",
    body: "Rasterizes drawing vectors into a [28, 28, 1] grid and divides 8-bit values by 255.0 to map to [0.0, 1.0].",
    focusFormula: "X_{i,j} = \\frac{I_{i,j}}{255.0}",
    interactiveGoal: "Observe continuous lines rasterized to Float32 values.",
    keyTakeaway: "Stabilizes gradient calculations."
  },
  3: {
    headline: "Tensor Addressing",
    body: "Addresses the 4D input tensor with shape [Batch, Height, Width, Channels]. For single grayscale input: [1, 28, 28, 1].",
    focusFormula: "v = X[0, r, c, 0]",
    interactiveGoal: "Hover cells to inspect coordinates (r, c) and values.",
    keyTakeaway: "Allows indexing of multi-dimensional arrays."
  },
  4: {
    headline: "2D Cross-Correlation",
    body: "Slides a 3x3 kernel over the 28x28 grid. Output size is determined by (W - K + 2P)/S + 1 = (28 - 3)/1 + 1 = 26.",
    focusFormula: "Y_{i,j} = \\sum_{m=0}^{2} \\sum_{n=0}^{2} X_{i+m, j+n} \\cdot K_{m,n}",
    interactiveGoal: "Watch the sliding frame compute local dot products.",
    keyTakeaway: "Extracts local spatial features."
  },
  5: {
    headline: "Hadamard Product",
    body: "Computes the elementwise product between the 3x3 patch and the kernel weights.",
    focusFormula: "P = X_{patch} \\odot K",
    interactiveGoal: "Compare local patch values and weight coefficients.",
    keyTakeaway: "Measures local pattern similarity."
  },
  6: {
    headline: "Summation & Bias Offset",
    body: "Sums all 9 Hadamard products and adds a learnable scalar bias parameter.",
    focusFormula: "z_{i,j} = \\sum P_{r,c} + b",
    interactiveGoal: "Sum the products and add bias to get the pre-activation score.",
    keyTakeaway: "Bias adjusts the firing threshold."
  },
  7: {
    headline: "Stacking Depth Channels",
    body: "Concatenates 8 independent filter outputs to form a [1, 26, 26, 8] activation volume.",
    focusFormula: "Y \\in \\mathbb{R}^{B \\times H \\times W \\times C_{out}}",
    interactiveGoal: "Click channels in the stack to see separate feature maps.",
    keyTakeaway: "Represents multiple features at the same coordinates."
  },
  8: {
    headline: "ReLU Non-Linearity",
    body: "Applies f(x) = max(0, x) to introduce non-linearity, clipping negative responses to zero.",
    focusFormula: "f(x) = \\max(0, x)",
    interactiveGoal: "Observe negative values set to zero.",
    keyTakeaway: "Enables modeling of complex decision boundaries."
  },
  9: {
    headline: "Max Pooling Downsampling",
    body: "Selects the maximum value in 2x2 blocks with stride 2, halving spatial dimensions to 13x13.",
    focusFormula: "P_{i,j,c} = \\max_{m,n} Y_{2i+m, 2j+n, c}",
    interactiveGoal: "Step the window to watch dimensions halve.",
    keyTakeaway: "Reduces spatial representation size."
  },
  10: {
    headline: "Vector Flattening",
    body: "Unrolls a [1, 5, 5, 16] tensor into a 1D vector of length 400 in row-major order.",
    focusFormula: "x_k = Y_{i, j, c}",
    interactiveGoal: "Hover vector elements to view source spatial coordinates.",
    keyTakeaway: "Prepares data layout for dense layers."
  },
  11: {
    headline: "Matrix-Vector Product",
    body: "Computes W * x + b mapping the 400-length input vector to 64 hidden neurons.",
    focusFormula: "a = \\max(0, W_1 \\cdot x + b_1)",
    interactiveGoal: "Hover output digits to view active connections.",
    keyTakeaway: "Performs global feature reasoning."
  },
  12: {
    headline: "Softmax Normalization",
    body: "Normalizes raw logits into a probability distribution summing to 1.0.",
    focusFormula: "\\sigma(z)_i = \\frac{e^{z_i}}{\\sum e^{z_j}}",
    interactiveGoal: "Observe raw scores mapped to percentages.",
    keyTakeaway: "Constructs a probability distribution."
  },
  13: {
    headline: "Argmax Decision",
    body: "Selects the class index with the highest probability value.",
    focusFormula: "\\hat{y} = \\arg\\max_{i} \\sigma(z)_i",
    interactiveGoal: "Observe final index classification.",
    keyTakeaway: "Identifies the highest confidence prediction."
  }
};
