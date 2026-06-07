import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLabStore } from '../hooks/useLabStore'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { CNN_STAGES } from '../types/cnn'
import { PreprocessingPreview } from './DrawingStage/PreprocessingPreview'
import { sceneTransition } from '../animations/motion'

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
  return <div className="flex min-h-[300px] items-center justify-center text-sm text-text-muted">Loading stage...</div>
}

function StageEmptyState({ stageName, description }: { stageName: string; description: string }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
      <div className="max-w-md rounded-xl border border-dashed border-border-muted bg-bg-card/20 p-8">
        <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-accent">Data required</p>
        <h3 className="mt-3 text-lg font-display font-semibold text-text-primary">{stageName}</h3>
        <p className="mt-3 text-xs leading-relaxed text-text-muted">{description}</p>
      </div>
    </div>
  )
}

/**
 * Routes the current lesson stage to its visualization and keeps unavailable
 * model/data states explicit instead of substituting fabricated values.
 */
export function StageViewer() {
  const currentStageId = useLabStore((state) => state.currentStageId)
  const preprocessedData = useLabStore((state) => state.preprocessedData)
  const activations = useLabStore((state) => state.activations)
  const prediction = useLabStore((state) => state.prediction)
  const setSelectedActivationLayer = useLabStore((state) => state.setSelectedActivationLayer)
  const setCurrentStageId = useLabStore((state) => state.setCurrentStageId)
  const shouldReduceMotion = useReducedMotion()
  const stage = CNN_STAGES.find((item) => item.id === currentStageId) ?? CNN_STAGES[0]

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
        return <PreprocessingPreview />
      case 2:
      case 3:
        return <TensorGridPreview />
      case 4:
      case 5:
      case 6:
        return <ConvolutionStage />
      case 7:
        return <FeatureMapGrid />
      case 8:
        return <ReluStage />
      case 9:
        return <PoolingStage />
      case 10:
        return <FlattenStage />
      case 11:
        return <DenseStage />
      case 12:
        return <SoftmaxStage />
      case 13:
        return <PredictionStage />
      default:
        return null
    }
  }

  return (
    <section className="aurora-card min-w-0 overflow-hidden p-0 scroll-mt-4" id="stage-viewer">
      <header className="flex flex-col gap-4 border-b border-border-muted bg-bg-deep/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-mono font-semibold text-aurora-purple">
            Chapter {currentStageId} of 13
          </p>
          <h2 className="mt-1 text-xl font-semibold text-text-primary">{stage.name}</h2>
          <span className="mt-2 inline-flex rounded border border-text-accent/35 bg-text-accent/5 px-2 py-1 text-[10px] font-mono text-text-accent">
            tensor {stage.shapeLabel}
          </span>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
          <button className="btn-secondary min-h-11" disabled={currentStageId === 1} onClick={() => setCurrentStageId(currentStageId - 1)} type="button">
            Back
          </button>
          <button className="btn-primary min-h-11" disabled={currentStageId === 13 || !preprocessedData} onClick={() => setCurrentStageId(currentStageId + 1)} type="button">
            Next
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${currentStageId}-${Boolean(preprocessedData)}-${activations.length}-${Boolean(prediction)}`}
          initial={shouldReduceMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, x: -8 }}
          transition={shouldReduceMotion ? { duration: 0 } : sceneTransition}
        >
          <Suspense fallback={<StageLoadingState />}>{renderStage()}</Suspense>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
