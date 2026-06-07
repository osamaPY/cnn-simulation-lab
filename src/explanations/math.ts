import type { ExplanationContent } from './index';

export const mathExplanations: Record<number, ExplanationContent> = {
  1: {
    headline: "Translation and scaling of ink coordinates",
    body: "Preprocessing normalizes the spatial distribution of drawing coordinates. We calculate the bounding box bounds $[x_{min}, y_{min}, x_{max}, y_{max}]$ and compute the center of mass (centroid) of the ink pixels. We translate this centroid to the center of the grid $(14, 14)$ and scale coordinates by ratio $S$, fitting the stroke inside a $20 \\times 20$ bounding box.",
    focusFormula: "x_{centered} = S \\cdot (x - x_{centroid}) + 14",
    interactiveGoal: "Observe how coordinate translation and scaling matrices align the drawing to training limits.",
    keyTakeaway: "Spatial normalization translates the input coordinate system to ensure translation-invariance."
  },
  2: {
    headline: "Grayscale rasterization and normalization",
    body: "The continuous centered path vector is rasterized into a discrete matrix of shape $[28, 28, 1]$. To map values to a standardized range, we normalize the raw 8-bit grayscale intensity values (range 0–255) by dividing by 255.0. This yields a single-precision floating point tensor $X \\in [0.0, 1.0]$.",
    focusFormula: "X_{i,j} = \\frac{I_{i,j}}{255.0} \\quad \\text{where } I_{i,j} \\in [0, 255]",
    interactiveGoal: "Verify how continuous drawing coordinate lines rasterize to standard Float32 values.",
    keyTakeaway: "Pixel intensities are scaled to the range [0.0, 1.0] to prevent unstable gradient computations in neural nets."
  },
  3: {
    headline: "Tensor element indexing",
    body: "The digitized drawing is represented as a 4D tensor with shape $[1, 28, 28, 1]$ (Batch, Height, Width, Channels). Since we are processing a single grayscale image, batch index $b=0$ and channel index $c=0$. We query coordinates $(r, c)$ inside the input tensor.",
    focusFormula: "v = X[0, r, c, 0] \\quad \\text{where } v \\in [0, 1]",
    interactiveGoal: "Hover over the grid cells to inspect coordinates (r, c) and their scalar intensities.",
    keyTakeaway: "Tensor addressing allows accessing individual activation values inside multi-dimensional matrices."
  },
  4: {
    headline: "Discrete 2D cross-correlation",
    body: "A kernel filter $K$ of shape $3 \\times 3 \\times 1$ slides across the input tensor $X$. The output shape for valid convolution is determined by input size $W$, kernel size $K$, stride $s$, and padding $p$. For $28 \\times 28$ input and $3 \\times 3$ kernel, output height/width is $(28 - 3)/1 + 1 = 26$. Output tensor shape: $[1, 26, 26, 1]$ per filter.",
    focusFormula: "Y_{i,j} = \\sum_{m=0}^{2} \\sum_{n=0}^{2} X_{i+m, j+n} \\cdot K_{m,n}",
    interactiveGoal: "Watch the sliding window compute the 2D cross-correlation dot products.",
    keyTakeaway: "Convolution acts as a translation-invariant localized spatial feature extractor."
  },
  5: {
    headline: "Receptive field Hadamard product",
    body: "At each position $(i, j)$ on the feature map, we extract a local $3 \\times 3$ input patch $X_{patch}$. We compute the elementwise Hadamard product between this patch and the kernel matrix $K$. This creates an intermediate matrix $P \\in \\mathbb{R}^{3 \\times 3}$.",
    focusFormula: "P = X_{patch} \\odot K",
    interactiveGoal: "Compare patch activation values with the filter weight coefficients in the product grid.",
    keyTakeaway: "The Hadamard product calculates the matching score between local features and filter weights."
  },
  6: {
    headline: "Summation and bias offset",
    body: "To combine the 9 local products, the network sums all elements of the Hadamard matrix $P$ and adds a learnable scalar bias $b$. The bias shifts the activation threshold, determining how easy it is for this filter to respond to a given pattern.",
    focusFormula: "z_{i,j} = \\sum_{r=0}^{2} \\sum_{c=0}^{2} P_{r,c} + b",
    interactiveGoal: "Verify the calculation: sum the Hadamard products and add the bias coefficient to compute pre-activation z.",
    keyTakeaway: "The bias parameter allows the network to shift the activation function's threshold response."
  },
  7: {
    headline: "Depth stacking of C-channel tensors",
    body: "By applying $C_{out}$ distinct filters in parallel, we extract $C_{out}$ unique feature maps. The output tensor concatenates these maps along the depth dimension. For 8 filters, the output shape transitions from $[1, 26, 26, 1]$ to $[1, 26, 26, 8]$.",
    focusFormula: "Y \\in \\mathbb{R}^{B \\times H_{out} \\times W_{out} \\times C_{out}} \\quad (C_{out} = 8)",
    interactiveGoal: "Click channels in the visualizer stack to see the separate feature maps.",
    keyTakeaway: "Depth channels allow the network to represent multiple visual features at the same spatial coordinates."
  },
  8: {
    headline: "Rectified Linear Unit (ReLU) activation",
    body: "To prevent deep networks from collapsing into a single linear map, we apply the ReLU non-linear activation. It evaluates every activation $x$ in the feature maps: positive values are preserved, while negative values (indicating no pattern match) are clipped to exactly zero.",
    focusFormula: "f(x) = \\max(0, x)",
    interactiveGoal: "Observe how ReLU clips negative pre-activation values to zero, removing negative values.",
    keyTakeaway: "ReLU introduces non-linearity to the network, enabling it to model complex decision boundaries."
  },
  9: {
    headline: "Max pooling spatial downsampling",
    body: "Max pooling partitions the feature maps into $2 \\times 2$ blocks. With stride $s=2$, the pooling window selects the maximum activation value in each block. This cuts height and width in half, reducing the tensor shape from $[1, 26, 26, 8]$ to $[1, 13, 13, 8]$.",
    focusFormula: "P_{i,j,c} = \\max_{m,n \\in \\{0,1\\}} Y_{2i+m, 2j+n, c}",
    interactiveGoal: "Step the pooling window to see the shape shrink from 26x26 to 13x13.",
    keyTakeaway: "Max pooling reduces spatial dimensionality while preserving the strongest feature activations."
  },
  10: {
    headline: "Row-major tensor flattening",
    body: "Before entering the decision-making layers, the model's final pooled tensor is flattened into a 1D vector. We unroll shape $[1, 5, 5, 16]$ row-by-row into $x \\in \\mathbb{R}^{400}$. The index ordering is channel-last (NHWC).",
    focusFormula: "x_k = Y_{i, j, c} \\quad \\text{where } k = (i \\cdot W + j) \\cdot C + c",
    interactiveGoal: "Hover over vector elements to trace back to their (row, col, channel) coordinates.",
    keyTakeaway: "Flattening changes the data layout from a spatial grid to a continuous array of inputs."
  },
  11: {
    headline: "Matrix-vector product (Dense layer)",
    body: "The Dense layer maps the $400$-length input vector $x$ to $64$ hidden neurons. We compute the dot product of the weights matrix $W_1 \\in \\mathbb{R}^{64 \\times 400}$ and vector $x$, add the bias vector $b_1 \\in \\mathbb{R}^{64}$, and apply ReLU activation.",
    focusFormula: "a = \\max(0, W_1 \\cdot x + b_1)",
    interactiveGoal: "Hover output digit circles to see the evidence paths contributing positive signals.",
    keyTakeaway: "Fully connected layers combine all spatial features globally to build classification scores."
  },
  12: {
    headline: "Softmax probability distribution",
    body: "The output layer produces $10$ raw logit scores $z$. To convert them to probabilities, the Softmax function exponentiates each score (making it positive) and divides it by the sum of all exponentiated scores, ensuring they sum to 1.0.",
    focusFormula: "\\sigma(z)_i = \\frac{e^{z_i}}{\\sum_{j=0}^{9} e^{z_j}} \\quad \\text{s.t. } \\sum \\sigma(z) = 1.0",
    interactiveGoal: "Observe how exponentiation magnifies high scores, creating clear winners.",
    keyTakeaway: "Softmax maps logits to a probability simplex, normalizing scores to [0.0, 1.0] summing to 1.0."
  },
  13: {
    headline: "Maximum likelihood class selection",
    body: "The network selects the digit class with the highest probability. This is the argmax (index of maximum probability) of the Softmax output vector. Out-of-distribution (OOD) inputs still map to these classes because the network lacks a rejection threshold.",
    focusFormula: "\\hat{y} = \\arg\\max_{i} \\sigma(z)_i",
    interactiveGoal: "Test the classification limit: draw scribbles or non-digit shapes and analyze predictions.",
    keyTakeaway: "The final class is merely the relative maximum of the normalized softmax scores."
  }
};
