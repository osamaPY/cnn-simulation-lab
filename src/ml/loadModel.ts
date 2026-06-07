import * as tf from '@tensorflow/tfjs';

let loadedModel: tf.LayersModel | null = null;
let modelLoadPromise: Promise<tf.LayersModel> | null = null;

/**
 * Loads and caches the exported LayersModel relative to Vite's deployment
 * base, then rejects models that do not match the lesson's public contract.
 */
export async function loadCNNModel(): Promise<tf.LayersModel> {
  if (loadedModel) {
    return loadedModel;
  }

  if (modelLoadPromise) {
    return modelLoadPromise;
  }

  const modelUrl = `${import.meta.env.BASE_URL}model/model.json`;

  modelLoadPromise = (async () => {
    const model = await tf.loadLayersModel(modelUrl);

    const inputShape = model.inputs[0]?.shape;
    const outputShape = model.outputs[0]?.shape;
    const validInput = inputShape?.slice(-3).join(',') === '28,28,1';
    const validOutput = outputShape?.at(-1) === 10;
    if (!validInput || !validOutput) {
      model.dispose();
      throw new Error(
        `Unexpected model contract. Expected input [28,28,1] and 10 output classes; received input [${inputShape?.join(', ')}] and output [${outputShape?.join(', ')}].`,
      );
    }
    loadedModel = model;
    return model;
  })();

  try {
    return await modelLoadPromise;
  } catch (error) {
    modelLoadPromise = null;
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
