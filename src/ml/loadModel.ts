import * as tf from '@tensorflow/tfjs';

let loadedModel: tf.LayersModel | null = null;

/**
 * Loads the pre-trained Keras LayersModel from the public folder.
 * Handles logging and validation of the network topology.
 */
export async function loadCNNModel(): Promise<tf.LayersModel> {
  if (loadedModel) {
    return loadedModel;
  }

  // Load from the public directory path
  const modelUrl = '/model/model.json';
  
  try {
    const model = await tf.loadLayersModel(modelUrl);
    
    // Log layers metadata to ensure shape accuracy
    console.log('--- CNN model loaded successfully ---');
    console.log(`Model Inputs: ${model.inputs.map(i => i.name).join(', ')}`);
    model.layers.forEach((layer) => {
      const outputShape = Array.isArray(layer.outputShape)
        ? layer.outputShape.join(' x ')
        : JSON.stringify(layer.outputShape);
      console.log(`Layer: "${layer.name}" | Type: ${layer.getClassName()} | Output Shape: ${outputShape}`);
    });
    console.log('------------------------------------');
    
    loadedModel = model;
    return model;
  } catch (error) {
    console.error('Failed to load layers model from:', modelUrl, error);
    throw error;
  }
}

/**
 * Gets the currently loaded model instance, if available.
 */
export function getModelInstance(): tf.LayersModel | null {
  return loadedModel;
}
