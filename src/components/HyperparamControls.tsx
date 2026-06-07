import React from 'react';
import { useLabStore } from '../hooks/useLabStore';

export const HyperparamControls: React.FC = () => {
  const currentStageId = useLabStore(state => state.currentStageId);

  // Define static specifications of the pre-trained model
  const specs = [
    { name: 'Input Grid', shape: '28×28×1', details: 'Grayscale image', stageId: 3 },
    { name: 'Conv2D (1)', shape: '26×26×8', details: '8 filters (3×3), Stride 1', stageId: 4 },
    { name: 'ReLU (1)', shape: '26×26×8', details: 'f(x) = max(0, x)', stageId: 6 },
    { name: 'MaxPool2D (1)', shape: '13×13×8', details: '2×2 window, Stride 2', stageId: 7 },
    { name: 'Conv2D (2)', shape: '11×11×16', details: '16 filters (3×3), Stride 1', stageId: 5 },
    { name: 'MaxPool2D (2)', shape: '5×5×16', details: '2×2 window, Stride 2', stageId: 7 },
    { name: 'Flatten', shape: '400', details: '1D vector unrolling', stageId: 8 },
    { name: 'Dense (Hidden)', shape: '64', details: 'Fully-connected ReLU', stageId: 9 },
    { name: 'Dense (Out)', shape: '10', details: 'Logit scores', stageId: 9 },
    { name: 'Softmax', shape: '10', details: 'Confidence simplex', stageId: 10 },
  ];

  const setCurrentStageId = useLabStore(state => state.setCurrentStageId);

  return (
    <div className="flex flex-col gap-3 w-full select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-1">
        <h3 className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-aurora-teal/80">
          CNN Specification
        </h3>
        <span className="text-[7.5px] font-mono text-white/30 uppercase tracking-widest">
          Active Model
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {specs.map((spec, idx) => {
          const isCurrentStage = spec.stageId === currentStageId;
          return (
            <button
              key={idx}
              onClick={() => setCurrentStageId(spec.stageId)}
              className={`flex flex-col gap-0.5 p-1.5 rounded text-left transition-all border outline-none cursor-pointer ${
                isCurrentStage
                  ? 'bg-aurora-teal/5 border-aurora-teal/30 shadow-[0_0_8px_rgba(88,196,221,0.1)]'
                  : 'bg-black/10 border-transparent hover:bg-white/[0.02] hover:border-white/5'
              }`}
              type="button"
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[8px] font-mono font-semibold tracking-wide uppercase ${
                  isCurrentStage ? 'text-aurora-teal' : 'text-white/70'
                }`}>
                  {spec.name}
                </span>
                <span className="text-[8.5px] font-mono font-bold text-white/80">
                  {spec.shape}
                </span>
              </div>
              <span className="text-[7.5px] font-mono text-white/30 leading-none">
                {spec.details}
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-[7px] font-mono text-white/20 italic leading-snug text-center mt-1">
        Specs are fixed to the loaded model weights. Click a layer card to jump to its visualization stage.
      </div>
    </div>
  );
};
