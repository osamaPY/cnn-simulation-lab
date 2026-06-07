import type { ExplanationContent } from './index';

export const beginnerExplanations: Record<number, ExplanationContent> = {
  1: {
    headline: "Center & Resize",
    body: "Standardizes your drawing by cropping empty space and centering the digit. This ensures the model sees the numbers in a consistent size and position, making predictions highly reliable.",
    interactiveGoal: "Draw a digit on the left and run the simulation.",
    keyTakeaway: "Enforces scale and translation consistency so the network is not confused by position."
  },
  2: {
    headline: "CNN Architecture Overview",
    body: "Visualizes the macro-structure of the neural network. Tensors flow from the input through a series of blocks—Convolution, ReLU, and Pooling—before being flattened and passed to dense layers for final classification.",
    interactiveGoal: "Grasp how layers are stacked sequentially to build visual representations.",
    keyTakeaway: "Hierarchical layers help the network learn from simple edges to complex shapes."
  },
  3: {
    headline: "Rasterize to Grid",
    body: "Converts the drawing into a 28x28 grid of brightness values from 0 (black background) to 1 (white stroke). You can hover over individual grid cells to probe their numeric values.",
    interactiveGoal: "Hover or tap on cells to view coordinates and values.",
    keyTakeaway: "A computer sees an image as a matrix of intensity values, not lines."
  },
  4: {
    headline: "Convolutional Scan",
    body: "A 3x3 filter slides across the image grid. It multiplies the 3x3 patch values by the filter weights element-by-element and sums them up (adding a bias) to detect local features like edges.",
    interactiveGoal: "Watch the kernel sweep spatially and compute local scores.",
    keyTakeaway: "Convolution detects local patterns consistently across the image."
  },
  5: {
    headline: "Parallel Filters",
    body: "Multiple filters scan the image in parallel to extract different feature maps. One filter might specialize in vertical edges, another in horizontal strokes, creating a stack of features.",
    interactiveGoal: "Click different filter cards to see their extracted feature maps.",
    keyTakeaway: "Running filters in parallel creates depth channels, capturing diverse details."
  },
  6: {
    headline: "ReLU Activation",
    body: "Replaces all negative values with zero while keeping positive values unchanged. This introduces non-linearity, helping the network capture complex, curved shapes rather than just flat lines.",
    interactiveGoal: "Observe negative values turning to zero (black).",
    keyTakeaway: "ReLU clips negative responses to highlight positive feature matches."
  },
  7: {
    headline: "Max Pooling",
    body: "Slides a 2x2 window with a stride of 2 across the feature map, keeping only the maximum value in each window. This shrinks the grid size by half to make the model faster and less sensitive to small movements.",
    interactiveGoal: "Step the window to watch the grid shrink to 13x13.",
    keyTakeaway: "Pooling downsamples spatial size, discarding redundant data."
  },
  8: {
    headline: "Vector Flattening",
    body: "Unrolls the 3D feature grids (5x5x16) into a long 1D list of 400 numbers. This prepares the spatial features to be fed into the classic fully connected neurons for decision-making.",
    interactiveGoal: "Trace vector entries back to their original spatial and channel positions.",
    keyTakeaway: "Flattening converts grids into a flat list that dense layers can read globally."
  },
  9: {
    headline: "Dense Connections",
    body: "Hidden neurons weigh all 400 features globally. Each neuron is connected to every feature and learns to vote for digit features, combining local clues like loops and strokes into global concepts.",
    interactiveGoal: "Hover output digits to see contributing active features.",
    keyTakeaway: "Dense layers perform global reasoning by combining all features."
  },
  10: {
    headline: "Softmax Probabilities",
    body: "Normalizes the raw neuron scores into percentage probabilities that sum up to 100%. This represents the model's confidence distribution for each digit candidate (0 to 9).",
    interactiveGoal: "Observe raw scores convert to probabilities.",
    keyTakeaway: "Softmax translates raw evidence scores into interpretable confidences."
  },
  11: {
    headline: "Final Prediction",
    body: "Chooses the digit with the highest probability. If you draw unusual shapes, the model will still confidently choose the closest digit class from 0 to 9.",
    interactiveGoal: "Compare the predicted class against the full probability distribution.",
    keyTakeaway: "Prediction chooses the highest-probability class after the full pipeline has spoken."
  },
  12: {
    headline: "Backpropagation & Learning",
    body: "Calculates how wrong the prediction was and flows the error signal backward through the network. It tweaks the weights of filters and connections step-by-step so the model does better next time.",
    interactiveGoal: "Follow the error signal backward and see how gradients reshape weights.",
    keyTakeaway: "Backpropagation is the learning mechanism that adjusts filters to detect meaningful shapes over time."
  }
};
