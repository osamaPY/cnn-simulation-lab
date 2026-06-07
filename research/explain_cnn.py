import numpy as np

def explain_convolution():
    """
    Demonstrates a 2D convolution operation using a vertical edge detection kernel.
    """
    print("--- 1. CONVOLUTION ---")
    
    # 5x5 input image with a vertical line feature
    image = np.array([
        [0, 255, 0, 0, 0],
        [0, 255, 0, 0, 0],
        [0, 255, 0, 0, 0],
        [0, 255, 0, 0, 0],
        [0, 255, 0, 0, 0]
    ])
    
    # 3x3 vertical edge detection kernel (Sobel-like)
    kernel = np.array([
        [-1, 2, -1],
        [-1, 2, -1],
        [-1, 2, -1]
    ])
    
    print("\nInput Image (2D Intensity Matrix):")
    print(image)
    print("\nVertical Detection Kernel:")
    print(kernel)
    
    # Compute 2D convolution with valid padding
    h, w = image.shape
    kh, kw = kernel.shape
    output = np.zeros((h - kh + 1, w - kw + 1))
    
    for i in range(output.shape[0]):
        for j in range(output.shape[1]):
            region = image[i:i+kh, j:j+kw]
            output[i, j] = np.sum(region * kernel)
            
    print("\nConvolution Feature Map (Output):")
    print(output)

def explain_relu():
    """
    Demonstrates Rectified Linear Unit (ReLU) activation.
    """
    print("\n--- 2. ReLU ACTIVATION ---")
    
    scores = np.array([-10, 50, -2, 0, 100])
    activated = np.maximum(0, scores)
    
    print(f"\nPre-activation Scores: {scores}")
    print(f"Post-ReLU Activations: {activated}")

def explain_pooling():
    """
    Demonstrates 2x2 Max Pooling for spatial downsampling.
    """
    print("\n--- 3. MAX POOLING ---")
    
    # 4x4 input feature map
    feature_map = np.array([
        [10, 20, 0, 0],
        [40, 30, 0, 5],
        [0, 0, 80, 10],
        [0, 5, 20, 30]
    ])
    
    print("\nInput Feature Map (4x4):")
    print(feature_map)
    
    # 2x2 Max Pooling with stride 2
    h, w = feature_map.shape
    pooled = np.zeros((h // 2, w // 2))
    for i in range(0, h, 2):
        for j in range(0, w, 2):
            pooled[i//2, j//2] = np.max(feature_map[i:i+2, j:j+2])
            
    print("\nPooled Output (2x2):")
    print(pooled)

def explain_softmax():
    """
    Demonstrates Softmax normalization to produce a probability distribution.
    """
    print("\n--- 4. SOFTMAX ---")
    
    logits = np.array([2.0, 1.0, 0.1]) # Unnormalized scores for classes
    exponentials = np.exp(logits)
    probabilities = exponentials / np.sum(exponentials)
    
    print(f"\nRaw Logits: {logits}")
    print(f"Softmax Probabilities: {probabilities}")
    print(f"Total Sum: {np.sum(probabilities)}")

if __name__ == "__main__":
    print("=== CNN Algorithmic Walkthrough ===\n")
    explain_convolution()
    explain_relu()
    explain_pooling()
    explain_softmax()
    print("\nInference simulation complete.")
