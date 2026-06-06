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
 * Builds a multi-output model using the loaded LayersModel.
 * It maps the outputs of Conv2D, MaxPooling2D, Flatten, and Dense layers.
 */
export function buildActivationModel(model: tf.LayersModel): tf.LayersModel {
  if (activationModelInstance) {
    return activationModelInstance;
  }

  const inputs = model.inputs;
  const outputs: tf.SymbolicTensor[] = [];
  supportedLayerNames = [];

  model.layers.forEach((layer) => {
    const className = layer.getClassName();
    if (
      className === 'Conv2D' ||
      className === 'MaxPooling2D' ||
      className === 'Flatten' ||
      className === 'Dense'
    ) {
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
 * Extracts intermediate activations for the current input tensor.
 * Runs prediction on the multi-output model and formats statistics.
 */
export function extractActivations(
  model: tf.LayersModel,
  inputTensor: tf.Tensor4D
): ActivationRecord[] {
  const actModel = buildActivationModel(model);
  
  // Run prediction (predict outputs an array of Tensors)
  const layerOutputs = actModel.predict(inputTensor);
  const outputsArray = Array.isArray(layerOutputs) ? layerOutputs : [layerOutputs];

  const records: ActivationRecord[] = [];

  outputsArray.forEach((tensor, index) => {
    const layerName = supportedLayerNames[index];
    const layer = model.getLayer(layerName);
    
    // Read values and compute statistics
    const values = tensor.dataSync() as Float32Array;
    const shape = tensor.shape;
    
    // Find min and max values
    let min = 0;
    let max = 0;
    if (values.length > 0) {
      min = values[0];
      max = values[0];
      for (let i = 1; i < values.length; i++) {
        const val = values[i];
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }

    records.push({
      layerName,
      layerType: layer.getClassName(),
      shape,
      values,
      min,
      max
    });
  });

  // Explicitly dispose of each output tensor to avoid GPU memory leaks
  outputsArray.forEach((tensor) => {
    tensor.dispose();
  });

  return records;
}
