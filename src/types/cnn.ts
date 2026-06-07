export type TeachingMode = 'beginner' | 'math' | 'exam';

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
    description: "Your raw hand-drawn stroke is cropped, resized, and centered to match the training data profile.",
    shapeLabel: "28 × 28 × 1"
  },
  {
    id: 2,
    name: "Pixel Grid Discretization",
    shortName: "Grid",
    description: "The centered image is converted to a grid of intensity values from 0.0 (black) to 1.0 (white).",
    shapeLabel: "28 × 28"
  },
  {
    id: 3,
    name: "Pixel Intensity Probe",
    shortName: "Probe",
    description: "Examine individual pixel values to observe how numerical values represent spatial patterns.",
    shapeLabel: "1 × 1"
  },
  {
    id: 4,
    name: "3x3 Convolution Kernel",
    shortName: "Conv Scan",
    description: "A 3x3 pattern filter slides across the image to extract local visual features (edges, corners).",
    shapeLabel: "26 × 26 × 1"
  },
  {
    id: 5,
    name: "Patch Elementwise Product",
    shortName: "Multiply",
    description: "The 3x3 input patch is multiplied elementwise by the filter kernel weights.",
    shapeLabel: "3 × 3"
  },
  {
    id: 6,
    name: "Sum & Bias Integration",
    shortName: "Sum",
    description: "The 9 products are added together and a bias term is added to form a single output value.",
    shapeLabel: "1"
  },
  {
    id: 7,
    name: "Multi-Filter Stack",
    shortName: "Filters",
    description: "Multiple independent filters run in parallel to generate multiple output feature maps.",
    shapeLabel: "26 × 26 × 8"
  },
  {
    id: 8,
    name: "ReLU Non-Linearity",
    shortName: "ReLU",
    description: "Rectified Linear Unit clips all negative feature map values to zero, introducing learning power.",
    shapeLabel: "26 × 26 × 8"
  },
  {
    id: 9,
    name: "Max Pooling Downsampling",
    shortName: "Pooling",
    description: "A 2x2 window slides with stride 2, keeping only the maximum value to shrink and abstract the map.",
    shapeLabel: "13 × 13 × 8"
  },
  {
    id: 10,
    name: "Tensor Flattening",
    shortName: "Flatten",
    description: "The model's final 5x5x16 pooled activation volume is unrolled into a single 400-value vector.",
    shapeLabel: "400"
  },
  {
    id: 11,
    name: "Dense Connected Layer",
    shortName: "Dense",
    description: "Neurons evaluate connections and weigh evidence to map features to specific digit candidates.",
    shapeLabel: "64"
  },
  {
    id: 12,
    name: "Softmax Normalization",
    shortName: "Softmax",
    description: "Raw digit scores are normalized into a probability distribution summing to 1.0 (100%).",
    shapeLabel: "10"
  },
  {
    id: 13,
    name: "Final Classification Result",
    shortName: "Output",
    description: "The argmax of the probabilities yields the final predicted digit along with the model's confidence.",
    shapeLabel: "1"
  }
];
