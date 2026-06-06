import * as tf from '@tensorflow/tfjs';
import { getModelInstance } from './loadModel';
import { extractActivations } from './activationModel';
import type { ActivationRecord } from './activationModel';
import type { PredictionResult } from '../types/cnn';

export interface InferenceResult {
  prediction: PredictionResult;
  activations: ActivationRecord[];
}

/**
 * Runs inference on the preprocessed Float32Array digit grid,
 * extracting both prediction outputs and intermediate layer activation tensors.
 */
export async function runModelInference(preprocessedData: Float32Array): Promise<InferenceResult> {
  const model = getModelInstance();
  if (!model) {
    throw new Error('Model has not been initialized. Call loadCNNModel first.');
  }

  let prediction: PredictionResult | null = null;
  let activations: ActivationRecord[] = [];

  // Execute operations inside tf.tidy. It automatically disposes inputTensor, 
  // outputTensor, and intermediate tensors within extractActivations.
  tf.tidy(() => {
    // 1. Reshape the 784-element array into a 4D tensor: [batch, height, width, channels]
    const inputTensor = tf.tensor4d(preprocessedData, [1, 28, 28, 1]);

    // 2. Perform prediction (outputs a probability distribution)
    const outputTensor = model.predict(inputTensor) as tf.Tensor;

    // 3. Extract output values synchronously
    const probabilitiesArray = Array.from(outputTensor.dataSync());
    
    // 4. Compute argmax predicted digit
    const predictedDigit = outputTensor.argMax(1).dataSync()[0];
    const confidence = probabilitiesArray[predictedDigit];

    prediction = {
      digit: predictedDigit,
      confidence,
      probabilities: probabilitiesArray,
      isPlaceholder: false
    };

    // 5. Extract intermediate layer activations
    activations = extractActivations(model, inputTensor);
  });

  return {
    prediction: prediction!,
    activations
  };
}
