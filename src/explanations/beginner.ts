import type { ExplanationContent } from './index';

export const beginnerExplanations: Record<number, ExplanationContent> = {
  1: {
    headline: "Aligning and centering your drawing",
    body: "Before processing your digit, the network standardizes its size and position. It crops the surrounding empty space, rescales the drawing to a standard dimension, and moves the ink stroke's center of mass directly to the center. This ensures that the digit matches the scale and position of the training examples the network has learned from.",
    interactiveGoal: "Draw a digit on the canvas (left) and click 'Run Simulation' to see how it centers and standardizes.",
    keyTakeaway: "Standardization removes variance in size and location, allowing the model to focus purely on shape features."
  },
  2: {
    headline: "Converting an image to a grid of numbers",
    body: "Computers do not see visual strokes; they see arrays of numbers. We overlay a grid of 28 rows and 28 columns (784 cells total) onto your drawing. The background is represented by 0.0 (black), the core ink is represented by 1.0 (white), and the fuzzy edges are values in between.",
    interactiveGoal: "Examine the grid to see how brightness values represent your ink stroke.",
    keyTakeaway: "An image is mapped to a discrete matrix of density values so activation layers can process it mathematically."
  },
  3: {
    headline: "Probing individual grid values",
    body: "In this mode, you can inspect the exact numerical value stored inside any pixel cell of your digitized drawing. By hovering over cells, you can see how the computer maps varying levels of ink thickness to decimal coordinates.",
    interactiveGoal: "Hover or tap on individual cells of the grid to inspect the underlying numerical value.",
    keyTakeaway: "Pixels are addressed by coordinates, where each coordinate holds a scalar value in the range [0.0, 1.0]."
  },
  4: {
    headline: "Scanning patterns with a sliding window (Convolution)",
    body: "A kernel is a small 3x3 grid that acts as a specialized pattern filter. It slides across your drawing pixel-by-pixel, comparing its own pre-trained weights with the pixels underneath. If it is looking for a vertical edge and finds one, it outputs a strong signal. This produces a new grid called a 'feature map'.",
    interactiveGoal: "Watch the sliding frame traverse the input grid to locate vertical boundary edges.",
    keyTakeaway: "Convolution detects local patterns (lines, edges) consistently, regardless of where they appear on the page."
  },
  5: {
    headline: "Multiplying overlapping pixels (Hadamard Product)",
    body: "At each sliding step, the 3x3 kernel does elementwise multiplications. It multiplies each pixel in the current 3x3 patch by its corresponding filter weight. If a pixel is bright and the filter expects a bright pixel at that spot, the result is highly positive.",
    interactiveGoal: "Observe how aligned pixels and filter weights produce high product outputs.",
    keyTakeaway: "Multiplying local values measures how well the drawing's local structure matches the filter's pattern."
  },
  6: {
    headline: "Summing the results and adding bias",
    body: "After calculating the 9 multiplications, the network sums them up and adds a 'bias' value. The bias acts as a trigger threshold: it controls how strong the pattern match must be for the neuron to fire. This final sum is saved in the corresponding output cell.",
    interactiveGoal: "Trace how the nine patch products fold into a single output score.",
    keyTakeaway: "Bias adjusts the neuron's firing sensitivity, shifting the detection threshold up or down."
  },
  7: {
    headline: "Multiple filters scanning in parallel",
    body: "A single filter can only detect one feature, like vertical lines. To recognize complete digits, the CNN runs multiple filters in parallel (in our case, 8 filters). This generates a stack of 8 feature maps, each showing where a different visual element was located.",
    interactiveGoal: "Click different filter cards in the stacked view to see which feature each filter highlighted.",
    keyTakeaway: "Parallel filters allow the network to extract a variety of distinct visual properties simultaneously."
  },
  8: {
    headline: "Erasing negative scores (ReLU Activation)",
    body: "Neural networks must model complex, curved decision boundaries. The ReLU (Rectified Linear Unit) function introduces this power by checking every grid cell: if a number is positive, it stays; if it is negative (meaning no pattern match was found), it is set to zero (black).",
    interactiveGoal: "Observe how negative values are zeroed out, leaving only clean positive activation maps.",
    keyTakeaway: "ReLU clips negative responses to zero, focusing the network's attention only on positive feature matches."
  },
  9: {
    headline: "Shrinking the grid size (Max Pooling)",
    body: "To make processing faster and handle minor shifts in drawing position, we slide a 2x2 window across the feature maps. In each block, we keep only the maximum value and discard the other three. This halves both the height and width, leaving a compact 13x13 grid.",
    interactiveGoal: "Watch the 2x2 box select only the largest number and scale down the feature maps.",
    keyTakeaway: "Pooling downsamples features, reducing computation and providing tolerance to small shifts in drawing."
  },
  10: {
    headline: "Unrolling the grids into a single list",
    body: "After the model's second convolution and pooling pass, its features are stored in a compact stack of 16 grids, each 5x5. The final decision-making layer expects one list, so Flatten lines those 400 real activation values up in order.",
    interactiveGoal: "Scrub the timeline to see the grid cells peel off and line up in a single 1D vector.",
    keyTakeaway: "Flattening transitions the network from spatial features (2D) to a flat list ready for decision-making (1D)."
  },
  11: {
    headline: "Combining evidence (Dense Layer)",
    body: "In the fully connected (Dense) layer, hidden decision-making neurons evaluate the flattened inputs. Each connection has a 'weight' indicating how much that feature supports a candidate digit. The network combines all evidence to compute scores for digits 0–9.",
    interactiveGoal: "Hover over the output digits to see which features compile the strongest evidence for each class.",
    keyTakeaway: "The Dense layer performs global reasoning, combining extracted features to evaluate digit candidates."
  },
  12: {
    headline: "Converting scores to percentages (Softmax)",
    body: "The Dense layer outputs raw scores that can be negative or positive. To make them readable, the 'Softmax' function converts these scores into probability percentages that add up to exactly 100%. The class with the highest score is highlighted.",
    interactiveGoal: "Observe the raw logit scores transform into normalized probability percentages.",
    keyTakeaway: "Softmax normalizes raw scores into a probability distribution, representing the model's confidences."
  },
  13: {
    headline: "The final class prediction",
    body: "The digit class with the highest probability is selected as the prediction output. But note: the network is not 'intelligent'—it merely maps inputs to training boundaries. If you draw a scribble, it will still force a prediction, often with high confidence, because it lacks an 'unknown' class.",
    interactiveGoal: "Inspect the final classification result and test the limits by drawing non-digit shapes.",
    keyTakeaway: "Classifications are max-likelihood mappings, meaning the model can make confident but wrong predictions on out-of-distribution inputs."
  }
};
