const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function ping() {
  const res = await fetch(`${BASE_URL}/api/v1/ping`)
  if (!res.ok) throw new Error(`Ping failed: ${res.status}`)
  return res.json()
}

export interface SimItem {
  sim_id: string
  title: string
  status: string
  owner: string
}

export interface ProjectSummary {
  project_id: string
  project_name: string
  sprint_id: string
  health: 'green' | 'yellow' | 'red'
  summary: string
  progress: number
  sims: SimItem[]
  developers: string[]
}

export interface ProjectsCacheResponse {
  sprint_id: string
  status: 'pending' | 'completed' | 'failed'
  generated_at: string
  job_id: string
  error: string | null
  projects: ProjectSummary[]
}

export async function listProjects(sprintId: string): Promise<ProjectSummary[]> {
  const res = await fetch(
    `${BASE_URL}/api/v1/projects/cached?sprintId=${encodeURIComponent(sprintId)}`
  )
  const text = await res.text()

  if (res.status === 404) {
    throw new Error('Projects not generated yet for this sprint.')
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch projects (${res.status}): ${text.slice(0, 200)}`)
  }

  let data: ProjectsCacheResponse
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON response from server: ${text.slice(0, 200)}`)
  }

  if (data.status === 'pending') {
    throw new Error('__PENDING__')
  }
  if (data.status === 'failed') {
    throw new Error(data.error ?? 'Project generation failed.')
  }

  return data.projects
}
