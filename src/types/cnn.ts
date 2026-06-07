
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
    description: "Computers need things to be consistent. We crop and center your sketch so the network knows where to look.",
    shapeLabel: "28 × 28"
  },
  {
    id: 2,
    name: "The 'Brain' Blueprint",
    shortName: "Architecture",
    description: "This is the full map of the network. Tensors (data blocks) flow through these layers to find meaning in pixels.",
    shapeLabel: "Full View"
  },
  {
    id: 3,
    name: "Turning Ink into Numbers",
    shortName: "Grid",
    description: "We turn your drawing into a 28x28 grid of numbers. Hover over the cells to see the 'ink' values.",
    shapeLabel: "28 × 28"
  },
  {
    id: 4,
    name: "Hunting for Patterns",
    shortName: "Convolution",
    description: "A 3x3 filter slides over the grid, acting like a specialized flashlight looking for edges and curves.",
    shapeLabel: "26 × 26"
  },
  {
    id: 5,
    name: "The Multi-Tasking Team",
    shortName: "Filters",
    description: "One filter isn't enough. We run several in parallel—some look for horizontal lines, others for loops.",
    shapeLabel: "26 × 26 × 8"
  },
  {
    id: 6,
    name: "Cleaning Up the Signal",
    shortName: "ReLU",
    description: "Neurons either fire or they don't. This step (ReLU) simply deletes any negative 'distractions' by turning them to zero.",
    shapeLabel: "26 × 26 × 8"
  },
  {
    id: 7,
    name: "Summarizing Features",
    shortName: "Pooling",
    description: "To save space and focus on what matters, we shrink the grid. We keep only the strongest signal in every 2x2 area.",
    shapeLabel: "13 × 13 × 8"
  },
  {
    id: 8,
    name: "Unrolling the Data",
    shortName: "Flatten",
    description: "We take all those 2D pattern maps and unroll them into one long list of numbers, ready for final judgment.",
    shapeLabel: "400"
  },
  {
    id: 9,
    name: "Making Connections",
    shortName: "Dense",
    description: "Every pattern we found is weighed together. This is where the network finally asks: 'Which digit does this look like?'",
    shapeLabel: "64"
  },
  {
    id: 10,
    name: "Calculating Certainty",
    shortName: "Softmax",
    description: "Raw scores are hard to read, so we normalize them into percentages. This creates a clear 'confidence' profile.",
    shapeLabel: "10"
  },
  {
    id: 11,
    name: "The Final Verdict",
    shortName: "Output",
    description: "The digit with the highest percentage wins. Here is the AI's final answer and how confident it feels.",
    shapeLabel: "1"
  },
  {
    id: 12,
    name: "Learning from Mistakes",
    shortName: "Learning",
    description: "If the AI was wrong, it looks back and adjusts its weights. This 'backward flow' is how machines actually learn.",
    shapeLabel: "1"
  }
];
