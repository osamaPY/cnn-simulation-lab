import { create } from 'zustand';
import { CNN_STAGES } from '../types/cnn';
import type { TeachingMode, PredictionResult, StageInfo } from '../types/cnn';
import { loadCNNModel } from '../ml/loadModel';
import { runModelInference } from '../ml/runInference';
import type { ActivationRecord } from '../ml/activationModel';
import * as tf from '@tensorflow/tfjs';

interface LabState {
  // State variables
  currentStageId: number;
  selectedMode: TeachingMode;
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

  // Getters
  getActiveStageInfo: () => StageInfo;
  
  // Actions
  setCurrentStageId: (id: number) => void;
  setSelectedMode: (mode: TeachingMode) => void;
  setHasDrawing: (hasDrawing: boolean) => void;
  setPrediction: (prediction: PredictionResult | null) => void;
  setOriginalCanvasThumbnail: (url: string | null) => void;
  setPreprocessedData: (
    data: Float32Array | null,
    debug: LabState['preprocessingDebug']
  ) => void;
  
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

export const useLabStore = create<LabState>((set, get) => ({
  // Initial State
  currentStageId: 1,
  selectedMode: 'beginner',
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

  // Getters
  getActiveStageInfo: () => {
    const id = get().currentStageId;
    return CNN_STAGES.find(s => s.id === id) || CNN_STAGES[0];
  },

  // Actions
  setCurrentStageId: (id) => {
    const safeId = Math.max(1, Math.min(13, id));
    set({ currentStageId: safeId });
  },

  setSelectedMode: (mode) => {
    set({ selectedMode: mode });
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
      await loadCNNModel();
      set({ modelStatus: 'success' });
    } catch (err: any) {
      set({ 
        modelStatus: 'error', 
        inferenceError: err?.message || 'Error occurred while loading model.json.' 
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
        tfMemoryDebug: {
          numTensors: tf.memory().numTensors,
          numBytes: tf.memory().numBytes
        }
      });
    } catch (err: any) {
      set({ 
        inferenceError: err?.message || 'Error occurred during inference calculation.' 
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
