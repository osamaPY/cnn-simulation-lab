import type { ExplanationContent } from './index';

export const beginnerExplanations: Record<number, ExplanationContent> = {
  1: {
    headline: "Center & Resize",
    body: "Standardizes your drawing by cropping empty space and centering the digit.",
    interactiveGoal: "Draw a digit on the left and run the simulation.",
    keyTakeaway: "Enforces scale and translation consistency."
  },
  2: {
    headline: "Rasterize to Grid",
    body: "Converts the drawing into a 28x28 grid of brightness values (0.0 to 1.0).",
    interactiveGoal: "Observe the intensity values representing your stroke.",
    keyTakeaway: "Images are represented as matrices of numbers."
  },
  3: {
    headline: "Pixel Probing",
    body: "Inspect individual cell intensities and coordinates inside the matrix.",
    interactiveGoal: "Hover or tap on cells to view coordinates and values.",
    keyTakeaway: "Pixels are addressed by row and column coordinates."
  },
  4: {
    headline: "Convolution Scan",
    body: "A 3x3 filter slides across the grid to detect local features like edges.",
    interactiveGoal: "Watch the frame scan the input to create a feature map.",
    keyTakeaway: "Convolution detects local patterns consistently."
  },
  5: {
    headline: "Pixel Multiplication",
    body: "Multiplies the 3x3 patch values by the filter weights element-by-element.",
    interactiveGoal: "Observe elementwise multiplication results.",
    keyTakeaway: "Hadamard products measure local pattern similarity."
  },
  6: {
    headline: "Sum & Bias",
    body: "Sums the 9 products and adds a bias threshold to get the output value.",
    interactiveGoal: "Trace how the products fold into a single score.",
    keyTakeaway: "Bias adjusts the neuron's firing threshold."
  },
  7: {
    headline: "Parallel Filters",
    body: "Multiple filters scan in parallel to extract different feature maps.",
    interactiveGoal: "Click different filter cards to see their extracted feature maps.",
    keyTakeaway: "Channels extract diverse features simultaneously."
  },
  8: {
    headline: "ReLU Activation",
    body: "Replaces negative values with zero to introduce non-linearity.",
    interactiveGoal: "Observe negative values turning to zero.",
    keyTakeaway: "ReLU clips negative responses to highlight positive feature matches."
  },
  9: {
    headline: "Max Pooling",
    body: "Slides a 2x2 window with stride 2, keeping only the maximum value to halve the grid size.",
    interactiveGoal: "Step the window to watch the grid shrink to 13x13.",
    keyTakeaway: "Pooling downsamples spatial size, reducing memory."
  },
  10: {
    headline: "Flattening",
    body: "Unrolls the final 3D feature grids into a 1D vector (400 values) for classification.",
    interactiveGoal: "Watch the grid cells line up into a single vector.",
    keyTakeaway: "Flattening prepares spatial data for global decision layers."
  },
  11: {
    headline: "Dense Connections",
    body: "Hidden neurons weigh all 400 features globally to evaluate digit candidates.",
    interactiveGoal: "Hover output digits to see contributing active features.",
    keyTakeaway: "Dense layers perform global reasoning by combining all features."
  },
  12: {
    headline: "Softmax probabilities",
    body: "Converts raw logit scores into percentage probabilities summing to 100%.",
    interactiveGoal: "Observe raw scores normalise to probabilities.",
    keyTakeaway: "Softmax represents the model's confidence distribution."
  },
  13: {
    headline: "Final Output",
    body: "Selects the digit with the highest confidence.",
    interactiveGoal: "See the result or draw weird shapes to test limits.",
    keyTakeaway: "The model outputs relative confidences and maps everything to 0-9."
  }
};
