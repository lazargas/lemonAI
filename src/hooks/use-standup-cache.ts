import { useState, useEffect, useRef } from 'react'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface StandupCache {
  user_id: string
  sprint_id: string
  suggested_talking_points: string[]
  risks_to_mention: string[]
  blockers: string[]
  pending_items: string[]
  generated_at: string
  job_id: string
  status: 'pending' | 'completed' | 'failed'
  error: string | null
}

export function useStandupCache(userId: string | null, sprintId: string) {
  const [data, setData] = useState<StandupCache | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!userId) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchStandup = async () => {
      if (!loading) setLoading(true)
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/standup/cached?userId=${encodeURIComponent(userId)}&sprintId=${encodeURIComponent(sprintId)}`
        )
        if (cancelled) return

        if (res.status === 404) {
          setError('Standup not generated yet for this user.')
          setLoading(false)
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json: StandupCache = await res.json()
        if (cancelled) return

        setData(json)

        if (json.status === 'pending') {
          timerRef.current = setTimeout(fetchStandup, 5000)
        } else {
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load standup')
          setLoading(false)
        }
      }
    }

    setData(null)
    setError(null)
    setLoading(true)
    fetchStandup()

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [userId, sprintId])

  return { data, loading, error }
}
