import type { ExplanationContent } from './index';

export const mathExplanations: Record<number, ExplanationContent> = {
  1: {
    headline: "Spatial Normalization",
    body: "Before the network can learn shape, it first needs consistency. Your drawing may be too high, too low, too small, or off to one side, so this step recenters the digit and rescales it into a stable frame. Think of it as placing every handwritten number on the same invisible stage before the real feature extraction begins. Without this alignment, the CNN would waste effort learning position quirks instead of learning what makes a 3 look like a 3.",
    focusFormula: "x_{centered} = S \\cdot (x - x_{centroid}) + 14",
    interactiveGoal: "Observe how the drawing is translated and scaled into a canonical reference frame.",
    keyTakeaway: "Normalization removes accidental variation so later layers can focus on meaningful structure."
  },
  2: {
    headline: "Macro-Structure Overview",
    body: "Modern CNNs like VGG are built from repeated modular blocks. Each block typically contains multiple Convolutions, non-linear Activations, and a Pooling layer for downsampling. This hierarchy allows the network to build simple features into complex ones: first edges, then textures, then parts, and finally objects. By stacking these blocks, we create a deep network that can understand the world through layers of abstraction.",
    focusFormula: "\\text{Output} = \\text{Pool}(\\text{ReLU}(\\text{Conv}(\\text{Input})))",
    interactiveGoal: "Grasp the sequential flow and repetitive nature of deep feature extraction.",
    keyTakeaway: "Deep learning succeeds by stacking simple operations into complex hierarchical models."
  },
  3: {
    headline: "Rasterization & Grid Discretization",
    body: "Neural networks do not see brush strokes or vector paths. They see numbers arranged in a grid, so your smooth drawing is converted into a 28 by 28 matrix of pixel intensities and then normalized into values between 0 and 1. Each cell becomes a tiny measurable piece of evidence, turning an artistic gesture into a mathematical object the CNN can operate on. This is the moment where handwriting becomes data.",
    focusFormula: "X_{i,j} = \\frac{I_{i,j}}{255.0}",
    interactiveGoal: "Inspect how continuous strokes become a numerical grid of floating-point values.",
    keyTakeaway: "A CNN begins with tensors, so every drawing must become structured numerical input."
  },
  4: {
    headline: "Convolutional Filters",
    body: "Now the first true CNN operation begins. A small kernel slides across the image like a magnifying window, multiplying local pixel patterns and summing them into a new response map. Instead of memorizing the whole digit at once, the network asks a sharper question everywhere: does this neighborhood contain an edge, corner, stroke, or contrast pattern I care about? Convolution is powerful because one small set of weights can search the entire image for the same visual clue.",
    focusFormula: "Y_{i,j} = \\sum_{m} \\sum_{n} X_{i \\cdot s + m, j \\cdot s + n} \\cdot K_{m,n} + b",
    interactiveGoal: "Watch the kernel sweep spatially and compute local dot products at each position.",
    keyTakeaway: "Convolution detects local visual patterns while reusing the same learned filter everywhere."
  },
  5: {
    headline: "Stacking Depth Channels",
    body: "One filter is not enough to understand a digit. Different kernels specialize in different visual motifs, so the network runs many of them in parallel and stacks the results into depth channels. One channel may respond to vertical strokes, another to diagonals, another to loops or intersections. The image is no longer just width and height now; it has depth, and that depth represents many learned ways of looking at the same input.",
    focusFormula: "Y \\in \\mathbb{R}^{B \\times H \\times W \\times C_{out}}",
    interactiveGoal: "Switch between channels to see how different filters attend to different structures.",
    keyTakeaway: "Feature depth lets the network build multiple visual interpretations of the same pixels."
  },
  6: {
    headline: "ReLU Activation",
    body: "After convolution, some responses help and some do not. ReLU applies a brutally simple rule: keep positive evidence, erase negative evidence. This introduces nonlinearity, which is what allows neural networks to model complex patterns instead of collapsing into a single linear transformation. Visually, ReLU sharpens the story by highlighting activated structure and suppressing weak or opposing signals.",
    focusFormula: "f(x) = \\max(0, x)",
    interactiveGoal: "Observe which values survive and which are clipped away to zero.",
    keyTakeaway: "ReLU preserves useful activation while giving the network nonlinear expressive power."
  },
  7: {
    headline: "Max Pooling Downsampling",
    body: "The network has now found local patterns, but it does not need exact pixel-perfect positions for all of them. Max pooling compresses each spatial neighborhood into its strongest response, shrinking the spatial map while keeping the most important evidence. This makes the representation lighter, more robust, and less sensitive to tiny shifts in handwriting. In a sense, the network zooms out just enough to keep meaning while discarding redundancy.",
    focusFormula: "P_{i,j,c} = \\max_{m,n} Y_{i \\cdot k + m, j \\cdot k + n, c}",
    interactiveGoal: "Track how each pooling window keeps only the strongest activation and reduces resolution.",
    keyTakeaway: "Pooling trades spatial detail for stronger, more compact feature representations."
  },
  8: {
    headline: "Vector Flattening",
    body: "Up to this point, the network has been thinking spatially in grids and channels. Flattening changes that perspective by unrolling the feature volume into one long vector, preparing it for classic fully connected reasoning. The geometry is not destroyed so much as repackaged: every number in the vector still came from a meaningful place in the feature maps. This is the bridge between visual feature extraction and final decision-making.",
    focusFormula: "x_k = Y_{i, j, c}",
    interactiveGoal: "Trace vector entries back to their original spatial and channel positions.",
    keyTakeaway: "Flattening converts structured feature maps into a form dense layers can score globally."
  },
  9: {
    headline: "Matrix-Vector Product",
    body: "Dense layers combine evidence from across the entire image at once. Each neuron looks at the flattened vector through its own learned weight pattern and decides how strongly the current digit matches a higher-level concept. You can think of these neurons as judges that weigh many clues simultaneously: top curve, bottom loop, stroke thickness, central gap, and more. This is where local features start turning into semantic guesses such as maybe this is a 5, maybe it is a 3.",
    focusFormula: "a = \\max(0, W_1 \\cdot x + b_1)",
    interactiveGoal: "See how many inputs contribute to each hidden neuron and how global evidence is combined.",
    keyTakeaway: "Dense layers perform global reasoning by combining many extracted features at once."
  },
  10: {
    headline: "Softmax Normalization",
    body: "The dense layer outputs raw scores called logits, but logits are not probabilities yet. Softmax transforms those competing scores into a distribution that sums to 1, making the model's confidence interpretable. A slightly stronger logit becomes much more persuasive after exponentiation, so softmax amplifies relative advantage while still forcing all classes to compete for the same total mass. This is the point where the network stops saying score and starts saying belief.",
    focusFormula: "\\sigma(z)_i = \\frac{e^{z_i}}{\\sum e^{z_j}}",
    interactiveGoal: "Watch unbounded logits convert into a normalized probability distribution over digits 0 through 9.",
    keyTakeaway: "Softmax turns raw class evidence into interpretable probabilities."
  },
  11: {
    headline: "Final Prediction",
    body: "Once probabilities are available, the network makes its visible decision by choosing the class with the highest value. This is the moment users care about, but it is really just the surface of everything that came before: normalization, convolution, activation, pooling, and dense reasoning. A confident prediction is the final summary of many layered transformations working together. The chosen digit is not magic; it is the winner of a long internal argument.",
    focusFormula: "\\hat{y} = \\arg\\max_{i} \\sigma(z)_i",
    interactiveGoal: "Compare the predicted class against the full probability distribution to see why it won.",
    keyTakeaway: "Prediction is simply the highest-probability class after the full feature pipeline has spoken."
  },
  12: {
    headline: "Backpropagation Learning",
    body: "Inference explains what the network believes right now, but learning explains how it gets better. Backpropagation sends the error backward through every layer using gradients, measuring how each weight contributed to the mistake. Then gradient descent nudges those weights in directions that would reduce future loss. This is the secret engine of improvement: the CNN rewires itself little by little until filters that were once random become detectors for meaningful structure.",
    focusFormula: "W_{new} = W_{old} - \\eta \\cdot \\frac{\\partial L}{\\partial W}",
    interactiveGoal: "Follow the error signal backward and see how gradients reshape parameters across the network.",
    keyTakeaway: "Backpropagation is how the network learns better filters, better weights, and better predictions over time."
  }
};
