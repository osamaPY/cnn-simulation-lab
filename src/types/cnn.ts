
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
    name: "Input Image normalization",
    shortName: "Input",
    description: "Crops and centers your drawing.",
    shapeLabel: "28 × 28 × 1"
  },
  {
    id: 2,
    name: "Pixel Grid Discretization",
    shortName: "Grid",
    description: "Converts the drawing to a 28x28 grid of values.",
    shapeLabel: "28 × 28"
  },
  {
    id: 3,
    name: "Pixel Intensity Probe",
    shortName: "Probe",
    description: "Hover to inspect cell values.",
    shapeLabel: "1 × 1"
  },
  {
    id: 4,
    name: "3x3 Convolution Kernel",
    shortName: "Conv Scan",
    description: "Slides a 3x3 filter to extract local features.",
    shapeLabel: "26 × 26 × 1"
  },
  {
    id: 5,
    name: "Patch Elementwise Product",
    shortName: "Multiply",
    description: "Multiplies local pixels by kernel weights.",
    shapeLabel: "3 × 3"
  },
  {
    id: 6,
    name: "Sum & Bias Integration",
    shortName: "Sum",
    description: "Sums the products and adds a bias threshold.",
    shapeLabel: "1"
  },
  {
    id: 7,
    name: "Multi-Filter Stack",
    shortName: "Filters",
    description: "Runs multiple filters in parallel.",
    shapeLabel: "26 × 26 × 8"
  },
  {
    id: 8,
    name: "ReLU Non-Linearity",
    shortName: "ReLU",
    description: "Clips negative feature values to zero.",
    shapeLabel: "26 × 26 × 8"
  },
  {
    id: 9,
    name: "Max Pooling Downsampling",
    shortName: "Pooling",
    description: "Downsamples grid dimensions to 13x13.",
    shapeLabel: "13 × 13 × 8"
  },
  {
    id: 10,
    name: "Tensor Flattening",
    shortName: "Flatten",
    description: "Unrolls 3D feature grids to a 1D vector.",
    shapeLabel: "400"
  },
  {
    id: 11,
    name: "Dense Connected Layer",
    shortName: "Dense",
    description: "Weighs features globally to evaluate candidates.",
    shapeLabel: "64"
  },
  {
    id: 12,
    name: "Softmax Normalization",
    shortName: "Softmax",
    description: "Normalizes scores into probability percentages.",
    shapeLabel: "10"
  },
  {
    id: 13,
    name: "Final Classification Result",
    shortName: "Output",
    description: "Yields predicted digit and model confidence.",
    shapeLabel: "1"
  }
];
