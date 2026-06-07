import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

export function MathFormula({ formula }: { formula: string }) {
  return <BlockMath math={formula} />
}
