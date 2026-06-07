
export interface StageInfo {
  id: number;
  name: string;
  shortName: string;
  description: string;
  shapeLabel: string;
}

export interface PredictionResult {
  digit: number;
  confidence: number;
  probabilities: number[]; // Softmax distribution for 0-9
}

export const CNN_STAGES: StageInfo[] = [
  {
    id: 1,
    name: "Input Image Normalization",
    shortName: "Input",
    description: "Crops and centers your drawing.",
    shapeLabel: "28 × 28"
  },
  {
    id: 2,
    name: "CNN Architecture Overview",
    shortName: "VGG-Style",
    description: "The full macro-structure of the network. Watch how tensors flow through repeated blocks.",
    shapeLabel: "Full View"
  },
  {
    id: 3,
    name: "Pixel Grid Discretization",
    shortName: "Grid",
    description: "Converts the drawing to a 28x28 grid. Hover to inspect values.",
    shapeLabel: "28 × 28"
  },
  {
    id: 4,
    name: "3x3 Convolution Filter",
    shortName: "Convolution",
    description: "Slides a 3x3 filter to extract local features.",
    shapeLabel: "26 × 26"
  },
  {
    id: 5,
    name: "Multi-Filter Stack",
    shortName: "Filters",
    description: "Runs multiple filters in parallel to extract different features.",
    shapeLabel: "26 × 26 × 8"
  },
  {
    id: 6,
    name: "ReLU Activation",
    shortName: "ReLU",
    description: "Clips negative feature values to zero.",
    shapeLabel: "26 × 26 × 8"
  },
  {
    id: 7,
    name: "Max Pooling Downsampling",
    shortName: "Pooling",
    description: "Downsamples grid dimensions to 13x13.",
    shapeLabel: "13 × 13 × 8"
  },
  {
    id: 8,
    name: "Tensor Flattening",
    shortName: "Flatten",
    description: "Unrolls 3D feature grids to a 1D vector.",
    shapeLabel: "400"
  },
  {
    id: 9,
    name: "Dense Connected Layer",
    shortName: "Dense",
    description: "Weighs features globally to evaluate candidates.",
    shapeLabel: "64"
  },
  {
    id: 10,
    name: "Softmax Normalization",
    shortName: "Softmax",
    description: "Normalizes scores into probability percentages.",
    shapeLabel: "10"
  },
  {
    id: 11,
    name: "Final Classification Result",
    shortName: "Output",
    description: "Yields predicted digit and model confidence.",
    shapeLabel: "1"
  },
  {
    id: 12,
    name: "Backpropagation Learning",
    shortName: "Learning",
    description: "Visualizes how error gradients flow backward to adjust weights and learn.",
    shapeLabel: "1"
  }
];
