import { useRef, useEffect, useState } from 'react'
import { Bold, Italic, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

// ── Symbol data ───────────────────────────────────────────────────────────────
const CATEGORIES = {
  MATH: {
    label: 'Math',
    symbols: [
      ['±','plus-minus'], ['×','times'], ['÷','divide'], ['≠','not equal'],
      ['≤','less or equal'], ['≥','greater or equal'], ['≈','approx'],
      ['√','sqrt'], ['∛','cbrt'], ['∫','integral'], ['∂','partial'],
      ['∞','infinity'], ['∴','therefore'], ['∵','because'], ['∝','proportional'],
    ]
  },
  GREEK: {
    label: 'Greek',
    symbols: [
      ['α','alpha'], ['β','beta'], ['γ','gamma'], ['δ','delta'],
      ['ε','epsilon'], ['θ','theta'], ['λ','lambda'], ['μ','mu'],
      ['π','pi'], ['ρ','rho'], ['σ','sigma'], ['Σ','Sigma'],
      ['τ','tau'], ['φ','phi'], ['ω','omega'], ['Ω','Omega'],
    ]
  },
  OPS: {
    label: 'Operators',
    symbols: [
      ['∑','summation'], ['∏','product'], ['∩','intersection'], ['∪','union'],
      ['⊂','subset'], ['⊃','superset'], ['∈','element of'], ['∉','not element'],
      ['∀','for all'], ['∃','exists'], ['∧','and'], ['∨','or'],
      ['¬','not'], ['⊕','xor'], ['→','implies'], ['↔','iff'],
    ]
  },
  SUPER: {
    label: 'Super/Sub',
    symbols: [
      ['⁰','sup 0'], ['¹','sup 1'], ['²','sup 2'], ['³','sup 3'],
      ['⁴','sup 4'], ['⁵','sup 5'], ['⁶','sup 6'], ['⁷','sup 7'],
      ['₀','sub 0'], ['₁','sub 1'], ['₂','sub 2'], ['₃','sub 3'],
      ['₄','sub 4'], ['₅','sub 5'], ['₆','sub 6'], ['₇','sub 7'],
    ]
  },
} as const

type CatKey = keyof typeof CATEGORIES

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  error?: string
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MinimalRichEditor({ value, onChange, placeholder, rows = 2, error }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const [showSymbols, setShowSymbols] = useState(false)
  const [cat, setCat] = useState<CatKey>('MATH')

  // Auto-resize
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 300) + 'px'
  }, [value])

  // Close symbol picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSymbols(false)
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const insertAt = (text: string) => {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const e2 = el.selectionEnd
    const next = value.slice(0, s) + text + value.slice(e2)
    onChange(next)
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = s + text.length
      el.focus()
    }, 0)
  }

  const wrap = (before: string, after: string) => {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const e2 = el.selectionEnd
    const sel = value.slice(s, e2)
    if (!sel) { insertAt(before + after); return }
    const next = value.slice(0, s) + before + sel + after + value.slice(e2)
    onChange(next)
    setTimeout(() => {
      el.selectionStart = s + before.length
      el.selectionEnd = s + before.length + sel.length
      el.focus()
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); wrap('**', '**') }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); wrap('*', '*') }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKeyDown}
        rows={rows}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white transition-colors ${
          error ? 'border-red-400' : focused ? 'border-blue-400' : 'border-gray-200'
        }`}
      />

      {/* Compact toolbar — only when focused */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="flex items-center gap-0.5 mt-1 px-1.5 py-1 bg-white border border-gray-200 rounded-lg shadow-sm w-fit"
          >
            <ToolBtn title="Bold (Ctrl+B)" onClick={() => wrap('**', '**')}>
              <Bold className="w-3.5 h-3.5" />
            </ToolBtn>
            <ToolBtn title="Italic (Ctrl+I)" onClick={() => wrap('*', '*')}>
              <Italic className="w-3.5 h-3.5" />
            </ToolBtn>

            <div className="w-px h-4 bg-gray-200 mx-0.5" />

            {/* Superscript shortcut */}
            <ToolBtn title="Superscript (e.g. x²)" onClick={() => insertAt('²')}>
              <span className="text-xs font-bold leading-none">x²</span>
            </ToolBtn>
            <ToolBtn title="Subscript (e.g. H₂)" onClick={() => insertAt('₂')}>
              <span className="text-xs font-bold leading-none">x₂</span>
            </ToolBtn>

            <div className="w-px h-4 bg-gray-200 mx-0.5" />

            {/* Symbol picker toggle */}
            <ToolBtn
              title="Insert symbol or equation"
              onClick={() => setShowSymbols(v => !v)}
              active={showSymbols}
            >
              <span className="text-xs font-bold leading-none">Σ</span>
            </ToolBtn>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Symbol picker panel */}
      <AnimatePresence>
        {showSymbols && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.13 }}
            className="absolute left-0 z-50 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
            style={{ top: '100%' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-700">Symbols & Equations</span>
              <button
                type="button"
                onClick={() => setShowSymbols(false)}
                className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex border-b border-gray-100">
              {(Object.keys(CATEGORIES) as CatKey[]).map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setCat(k)}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                    cat === k
                      ? 'text-blue-600 border-b-2 border-blue-500 -mb-px bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {CATEGORIES[k].label}
                </button>
              ))}
            </div>

            {/* Symbols grid */}
            <div className="p-2 grid grid-cols-8 gap-0.5 max-h-44 overflow-y-auto">
              {CATEGORIES[cat].symbols.map(([char, label]) => (
                <button
                  key={char}
                  type="button"
                  title={label}
                  onClick={() => { insertAt(char); }}
                  className="h-8 w-8 flex items-center justify-center text-base rounded hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors border border-transparent hover:border-blue-200"
                >
                  {char}
                </button>
              ))}
            </div>

            <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
              Click to insert at cursor
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Small toolbar button ──────────────────────────────────────────────────────
function ToolBtn({ children, title, onClick, active }: {
  children: React.ReactNode
  title: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors flex items-center justify-center ${
        active
          ? 'bg-blue-100 text-blue-600'
          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {children}
    </button>
  )
}

// ── Helper: render stored text as HTML for display ────────────────────────────
export function renderRichText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}
