import * as tf from '@tensorflow/tfjs';
import { getModelInstance } from './loadModel';
import { extractActivations } from './activationModel';
import type { ActivationRecord } from './activationModel';
import type { PredictionResult } from '../types/cnn';
import { argmax } from '../math/classification';

export interface InferenceResult {
  prediction: PredictionResult;
  activations: ActivationRecord[];
}

/**
 * Runs inference on preprocessed digit data and extracts layer activations.
 */
export async function runModelInference(preprocessedData: Float32Array): Promise<InferenceResult> {
  const model = getModelInstance();
  if (!model) {
    throw new Error('Model not initialized.');
  }

  let prediction: PredictionResult | null = null;
  let activations: ActivationRecord[] = [];

  tf.tidy(() => {
    const inputTensor = tf.tensor4d(preprocessedData, [1, 28, 28, 1]);
    const outputTensor = model.predict(inputTensor) as tf.Tensor;
    const probabilitiesArray = Array.from(outputTensor.dataSync());
    
    const predictedDigit = argmax(probabilitiesArray);
    const confidence = probabilitiesArray[predictedDigit];

    prediction = {
      digit: predictedDigit,
      confidence,
      probabilities: probabilitiesArray,
    };

    activations = extractActivations(model, inputTensor);
  });

  return {
    prediction: prediction!,
    activations
  };
}
