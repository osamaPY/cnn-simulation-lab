import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLabStore } from '../hooks/useLabStore'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { CNN_STAGES } from '../types/cnn'
import { PreprocessingPreview } from './DrawingStage/PreprocessingPreview'

const TensorGridPreview = lazy(() =>
  import('./TensorGridStage/TensorGridPreview').then((module) => ({ default: module.TensorGridPreview })),
)
const FeatureMapGrid = lazy(() =>
  import('../components/FeatureMapGrid').then((module) => ({ default: module.FeatureMapGrid })),
)
const ConvolutionStage = lazy(() =>
  import('./ConvolutionStage/ConvolutionStage').then((module) => ({ default: module.ConvolutionStage })),
)
const ArchitectureStage = lazy(() =>
  import('./ArchitectureStage/ArchitectureStage').then((module) => ({ default: module.ArchitectureStage })),
)
const PoolingStage = lazy(() =>
  import('./PoolingStage/PoolingStage').then((module) => ({ default: module.PoolingStage })),
)
const ReluStage = lazy(() =>
  import('./ReluStage/ReluStage').then((module) => ({ default: module.ReluStage })),
)
const FlattenStage = lazy(() =>
  import('./FlattenStage/FlattenStage').then((module) => ({ default: module.FlattenStage })),
)
const DenseStage = lazy(() =>
  import('./DenseStage/DenseStage').then((module) => ({ default: module.DenseStage })),
)
const SoftmaxStage = lazy(() =>
  import('./SoftmaxStage/SoftmaxStage').then((module) => ({ default: module.SoftmaxStage })),
)
const PredictionStage = lazy(() =>
  import('./PredictionStage/PredictionStage').then((module) => ({ default: module.PredictionStage })),
)
const BackpropStage = lazy(() =>
  import('./BackpropStage/BackpropStage').then((module) => ({ default: module.BackpropStage })),
)

function StageLoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-white/20 border-t-aurora-purple rounded-full animate-spin" />
        <span className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Loading frame…</span>
      </div>
    </div>
  )
}

function StageEmptyState({ stageName, description }: { stageName: string; description: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-6 text-center">
      <div className="max-w-xl p-10">
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.4em] text-[#83C167]">Data required</p>
        <h3 className="mt-4 text-3xl font-serif font-bold text-[#FFFEF0] italic">{stageName}</h3>
        <p className="mt-6 text-base leading-relaxed text-white/40 font-sans">{description}</p>
      </div>
    </div>
  )
}

/**
 * Renders the interactive visualization inside the cinematic viewport.
 * Stripped of all borders/headers to fill the screen cleanly.
 */
export function StageViewer() {
  const currentStageId = useLabStore((state) => state.currentStageId)
  const preprocessedData = useLabStore((state) => state.preprocessedData)
  const activations = useLabStore((state) => state.activations)
  const prediction = useLabStore((state) => state.prediction)
  const modelStatus = useLabStore((state) => state.modelStatus)
  const inferenceError = useLabStore((state) => state.inferenceError)
  const setSelectedActivationLayer = useLabStore((state) => state.setSelectedActivationLayer)
  const shouldReduceMotion = useReducedMotion()
  const stage = CNN_STAGES.find((item) => item.id === currentStageId) ?? CNN_STAGES[0]

  const [prevStageId, setPrevStageId] = useState(currentStageId)
  if (currentStageId !== prevStageId) {
    setPrevStageId(currentStageId)
  }

  useEffect(() => {
    if (currentStageId === 4) {
      const firstConv = activations.find((record) => record.layerType === 'Conv2D')
      if (firstConv) setSelectedActivationLayer(firstConv.layerName)
    }
  }, [activations, currentStageId, setSelectedActivationLayer])

  const missingState = !preprocessedData
    ? 'Draw a digit and click Run Simulation to generate the real preprocessing data.'
    : (currentStageId === 4 || (currentStageId >= 6 && currentStageId <= 8)) && activations.length === 0
      ? modelStatus === 'error'
        ? `Model failed to load: ${inferenceError}. Please check if model.json exists in public/model/.`
        : modelStatus === 'loading'
          ? 'The model is still loading. Please wait a moment…'
          : 'This stage requires intermediate activations. If the model is loaded, try running the simulation again.'
      : currentStageId >= 9 && currentStageId !== 11 && !prediction
        ? modelStatus === 'error'
          ? `Inference failed: ${inferenceError}.`
          : 'This stage requires a successful model prediction. Run the simulation again.'
        : null

  const renderStage = () => {
    if (missingState) return <StageEmptyState stageName={stage.name} description={missingState} />

    switch (currentStageId) {
      case 1:
        return <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl mx-auto"><PreprocessingPreview /></div>
      case 2:
        return <div className="flex w-full h-full items-center justify-center"><ArchitectureStage /></div>
      case 3:
        return <div className="flex w-full h-full items-center justify-center"><TensorGridPreview /></div>
      case 4:
        return <div className="flex w-full h-full items-center justify-center"><ConvolutionStage /></div>
      case 5:
        return <div className="flex w-full h-full items-center justify-center"><FeatureMapGrid /></div>
      case 6:
        return <div className="flex w-full h-full items-center justify-center"><ReluStage /></div>
      case 7:
        return <div className="flex w-full h-full items-center justify-center"><PoolingStage /></div>
      case 8:
        return <div className="flex w-full h-full items-center justify-center"><FlattenStage /></div>
      case 9:
        return <div className="flex w-full h-full items-center justify-center"><DenseStage /></div>
      case 10:
        return <div className="flex w-full h-full items-center justify-center"><SoftmaxStage /></div>
      case 11:
        return <div className="flex w-full h-full items-center justify-center"><PredictionStage /></div>
      case 12:
        return <div className="flex w-full h-full items-center justify-center"><BackpropStage /></div>
      default:
        return null
    }
  }

  const slideTransition = {
    duration: 0.8,
    ease: [0.19, 1, 0.22, 1] as const,
  }

  return (
    // Reduced from p-8 sm:p-16 — gives stage visualizations ~80px more space
    <div className={`relative w-full h-full flex flex-col items-center justify-center pointer-events-auto overflow-y-auto ${(currentStageId === 9 || currentStageId === 10) ? 'p-0' : 'p-3 sm:p-6'}`} id="stage-viewer">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="w-full h-full flex flex-col items-center justify-center"
          key={`${currentStageId}-${Boolean(preprocessedData)}-${activations.length}-${Boolean(prediction)}`}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, y: -40, scale: 1.05 }}
          transition={shouldReduceMotion ? { duration: 0 } : slideTransition}
        >
          <Suspense fallback={<StageLoadingState />}>{renderStage()}</Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
