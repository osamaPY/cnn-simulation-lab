import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def train_mnist_model():
    print("TensorFlow Version:", tf.__version__)
    
    # 1. Load MNIST Dataset
    print("Loading MNIST dataset...")
    mnist = keras.datasets.mnist
    (x_train, y_train), (x_test, y_test) = mnist.load_data()

    # 2. Reshape and normalize images
    # Shape goes from (60000, 28, 28) -> (60000, 28, 28, 1) and scales pixels to [0.0, 1.0]
    print("Preprocessing data...")
    x_train = x_train.reshape(-1, 28, 28, 1).astype("float32") / 255.0
    x_test = x_test.reshape(-1, 28, 28, 1).astype("float32") / 255.0

    # 3. Define the CNN Network Topology
    # Spec: Conv2D(8)->MaxPool(2x2)->Conv2D(16)->MaxPool(2x2)->Flatten->Dense(64)->Dense(10)
    print("Compiling network architecture...")
    model = keras.Sequential([
        layers.Input(shape=(28, 28, 1), name="input_1"),
        
        # First Layer Group
        layers.Conv2D(8, (3, 3), activation="relu", name="conv2d_1"),
        layers.MaxPooling2D((2, 2), name="max_pooling2d_1"),
        
        # Second Layer Group
        layers.Conv2D(16, (3, 3), activation="relu", name="conv2d_2"),
        layers.MaxPooling2D((2, 2), name="max_pooling2d_2"),
        
        # Decision Dense Group
        layers.Flatten(name="flatten"),
        layers.Dense(64, activation="relu", name="dense_1"),
        layers.Dense(10, activation="softmax", name="dense_2")
    ])

    model.summary()

    # 4. Compile Model
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    # 5. Train Model
    epochs = 5
    batch_size = 64
    print(f"Training model for {epochs} epochs with batch size {batch_size}...")
    model.fit(
        x_train, y_train,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.1
    )

    # 6. Evaluate model performance
    print("Evaluating model on test dataset...")
    test_loss, test_acc = model.evaluate(x_test, y_test, verbose=2)
    print(f"\nTest Accuracy: {test_acc:.4f} | Test Loss: {test_loss:.4f}")

    # 7. Save model
    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, "mnist_model.h5")
    
    print(f"Saving compiled model to: {model_path}...")
    model.save(model_path)
    
    print("\n--- Training Complete ---")
    print("Next step: Convert this model using tensorflowjs_converter.")
    print("Refer to convert_to_tfjs.md for commands.")

if __name__ == "__main__":
    train_mnist_model()
