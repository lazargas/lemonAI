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

export interface ProjectsListResponse {
  sprint_id: string
  projects: ProjectSummary[]
}

export async function listProjects(sprintId: string): Promise<ProjectSummary[]> {
  const res = await fetch(`${BASE_URL}/api/v1/projects?sprintId=${sprintId}`)
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Failed to fetch projects (${res.status}): ${text.slice(0, 200)}`)
  }
  try {
    const data: ProjectsListResponse = JSON.parse(text)
    return data.projects
  } catch {
    throw new Error(`Invalid JSON response from server: ${text.slice(0, 200)}`)
  }
}
