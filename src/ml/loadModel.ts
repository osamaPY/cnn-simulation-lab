import * as tf from '@tensorflow/tfjs';

let loadedModel: tf.LayersModel | null = null;
let modelLoadPromise: Promise<tf.LayersModel> | null = null;

/**
 * Loads and caches the LayersModel. Validates input/output shapes.
 */
export async function loadCNNModel(): Promise<tf.LayersModel> {
  if (loadedModel) return loadedModel;
  if (modelLoadPromise) return modelLoadPromise;

  const modelUrl = `${import.meta.env.BASE_URL}model/model.json`;

  modelLoadPromise = (async () => {
    const model = await tf.loadLayersModel(modelUrl);

    const inputShape = model.inputs[0]?.shape;
    const outputShape = model.outputs[0]?.shape;
    const validInput = inputShape?.slice(-3).join(',') === '28,28,1';
    const validOutput = outputShape?.at(-1) === 10;

    if (!validInput || !validOutput) {
      model.dispose();
      throw new Error(`Invalid model contract: Input ${inputShape}, Output ${outputShape}`);
    }
    
    loadedModel = model;
    return model;
  })();

  try {
    return await modelLoadPromise;
  } catch (error) {
    modelLoadPromise = null;
    console.error('Failed to load model:', modelUrl, error);
    throw error;
  }
}

export function getModelInstance(): tf.LayersModel | null {
  return loadedModel;
}
