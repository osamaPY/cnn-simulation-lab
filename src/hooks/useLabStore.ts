import { create } from 'zustand';
import { CNN_STAGES } from '../types/cnn';
import type { PredictionResult } from '../types/cnn';
import type { ActivationRecord } from '../ml/activationModel';

interface LabState {
  // State variables
  currentStageId: number;
  hasDrawing: boolean;
  prediction: PredictionResult | null;
  preprocessedData: Float32Array | null;
  originalCanvasThumbnail: string | null;
  preprocessingDebug: {
    boundingBox: { minX: number; minY: number; maxX: number; maxY: number } | null;
    centerOfMass: { x: number; y: number } | null;
    shift: { dx: number; dy: number } | null;
    nonzeroPixelCount: number;
  } | null;
  
  // Model States
  modelStatus: 'idle' | 'loading' | 'success' | 'error';
  inferenceError: string | null;
  lastRunTimestamp: number | null;
  
  // Activation States
  activations: ActivationRecord[];
  selectedActivationLayer: string | null;
  selectedChannel: number;
  tfMemoryDebug: { numTensors: number; numBytes: number } | null;
  hoveredDigit: number | null;
  learningMode: 'beginner' | 'mathematical' | 'examprep';

  // Hyperparameters
  hyperparams: {
    kernelSize: number;
    stride: number;
    padding: number;
    poolingSize: number;
    numFilters: number;
  };
  
  // Actions
  updateHyperparams: (params: Partial<LabState['hyperparams']>) => void;
  setCurrentStageId: (id: number) => void;
  setHasDrawing: (hasDrawing: boolean) => void;
  setPrediction: (prediction: PredictionResult | null) => void;
  setOriginalCanvasThumbnail: (url: string | null) => void;
  setPreprocessedData: (
    data: Float32Array | null,
    debug: LabState['preprocessingDebug']
  ) => void;
  setLearningMode: (mode: 'beginner' | 'mathematical' | 'examprep') => void;
  
  // Activation Actions
  setSelectedActivationLayer: (layerName: string | null) => void;
  setSelectedChannel: (channel: number) => void;
  setTfMemoryDebug: (debug: { numTensors: number; numBytes: number } | null) => void;
  setHoveredDigit: (digit: number | null) => void;

  // Model & Inference Actions
  loadModel: () => Promise<void>;
  runInference: () => Promise<void>;
  clearAll: () => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const useLabStore = create<LabState>((set, get) => ({
  // Initial State
  currentStageId: 1,
  hasDrawing: false,
  prediction: null,
  preprocessedData: null,
  originalCanvasThumbnail: null,
  preprocessingDebug: null,
  
  modelStatus: 'idle',
  inferenceError: null,
  lastRunTimestamp: null,

  activations: [],
  selectedActivationLayer: null,
  selectedChannel: 0,
  tfMemoryDebug: null,
  hoveredDigit: null,
  learningMode: 'mathematical',

  hyperparams: {
    kernelSize: 3,
    stride: 1,
    padding: 0,
    poolingSize: 2,
    numFilters: 8,
  },

  updateHyperparams: (params) => {
    set((state) => ({
      hyperparams: { ...state.hyperparams, ...params }
    }));
  },

  setLearningMode: (mode) => set({ learningMode: mode }),

  // Actions
  getActiveStageInfo: () => {
    const id = get().currentStageId;
    return CNN_STAGES.find(s => s.id === id) || CNN_STAGES[0];
  },

  // Actions
  setCurrentStageId: (id) => {
    const safeId = Math.max(1, Math.min(13, id));
    set({ currentStageId: safeId });
  },



  setHasDrawing: (hasDrawing) => {
    set({ hasDrawing });
  },

  setPrediction: (prediction) => {
    set({ prediction });
  },

  setOriginalCanvasThumbnail: (url) => {
    set({ originalCanvasThumbnail: url });
  },

  setPreprocessedData: (data, debug) => {
    set({ preprocessedData: data, preprocessingDebug: debug });
  },

  setSelectedActivationLayer: (layerName) => {
    set({ selectedActivationLayer: layerName, selectedChannel: 0 });
  },

  setSelectedChannel: (channel) => {
    set({ selectedChannel: channel });
  },

  setTfMemoryDebug: (debug) => {
    set({ tfMemoryDebug: debug });
  },

  setHoveredDigit: (digit) => {
    set({ hoveredDigit: digit });
  },

  // Load Model Action
  loadModel: async () => {
    if (get().modelStatus === 'loading' || get().modelStatus === 'success') {
      return;
    }

    set({ modelStatus: 'loading', inferenceError: null });
    try {
      const { loadCNNModel } = await import('../ml/loadModel');
      await loadCNNModel();
      set({ modelStatus: 'success' });
    } catch (error: unknown) {
      set({ 
        modelStatus: 'error', 
        inferenceError: getErrorMessage(error, 'Error occurred while loading model.json.')
      });
    }
  },

  // Run Real Inference Action
  runInference: async () => {
    const data = get().preprocessedData;
    const status = get().modelStatus;

    if (!data) {
      set({ inferenceError: 'No preprocessed data available. Draw first.' });
      return;
    }

    if (status !== 'success') {
      set({ inferenceError: 'CNN Model is not loaded.' });
      return;
    }

    set({ inferenceError: null });
    try {
      const [{ runModelInference }, tf] = await Promise.all([
        import('../ml/runInference'),
        import('@tensorflow/tfjs')
      ]);
      const result = await runModelInference(data);
      
      const currentSelected = get().selectedActivationLayer;
      const firstLayerName = result.activations.length > 0 ? result.activations[0].layerName : null;

      set({ 
        prediction: result.prediction,
        activations: result.activations,
        selectedActivationLayer: currentSelected || firstLayerName,
        selectedChannel: 0, // Reset focus
        lastRunTimestamp: Date.now(),
        // Log TF tensor counts to verify zero leaks
        tfMemoryDebug: import.meta.env.DEV
          ? {
              numTensors: tf.memory().numTensors,
              numBytes: tf.memory().numBytes
            }
          : null
      });
    } catch (error: unknown) {
      set({ 
        inferenceError: getErrorMessage(error, 'Error occurred during inference calculation.')
      });
    }
  },

  clearAll: () => {
    set({
      hasDrawing: false,
      prediction: null,
      preprocessedData: null,
      originalCanvasThumbnail: null,
      preprocessingDebug: null,
      inferenceError: null,
      activations: [],
      selectedActivationLayer: null,
      selectedChannel: 0,
      tfMemoryDebug: null,
      hoveredDigit: null,
      currentStageId: 1, // Reset to first stage
    });
  }
}));
