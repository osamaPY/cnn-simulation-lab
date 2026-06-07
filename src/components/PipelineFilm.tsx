import { useEffect, useRef, useState } from 'react';
import { createTimeline, stagger, svg } from 'animejs';
import { useReducedMotion } from '../hooks/useReducedMotion';

const pixels = Array.from({ length: 36 }, (_, index) => index);
const maps = Array.from({ length: 6 }, (_, index) => index);
const probabilities = [0.08, 0.12, 0.2, 0.36, 0.58, 0.78, 0.42, 0.28, 0.16, 0.1];

export function PipelineFilm() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<ReturnType<typeof createTimeline> | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || shouldReduceMotion) return;
    const kernel = scene.querySelector<HTMLElement>('.pipeline-film__kernel');
    const path = scene.querySelector<SVGPathElement>('.pipeline-film__path');
    const result = scene.querySelector<HTMLElement>('.pipeline-film__result');
    if (!kernel || !path || !result) return;

    const timeline = createTimeline({
      autoplay: true,
      defaults: { ease: 'inOutSine' },
    })
      .add(scene.querySelectorAll('.pipeline-film__pixel'), {
        opacity: [0.16, 1],
        scale: [0.7, 1],
        delay: stagger(20, { grid: [6, 6], from: 'center' }),
        duration: 420,
      })
      .add(kernel, {
        x: [0, 112, 28, 140],
        y: [0, 0, 84, 112],
        duration: 1700,
        ease: 'inOutQuad',
      }, '-=100')
      .add(scene.querySelectorAll('.pipeline-film__map'), {
        opacity: [0, 1],
        scale: [0.82, 1],
        delay: stagger(90),
        duration: 520,
      }, '-=800')
      .add(svg.createDrawable(path), {
        draw: ['0 0', '0 1'],
        duration: 700,
        ease: 'outQuart',
      }, '-=260')
      .add(scene.querySelectorAll('.pipeline-film__vector-cell'), {
        opacity: [0, 1],
        scaleX: [0, 1],
        delay: stagger(28),
        duration: 260,
      }, '-=360')
      .add(scene.querySelectorAll('.pipeline-film__probability'), {
        scaleY: [0, 1],
        opacity: [0.2, 1],
        delay: stagger(35),
        duration: 520,
        ease: 'outQuint',
      }, '-=120')
      .add(result, {
        opacity: [0, 1],
        scale: [0.88, 1],
        duration: 480,
        ease: 'outQuint',
      }, '-=200');

    timelineRef.current = timeline;
    return () => {
      timeline.pause();
      timelineRef.current = null;
    };
  }, [replayKey, shouldReduceMotion]);

  return (
    <section className="pipeline-film" aria-label="Animated CNN pipeline overview">
      <header className="pipeline-film__header">
        <div>
          <span>Pipeline preview</span>
          <h2>From ink to probability</h2>
          <p>A short visual overview before you inspect every transformation.</p>
        </div>
        <button className="btn-secondary" onClick={() => setReplayKey((key) => key + 1)} type="button">
          Replay overview
        </button>
      </header>

      <div className="pipeline-film__scene" key={replayKey} ref={sceneRef}>
        <div className="pipeline-film__act pipeline-film__input">
          <span>01 Input</span>
          <div className="pipeline-film__pixel-grid">
            {pixels.map((pixel) => <i className="pipeline-film__pixel" key={pixel} />)}
            <b className="pipeline-film__kernel" />
          </div>
        </div>

        <svg className="pipeline-film__connector" viewBox="0 0 160 40" aria-hidden="true">
          <path className="pipeline-film__path" d="M4 20 C48 20 72 20 156 20" />
        </svg>

        <div className="pipeline-film__act">
          <span>02 Features</span>
          <div className="pipeline-film__maps">
            {maps.map((map) => <i className="pipeline-film__map" key={map} />)}
          </div>
        </div>

        <svg className="pipeline-film__connector" viewBox="0 0 160 40" aria-hidden="true">
          <path className="pipeline-film__path" d="M4 20 C48 20 72 20 156 20" />
        </svg>

        <div className="pipeline-film__act">
          <span>03 Evidence</span>
          <div className="pipeline-film__vector">
            {pixels.slice(0, 18).map((cell) => <i className="pipeline-film__vector-cell" key={cell} />)}
          </div>
        </div>

        <svg className="pipeline-film__connector" viewBox="0 0 160 40" aria-hidden="true">
          <path className="pipeline-film__path" d="M4 20 C48 20 72 20 156 20" />
        </svg>

        <div className="pipeline-film__act">
          <span>04 Probability</span>
          <div className="pipeline-film__bars">
            {probabilities.map((height, digit) => (
              <i
                className="pipeline-film__probability"
                key={digit}
                style={{ height: `${height * 100}%` }}
                title={`Digit ${digit}`}
              />
            ))}
          </div>
          <strong className="pipeline-film__result">4</strong>
        </div>
      </div>
    </section>
  );
}
