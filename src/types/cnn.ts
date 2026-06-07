
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
    name: "Standardizing the Image",
    shortName: "Input",
    description: "The raw user drawing is cropped to its bounding box, centered by its center of mass, and rescaled to a canonical 28x28 grayscale coordinate system.",
    shapeLabel: "28 × 28"
  },
  {
    id: 2,
    name: "Model Architecture",
    shortName: "Architecture",
    description: "Visualization of the sequential LayersModel topology. Tensors pass through convolutional blocks and pooling operations to extract hierarchical features.",
    shapeLabel: "Full View"
  },
  {
    id: 3,
    name: "Grid Discretization",
    shortName: "Grid",
    description: "The normalized image is converted into a 2D intensity matrix (Tensor). Each cell represents a normalized pixel value between 0.0 and 1.0.",
    shapeLabel: "28 × 28"
  },
  {
    id: 4,
    name: "Convolutional Feature Extraction",
    shortName: "Convolution",
    description: "A 3x3 kernel performs a sliding window dot product (cross-correlation) to identify local spatial features like edges and textures.",
    shapeLabel: "26 × 26"
  },
  {
    id: 5,
    name: "Parallel Channel Projection",
    shortName: "Filters",
    description: "Multiple independent filters are applied in parallel to generate a stack of feature maps, capturing diverse visual motifs simultaneously.",
    shapeLabel: "26 × 26 × 8"
  },
  {
    id: 6,
    name: "Non-Linear Activation (ReLU)",
    shortName: "ReLU",
    description: "The Rectified Linear Unit (f(x)=max(0,x)) introduces non-linearity by zeroing out negative activations, emphasizing positive feature responses.",
    shapeLabel: "26 × 26 × 8"
  },
  {
    id: 7,
    name: "Spatial Downsampling (Max Pooling)",
    shortName: "Pooling",
    description: "A 2x2 max-pooling operation reduces spatial dimensionality while maintaining translation invariance by retaining only the peak activation in each window.",
    shapeLabel: "13 × 13 × 8"
  },
  {
    id: 8,
    name: "Tensor Flattening",
    shortName: "Flatten",
    description: "The 3D feature volume is reshaped into a 1D feature vector, transitioning from spatial representations to a format suitable for dense layer processing.",
    shapeLabel: "400"
  },
  {
    id: 9,
    name: "Making Connections",
    shortName: "Dense",
    description: "A fully connected layer performs a global linear transformation (Wx + b) to correlate local features into high-level semantic class scores.",
    shapeLabel: "64"
  },
  {
    id: 10,
    name: "Calculating Certainty",
    shortName: "Softmax",
    description: "Logits are transformed via exponentiation and normalization into a probability distribution over the discrete 0-9 class space.",
    shapeLabel: "10"
  },
  {
    id: 11,
    name: "Class Inference",
    shortName: "Output",
    description: "The final prediction is determined by selecting the class index with the maximum probability (Argmax) from the Softmax distribution.",
    shapeLabel: "1"
  },
  {
    id: 12,
    name: "Gradient Backpropagation",
    shortName: "Learning",
    description: "Error gradients are calculated using the chain rule and propagated backward to optimize weights, minimizing the categorical cross-entropy loss.",
    shapeLabel: "1"
  }
];
