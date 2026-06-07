# Converting H5 Model to TensorFlow.js

This document explains how to convert the trained Keras H5 model (`mnist_model.h5`) into the TensorFlow.js web-ready sharded layers format.

## Prerequisite: Install the Converter

You need to install the `tensorflowjs` converter utility. We recommend using a Python virtual environment.

```bash
# Install tensorflowjs using pip
pip install tensorflowjs
```

> [!NOTE]
> If you encounter dependency version conflicts (especially with Numpy or protobuf), you can install a specific version or install it in a clean virtual environment:
> ```bash
> python -m venv venv
> # On Windows:
> .\venv\Scripts\activate
> # On macOS/Linux:
> source venv/bin/activate
> 
> pip install --upgrade pip
> pip install tensorflowjs
> ```

> [!IMPORTANT]
> The TensorFlow.js Python converter's optional decision-forests dependency is unreliable on
> native Windows. Use Linux, WSL, or Colab for the cleanest conversion path. The training script
> enables TensorFlow's legacy Keras H5 schema so the exported LayersModel loads correctly in TF.js.

---

## Conversion Command

Run the following command from the project root directory to compile and place the converted files directly into the web app's public asset server directory:

```bash
# Execute conversion from h5 to tfjs layers format
tensorflowjs_converter --input_format=keras train/mnist_model.h5 public/model/
```

### Expected Output Files
The command will create a new directory `public/model/` (or overwrite existing contents) containing the following assets:
1. **`model.json`**: Describes the neural network graph topology, layer types (convolutions, pooling, activation functions), names, shapes, and weights manifest.
2. **`group1-shard1of1.bin`**: Binary buffer containing the float weight matrices for the convolution kernels, dense weights, and biases.

---

## Verification

After executing the conversion:
1. Start your local Vite dev server: `npm run dev`
2. Open the browser and visit: `http://localhost:5173/`
3. The warning banner **"CNN Model Config Not Found"** should automatically disappear, and the app will display **"Prediction Output"** as ready, indicating the model was successfully loaded over HTTP.
