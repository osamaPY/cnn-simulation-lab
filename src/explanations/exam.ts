import type { ExplanationContent } from './index';

export const examExplanations: Record<number, ExplanationContent> = {
  1: {
    headline: "Exam Prep: Input Spatial Standardization",
    body: "In exams, expect questions on preprocessing invariants. Translation and scaling ensure that input data is scale-invariant and translation-invariant. Centering the digit's center of mass (centroid) at (14,14) prevents spatial shifts from altering the first layer's filter responses.",
    interactiveGoal: "Learn: Normalization minimizes spatial translation bias, reducing the network's classification burden.",
    keyTakeaway: "Standardization reduces dataset variance, ensuring input patterns are presented in a uniform spatial coordinate system."
  },
  2: {
    headline: "Exam Prep: Grayscale Matrix Discretization",
    body: "Key concept: rasterization maps continuous coordinates to a discrete grid. Grayscale pixels are normalized to [0, 1] by dividing by 255. This standardizes numerical inputs, preventing explosive weights during backpropagation.",
    interactiveGoal: "Practice: Explain why dividing by 255.0 is critical for numerical stability in deep learning.",
    keyTakeaway: "Normalizing inputs to [0.0, 1.0] stabilizes gradient calculations, speeding up model convergence."
  },
  3: {
    headline: "Exam Prep: Tensor Dimensionality & Shapes",
    body: "Definitions: A Tensor is a multi-dimensional array. MNIST models accept a 4D input tensor shape of [Batch, Height, Width, Channels]. Single grayscale input is [1, 28, 28, 1]. batch index is 0, channel index is 0.",
    interactiveGoal: "Calculate the total number of tensor elements in a batch of 32 MNIST images: 32 x 28 x 28 x 1.",
    keyTakeaway: "CNN layers process multi-dimensional tensors, where rank and shape determine parameter compatibility."
  },
  4: {
    headline: "Exam Prep: Output Dimensions of Convolution",
    body: "Critical exam formula: Output Height/Width $O = (W - K + 2P)/S + 1$. For W=28, Kernel K=3, Padding P=0, Stride S=1, the output is $(28-3)/1+1 = 26$. Output shape per filter is [26, 26, 1].",
    interactiveGoal: "Calculate the output dimension for input=28, kernel=5, stride=1, padding=2. (Ans: 28)",
    keyTakeaway: "The spatial size of a feature map is governed by input size, kernel size, stride, and padding."
  },
  5: {
    headline: "Exam Prep: The Hadamard Product",
    body: "The elementwise product of two matrices of equal dimensions is the Hadamard product (denoted by $\\odot$). The convolution operation computes this product between the local patch and kernel weights before summing.",
    interactiveGoal: "Distinguish between matrix multiplication (dot product) and elementwise Hadamard multiplication.",
    keyTakeaway: "Hadamard multiplication matches spatial inputs with local weights prior to sum-pooling."
  },
  6: {
    headline: "Exam Prep: Parameter Count of Convolution",
    body: "Each filter has $K_h \\times K_w \\times C_{in}$ weights and exactly 1 bias parameter. For a 3x3 filter scanning 1-channel input, parameter count = (3*3*1) + 1 = 10. Parameters are shared across all sliding locations, representing parameter sharing.",
    interactiveGoal: "Explain parameter sharing: Why does sharing weights across coordinates reduce overfitting?",
    keyTakeaway: "Parameter sharing reduces parameter count and enforces translation invariance in feature detection."
  },
  7: {
    headline: "Exam Prep: Multi-Channel Tensor Depth",
    body: "Output depth equals the number of filters $C_{out}$ in the layer. Each filter produces one feature map. For 8 filters, the output is a 3D volume of shape $[H, W, 8]$. For $26 \\times 26$ maps, shape is $[26, 26, 8]$.",
    interactiveGoal: "Calculate the number of weights in a Conv2D layer with 16 filters of size 5x5 and input depth 8.",
    keyTakeaway: "The depth of a convolutional layer's output matches the number of learned filter kernels in that layer."
  },
  8: {
    headline: "Exam Prep: Activation Functions & ReLU",
    body: "ReLU (Rectified Linear Unit), defined as $f(x) = \\max(0, x)$, introduces non-linearity. It resolves the vanishing gradient problem (since derivative is 1.0 for positive inputs), but can cause 'dying ReLU' if neurons get stuck outputting zero.",
    interactiveGoal: "Graph ReLU and write down its derivative for positive and negative inputs.",
    keyTakeaway: "ReLU introduces non-linear thresholding, allowing deep layers to fit complex spatial functions."
  },
  9: {
    headline: "Exam Prep: Max Pooling Dimensions & stride",
    body: "Max pooling operates on local spatial patches (usually 2x2, stride=2) to select the maximum value. Output size: $O = W / 2$. Height/width shrink by half, but channels stay identical. It reduces spatial dimension, parameter count, and provides translation invariance.",
    interactiveGoal: "Calculate output shape of a [26, 26, 8] tensor after passing through a 2x2 max-pooling filter with stride 2.",
    keyTakeaway: "Pooling downsamples spatial dimensions while keeping channel depth constant, adding local translation robustness."
  },
  10: {
    headline: "Exam Prep: Flattening Calculations",
    body: "Flattening changes tensor shape from 3D to 1D without changing the data contents in memory. Total elements must match: $H \\times W \\times C$. For $13 \\times 13 \\times 8$ feature maps, the flattened vector has length $13 \\times 13 \\times 8 = 1352$ connections.",
    interactiveGoal: "Verify that unrolling a [5, 5, 16] tensor creates a 1D vector of length 400.",
    keyTakeaway: "Flattening reshapes spatial feature maps into a 1D vector to interface with Dense classification layers."
  },
  11: {
    headline: "Exam Prep: Parameter Count of Dense Layer",
    body: "Formula: $\\text{Params} = (I \\times O) + O$ where $I$ is inputs and $O$ is outputs. For a Dense layer mapping $1352$ inputs to $64$ hidden neurons: $(1352 \\times 64) + 64 = 86,592$ parameters (weights and biases).",
    interactiveGoal: "Calculate parameter count for a Dense layer connecting 64 hidden nodes to 10 output classes. (Ans: 650)",
    keyTakeaway: "Dense layers are highly parameterized, mapping all inputs globally to compile output evidence."
  },
  12: {
    headline: "Exam Prep: Softmax Definition & simplex",
    body: "Softmax normalizes raw score logits $z$ into probabilities. It ensures output values are in $(0, 1)$ and sum to 1.0 (probability simplex). Exponentiation maps logits to positive space and magnifies the highest values, pushing predictions to have high confidence.",
    interactiveGoal: "Explain why Softmax is preferred over simple linear division for final output classification.",
    keyTakeaway: "Softmax normalizes logit scores into a probability distribution, emphasizing the highest scores exponentially."
  },
  13: {
    headline: "Exam Prep: Out-of-Distribution & Argmax",
    body: "Argmax selects the class index of maximum probability: $\\hat{y} = \\arg\\max \\sigma(z)_i$. If fed an out-of-distribution (OOD) image, the model will output a high-confidence prediction for one of the learned classes because Softmax outputs sum to 1.0.",
    interactiveGoal: "Explain why a model can confidently predict 'digit 3' when fed a drawing of a dog.",
    keyTakeaway: "Argmax merely selects the relative maximum score, leaving classification vulnerable to out-of-distribution inputs."
  }
};
