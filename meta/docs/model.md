# Model

CNN Digit Lab includes a compact Keras CNN exported for TensorFlow.js. It is
trained on MNIST and intended for educational, MNIST-style handwritten digits.

## Contract

| Layer | Output shape |
| --- | --- |
| Input | `28 x 28 x 1` |
| Conv2D + ReLU, 8 filters | `26 x 26 x 8` |
| MaxPool | `13 x 13 x 8` |
| Conv2D + ReLU, 16 filters | `11 x 11 x 16` |
| MaxPool | `5 x 5 x 16` |
| Flatten | `400` |
| Dense + ReLU | `64` |
| Dense + Softmax | `10` |

The included model reached **98.43% MNIST test accuracy**. That metric does not
guarantee correct predictions for unusual, off-center, or non-MNIST drawings.

## Runtime Files

The deployable model lives in:

```text
public/model/model.json
public/model/group1-shard1of1.bin
```

`src/ml/loadModel.ts` loads these files through `import.meta.env.BASE_URL` and
validates the input and output contract before using the model.

## Training And Export

```bash
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate

pip install -r train/requirements.txt
python train/train_mnist.py
tensorflowjs_converter --input_format=keras train/mnist_model.h5 public/model/
```

See [`train/README.md`](../train/README.md) and
[`train/convert_to_tfjs.md`](../train/convert_to_tfjs.md) for platform notes.

## Real And Simplified Views

Predictions, probabilities, activation arrays, feature maps, and tensor shapes
come from the real loaded model. The convolution lesson may use a labeled
representative kernel, and dense-layer wiring shows a labeled sampled subset so
the educational view remains readable.

