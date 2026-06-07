import * as tf from '@tensorflow/tfjs';

export interface ActivationRecord {
  layerName: string;
  layerType: string;
  shape: number[];
  values: Float32Array;
  min: number;
  max: number;
}

let activationModelInstance: tf.LayersModel | null = null;
let supportedLayerNames: string[] = [];

/**
 * Constructs a multi-output model to capture intermediate layer activations.
 */
export function buildActivationModel(model: tf.LayersModel): tf.LayersModel {
  if (activationModelInstance) return activationModelInstance;

  const inputs = model.inputs;
  const outputs: tf.SymbolicTensor[] = [];
  supportedLayerNames = [];

  const TARGET_LAYERS = ['Conv2D', 'MaxPooling2D', 'Flatten', 'Dense'];

  model.layers.forEach((layer) => {
    if (TARGET_LAYERS.includes(layer.getClassName())) {
      if (Array.isArray(layer.output)) {
        outputs.push(...(layer.output as tf.SymbolicTensor[]));
      } else {
        outputs.push(layer.output as tf.SymbolicTensor);
      }
      supportedLayerNames.push(layer.name);
    }
  });

  activationModelInstance = tf.model({ inputs, outputs });
  return activationModelInstance;
}

/**
 * Computes activations and descriptive statistics for intermediate layers.
 */
export function extractActivations(
  model: tf.LayersModel,
  inputTensor: tf.Tensor4D
): ActivationRecord[] {
  const actModel = buildActivationModel(model);
  const layerOutputs = actModel.predict(inputTensor);
  const outputsArray = Array.isArray(layerOutputs) ? layerOutputs : [layerOutputs];

  try {
    return outputsArray.map((tensor, index) => {
      const layerName = supportedLayerNames[index];
      const layer = model.getLayer(layerName);
      const values = tensor.dataSync() as Float32Array;
      
      let min = 0, max = 0;
      if (values.length > 0) {
        min = Math.min(...values);
        max = Math.max(...values);
      }

      return {
        layerName,
        layerType: layer.getClassName(),
        shape: tensor.shape,
        values,
        min,
        max
      };
    });
  } finally {
    outputsArray.forEach(t => t.dispose());
  }
}
