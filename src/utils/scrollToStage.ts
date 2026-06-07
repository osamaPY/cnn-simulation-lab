export function scrollToStageViewer() {
  window.requestAnimationFrame(() => {
    document.getElementById('stage-viewer')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  })
}
