import { lazy, Suspense, useEffect, useRef } from 'react'
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

function StageLoadingState() {
  return <div className="flex h-full w-full items-center justify-center text-lg font-mono text-white/50">Loading simulation frame...</div>
}

function StageEmptyState({ stageName, description }: { stageName: string; description: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-6 text-center">
      <div className="max-w-xl rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md p-10 shadow-2xl">
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-aurora-mint">Data required</p>
        <h3 className="mt-4 text-2xl font-display font-semibold text-white">{stageName}</h3>
        <p className="mt-4 text-base leading-relaxed text-white/70">{description}</p>
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
  const setSelectedActivationLayer = useLabStore((state) => state.setSelectedActivationLayer)
  const shouldReduceMotion = useReducedMotion()
  const stage = CNN_STAGES.find((item) => item.id === currentStageId) ?? CNN_STAGES[0]

  const prevStageIdRef = useRef(currentStageId)
  const direction = currentStageId >= prevStageIdRef.current ? 1 : -1

  useEffect(() => {
    prevStageIdRef.current = currentStageId
  }, [currentStageId])

  useEffect(() => {
    if (currentStageId === 7) {
      const firstConv = activations.find((record) => record.layerType === 'Conv2D')
      if (firstConv) setSelectedActivationLayer(firstConv.layerName)
    }
  }, [activations, currentStageId, setSelectedActivationLayer])

  const missingState = !preprocessedData
    ? 'Draw a digit and click Run Simulation to generate the real preprocessing data.'
    : (currentStageId === 7 || (currentStageId >= 9 && currentStageId <= 11)) && activations.length === 0
      ? 'This stage requires intermediate activations from the exported TensorFlow.js model. Add the model under public/model and run the simulation again.'
      : currentStageId >= 12 && !prediction
        ? 'This stage requires a successful model prediction. Add the exported model, then draw a digit and run the simulation again.'
        : null

  const renderStage = () => {
    if (missingState) return <StageEmptyState stageName={stage.name} description={missingState} />

    switch (currentStageId) {
      case 1:
        return <div className="flex flex-col items-center justify-center w-full h-full"><PreprocessingPreview /></div>
      case 2:
      case 3:
        return <div className="flex w-full h-full items-center justify-center"><TensorGridPreview /></div>
      case 4:
      case 5:
      case 6:
        return <div className="flex w-full h-full items-center justify-center scale-95"><ConvolutionStage /></div>
      case 7:
        return <div className="flex w-full h-full items-center justify-center"><FeatureMapGrid /></div>
      case 8:
        return <div className="flex w-full h-full items-center justify-center"><ReluStage /></div>
      case 9:
        return <div className="flex w-full h-full items-center justify-center"><PoolingStage /></div>
      case 10:
        return <div className="flex w-full h-full items-center justify-center"><FlattenStage /></div>
      case 11:
        return <div className="flex w-full h-full items-center justify-center"><DenseStage /></div>
      case 12:
        return <div className="flex w-full h-full items-center justify-center"><SoftmaxStage /></div>
      case 13:
        return <div className="flex w-full h-full items-center justify-center"><PredictionStage /></div>
      default:
        return null
    }
  }

  const slideTransition = {
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1] as const, // Ultra smooth mathematical easeOut
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 pointer-events-auto" id="stage-viewer">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="w-full h-full flex items-center justify-center"
          key={`${currentStageId}-${Boolean(preprocessedData)}-${activations.length}-${Boolean(prediction)}`}
          initial={shouldReduceMotion ? false : { opacity: 0, x: direction * 60, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, x: -direction * 60, scale: 0.98 }}
          transition={shouldReduceMotion ? { duration: 0 } : slideTransition}
        >
          <Suspense fallback={<StageLoadingState />}>{renderStage()}</Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
