import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SearchIcon, SquareIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGenerateAnswer } from '@/hooks/use-generate-answer'
import type { Source } from '@/hooks/use-generate-answer'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface SearchPageProps {
  onClose: () => void
}

// Animated cursor that blinks while streaming
function StreamingCursor() {
  return (
    <motion.span
      className="inline-block w-[2px] h-[1em] bg-gray-800 ml-0.5 align-middle"
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
    />
  )
}

// Render markdown answer with streaming cursor
function AnimatedAnswer({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  return (
    <div className="prose prose-sm prose-gray max-w-none text-gray-700
      prose-headings:font-semibold prose-headings:text-gray-800
      prose-strong:text-gray-800
      prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px]
      prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200
      prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
      prose-blockquote:border-l-gray-300 prose-blockquote:text-gray-500
      prose-table:text-sm prose-th:bg-gray-50
      prose-a:text-gray-700 prose-a:underline">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {text}
      </ReactMarkdown>
      {isStreaming && <StreamingCursor />}
    </div>
  )
}

function SourceCard({ source }: { source: Source }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        {source.chunk_type && (
          <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-medium uppercase tracking-wide text-[10px]">
            {source.chunk_type}
          </span>
        )}
        {source.ticket_id && (
          <span className="text-gray-500">{source.ticket_id}</span>
        )}
        {source.score != null && (
          <span className="ml-auto text-gray-400">score: {source.score.toFixed(3)}</span>
        )}
      </div>
      <p className="text-gray-600 line-clamp-3 leading-relaxed">{source.text}</p>
    </div>
  )
}

const SUGGESTED = [
  'What are the biggest blockers across all projects?',
  'Which projects are behind schedule?',
  'Summarize this sprint for leadership',
  'What decisions were made this week?',
]

export function SearchPage({ onClose: _onClose }: SearchPageProps) {
  const [input, setInput] = useState('')
  const [showSources, setShowSources] = useState(false)
  const { answer, sources, isStreaming, error, ask, stop, reset } = useGenerateAnswer()
  const inputRef = useRef<HTMLInputElement>(null)
  const answerRef = useRef<HTMLDivElement>(null)
  const hasResult = answer.length > 0 || isStreaming || error !== null

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-scroll answer into view as it streams
  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [answer])

  const handleAsk = () => {
    const q = input.trim()
    if (!q || isStreaming) return
    setShowSources(false)
    ask(q)
  }

  const handleNewSearch = () => {
    reset()
    setInput('')
    setShowSources(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <motion.div
      className="absolute inset-0 z-50 bg-white flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Search bar area */}
      <div className="flex-shrink-0 px-8 pt-8 pb-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 focus-within:border-gray-400 transition-colors">
            <SearchIcon className="size-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="Ask anything about your team, projects, or sprints…"
              className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
            />
            {isStreaming ? (
              <button
                onClick={stop}
                className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                title="Stop"
              >
                <SquareIcon className="size-4" />
              </button>
            ) : (
              <Button
                onClick={handleAsk}
                disabled={!input.trim()}
                size="sm"
                className="shrink-0"
              >
                Ask
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="max-w-3xl mx-auto">

          {/* Suggested prompts — shown when no result yet */}
          <AnimatePresence>
            {!hasResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-6"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Suggested</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED.map(s => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 0) }}
                      className="text-left text-sm text-gray-600 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer area */}
          <AnimatePresence>
            {hasResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-6"
              >
                {/* Answer card */}
                <div ref={answerRef} className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
                  {error ? (
                    <p className="text-sm text-red-500">{error}</p>
                  ) : (
                    <AnimatedAnswer text={answer} isStreaming={isStreaming} />
                  )}
                </div>

                {/* Sources */}
                {sources.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowSources(v => !v)}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mb-2"
                    >
                      {showSources ? <ChevronUpIcon className="size-3.5" /> : <ChevronDownIcon className="size-3.5" />}
                      {sources.length} source{sources.length !== 1 ? 's' : ''}
                    </button>
                    <AnimatePresence>
                      {showSources && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden space-y-2"
                        >
                          {sources.map((s, i) => (
                            <SourceCard key={i} source={s} />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* New search button */}
                {!isStreaming && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button variant="outline" size="sm" onClick={handleNewSearch}>
                      New search
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  )
}
