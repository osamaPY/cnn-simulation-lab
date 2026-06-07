import type { ExplanationContent } from './index';

export const beginnerExplanations: Record<number, ExplanationContent> = {
  1: {
    headline: "Standardizing the Image",
    body: "Standardizes input data by cropping white space and centering the digit. This ensures the model processes the digit at a consistent scale and position, improving inference reliability.",
    interactiveGoal: "Draw a digit on the left and start the simulation.",
    keyTakeaway: "Enforces scale and translation invariance prior to feature extraction."
  },
  2: {
    headline: "Network Topology",
    body: "Visualizes the global structure of the neural network. Tensors flow through sequential blocks—Convolution, ReLU, and Pooling—before final classification in the dense layers.",
    interactiveGoal: "Observe how layers are stacked to build hierarchical visual representations.",
    keyTakeaway: "Successive layers transition from low-level edges to high-level semantic shapes."
  },
  3: {
    headline: "Grid Discretization",
    body: "Converts the continuous drawing into a 28x28 discrete grid of intensity values. Each cell corresponds to a pixel value between 0.0 (background) and 1.0 (foreground).",
    interactiveGoal: "Probe individual cells to view their underlying coordinates and values.",
    keyTakeaway: "Input is represented as a structured matrix of intensity values."
  },
  4: {
    headline: "Spatial Convolution",
    body: "A sliding kernel performs local operations across the image. It computes the dot product of the kernel weights and local pixel patches to identify spatial features like edges.",
    interactiveGoal: "Track the kernel as it computes local responses across the input space.",
    keyTakeaway: "Convolution detects local patterns consistently using shared weights."
  },
  5: {
    headline: "Channel Parallelism",
    body: "Multiple filters are applied concurrently to extract distinct feature maps. Each filter specializes in a specific motif, such as vertical edges or curved segments.",
    interactiveGoal: "Select different channels to visualize the specific features they highlight.",
    keyTakeaway: "Parallel filter application enables multi-dimensional feature extraction."
  },
  6: {
    headline: "ReLU Non-linearity",
    body: "Applies a thresholding operation that sets all negative values to zero. This introduces non-linearity, allowing the network to model complex non-linear relationships.",
    interactiveGoal: "Observe how negative activations are suppressed to zero.",
    keyTakeaway: "ReLU emphasizes significant activations while enabling non-linear representation."
  },
  7: {
    headline: "Spatial Pooling",
    body: "Reduces feature map resolution by selecting the maximum value within a 2x2 local window. This downsampling increases computational efficiency and provides local translation tolerance.",
    interactiveGoal: "Observe the spatial reduction as the feature map is downsampled.",
    keyTakeaway: "Pooling discards redundant spatial data while preserving critical features."
  },
  8: {
    headline: "Vector Flattening",
    body: "Reshapes the 3D feature volume into a 1D vector. This transforms spatial feature maps into a format compatible with fully connected layers.",
    interactiveGoal: "Observe the transition from spatial grids to a linear feature vector.",
    keyTakeaway: "Flattening links spatial feature extraction with global decision-making."
  },
  9: {
    headline: "Making Connections",
    body: "Neurons in the dense layer compute weighted sums of the entire feature vector. This stage integrates local features into global concepts to determine class membership.",
    interactiveGoal: "Inspect how global features contribute to specific digit activations.",
    keyTakeaway: "Dense layers perform high-level reasoning across all combined features."
  },
  10: {
    headline: "Calculating Certainty",
    body: "Converts raw class scores into a normalized probability distribution using the Softmax function. All outputs sum to 1.0, representing the model's relative confidence.",
    interactiveGoal: "Watch as raw scores are transformed into a competitive probability distribution.",
    keyTakeaway: "Softmax provides an interpretable confidence score for each class."
  },
  11: {
    headline: "Class Selection",
    body: "Identifies the final prediction by selecting the digit with the highest probability score. The system outputs the most likely class based on the cumulative pipeline evidence.",
    interactiveGoal: "Compare the predicted digit against the full probability distribution.",
    keyTakeaway: "Final inference is the result of selecting the maximum likelihood class."
  },
  12: {
    headline: "Backpropagation",
    body: "Calculates error gradients and propagates them backward through the network to update weights. This iterative process optimizes the model for future predictions.",
    interactiveGoal: "Trace the error signal backward to see how it adjusts network parameters.",
    keyTakeaway: "Learning is achieved through iterative weight optimization based on error gradients."
  }
};
