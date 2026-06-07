# CNN Research Lab — Understanding & Training

This directory contains the Python research scripts and instructions required to understand, train, and convert the pre-trained **MNIST Convolutional Neural Network (CNN)** for use in the browser visualizer.

---

## 🔬 Learning Deep Learning
If you are curious about the math behind the scenes, we've included a script that implements the core operations (Convolution, ReLU, Pooling) from scratch using only `numpy`:

```bash
python research/explain_cnn.py
```

---

## 🛠️ Step 1: Environment Setup

We recommend creating a Python virtual environment to isolate dependencies:

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# On Windows (Command Prompt):
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Upgrade pip & install dependencies
pip install --upgrade pip
pip install -r research/requirements.txt
```

---

## 🏋️ Step 2: Train the MNIST CNN Model

Run the training script to fetch the MNIST dataset, train a small CNN matching our network layers, evaluate test accuracy, and save the model:

```bash
python research/train_mnist.py
```

- **Output**: Generates a compiled Keras model file: `research/mnist_model.h5`.
- **Performance**: Standard training runs for 5 epochs and achieves **~98.5% validation accuracy**.

---

## 🔄 Step 3: Convert to Web-Ready TensorFlow.js Format

To load the model inside the browser, the H5 Keras model must be converted into JSON shards. Run the converter:

```bash
tensorflowjs_converter --input_format=keras research/mnist_model.h5 public/model/
```

- **Destination**: The output files are saved directly to `public/model/`.
- **Files Created**:
  - `public/model/model.json` (layers description and weights metadata)
  - `public/model/group1-shard1of1.bin` (binary weight matrix shard buffers)

---

## ⚡ Step 4: Run the React Application

Once the converted files are placed under `public/model/`, the React dashboard automatically resolves the 404 error and boots the model:

1. Restart or start your Vite development server:
   ```bash
   npm run dev
   ```
2. Open the page in your browser.
3. You will see that the **"CNN Model Config Not Found"** card is gone. The app is now running real in-browser machine learning inference!
