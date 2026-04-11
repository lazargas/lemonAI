import { useState, useCallback, useRef } from 'react'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface Source {
  text: string
  user_id: string | null
  sprint_id: string | null
  ticket_id: string | null
  chunk_type: string | null
  score: number | null
}

interface UseGenerateAnswerReturn {
  answer: string
  sources: Source[]
  isStreaming: boolean
  error: string | null
  ask: (question: string, userId?: string, sprintId?: string) => void
  stop: () => void
  reset: () => void
}

export function useGenerateAnswer(): UseGenerateAnswerReturn {
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)

  const stop = useCallback(() => {
    esRef.current?.close()
    esRef.current = null
    setIsStreaming(false)
  }, [])

  const reset = useCallback(() => {
    esRef.current?.close()
    esRef.current = null
    setAnswer('')
    setSources([])
    setError(null)
    setIsStreaming(false)
  }, [])

  const ask = useCallback((question: string, userId?: string, sprintId?: string) => {
    setAnswer('')
    setSources([])
    setError(null)
    setIsStreaming(true)
    esRef.current?.close()

    const params = new URLSearchParams({ question, k: '5' })
    if (userId) params.set('userId', userId)
    if (sprintId) params.set('sprintId', sprintId)
    const url = `${BASE_URL}/api/v1/generate-answer?${params.toString()}`

    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('sources', (e: MessageEvent) => {
      try {
        setSources(JSON.parse(e.data))
      } catch {}
    })

    es.addEventListener('token', (e: MessageEvent) => {
      try {
        const { text } = JSON.parse(e.data)
        setAnswer(prev => prev + text)
      } catch {}
    })

    es.addEventListener('done', () => {
      setIsStreaming(false)
      es.close()
      esRef.current = null
    })

    es.addEventListener('error', (e: MessageEvent) => {
      try {
        const { error: msg } = JSON.parse(e.data)
        setError(msg)
      } catch {
        setError('Stream connection lost')
      }
      setIsStreaming(false)
      es.close()
      esRef.current = null
    })
  }, [])

  return { answer, sources, isStreaming, error, ask, stop, reset }
}
