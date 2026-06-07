import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function MathFormula({ formula }: { formula: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      katex.render(formula, containerRef.current, {
        displayMode: true,
        throwOnError: false,
      })
    }
  }, [formula])

  return <div ref={containerRef} className="py-2" />
}
