import numpy as np

def explain_convolution():
    print("--- 1. CONVOLUTION ---")
    print("Think of a convolution as a 'feature flashlight'.")
    print("We slide a small grid (the kernel) over our image to find specific patterns.")
    
    # Simple 5x5 image of a vertical line
    image = np.array([
        [0, 255, 0, 0, 0],
        [0, 255, 0, 0, 0],
        [0, 255, 0, 0, 0],
        [0, 255, 0, 0, 0],
        [0, 255, 0, 0, 0]
    ])
    
    # A 3x3 kernel designed to detect vertical lines
    kernel = np.array([
        [-1, 2, -1],
        [-1, 2, -1],
        [-1, 2, -1]
    ])
    
    print("\nInput Image (Vertical Line):")
    print(image)
    print("\nVertical Detection Kernel:")
    print(kernel)
    
    # Manual 3x3 convolution on the center
    # (Simplified for explanation)
    output = np.zeros((3, 3))
    for i in range(3):
        for j in range(3):
            region = image[i:i+3, j:j+3]
            output[i, j] = np.sum(region * kernel)
            
    print("\nConvolution Output (High values mean feature detected!):")
    print(output)

def explain_relu():
    print("\n--- 2. ReLU (Rectified Linear Unit) ---")
    print("ReLU is the simplest filter: it throws away anything negative.")
    print("In nature, neurons don't fire 'negatively'—they either fire or they don't.")
    
    scores = np.array([-10, 50, -2, 0, 100])
    activated = np.maximum(0, scores)
    
    print(f"\nRaw Scores: {scores}")
    print(f"After ReLU: {activated}")

def explain_pooling():
    print("\n--- 3. MAX POOLING ---")
    print("Pooling makes the network 'invariant' to small shifts.")
    print("If we see a nose, it doesn't matter if it's 2 pixels to the left or right.")
    
    # A 4x4 feature map
    feature_map = np.array([
        [10, 20, 0, 0],
        [40, 30, 0, 5],
        [0, 0, 80, 10],
        [0, 5, 20, 30]
    ])
    
    print("\n4x4 Feature Map:")
    print(feature_map)
    
    # 2x2 Max Pooling
    pooled = np.zeros((2, 2))
    for i in range(0, 4, 2):
        for j in range(0, 4, 2):
            pooled[i//2, j//2] = np.max(feature_map[i:i+2, j:j+2])
            
    print("\nAfter 2x2 Max Pooling (Reduced to 2x2, kept strongest signals):")
    print(pooled)

def explain_softmax():
    print("\n--- 4. SOFTMAX ---")
    print("Finally, we turn raw scores into percentages that sum to 100%.")
    
    logits = np.array([2.0, 1.0, 0.1]) # Scores for '3', '5', '8'
    exponentials = np.exp(logits)
    probabilities = exponentials / np.sum(exponentials)
    
    print(f"\nRaw Logits (Scores): {logits}")
    print(f"Probabilities: {probabilities}")
    print(f"Sum: {np.sum(probabilities)}")

if __name__ == "__main__":
    print("=== CNN ALGORITHM WALKTHROUGH (The Python Perspective) ===\n")
    explain_convolution()
    explain_relu()
    explain_pooling()
    explain_softmax()
    print("\nDone! This is exactly what the visualizer is doing in your browser.")
