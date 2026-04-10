export type ProjectStatus = 'on-track' | 'at-risk' | 'behind'

export interface Task {
  id: number
  title: string
  done: boolean
}

export interface Project {
  id: number
  name: string
  owner: string
  status: ProjectStatus
  progress: number
  collaborators: string[]
  summary: string
  tasks: Task[]
}

export const projects: Project[] = [
  {
    id: 1, name: "Project Alpha", owner: "User Alpha", status: "on-track", progress: 75,
    collaborators: ["User Alpha", "User Delta", "User Eta"],
    summary: "Backend API migration to new microservices architecture. On track for Q3 delivery.",
    tasks: [
      { id: 1, title: "Set up service scaffolding", done: true },
      { id: 2, title: "Migrate user endpoints", done: true },
      { id: 3, title: "Load testing", done: false },
    ],
  },
  {
    id: 2, name: "Project Beta", owner: "User Beta", status: "at-risk", progress: 40,
    collaborators: ["User Beta", "User Epsilon"],
    summary: "Dashboard redesign with new analytics widgets. Delayed due to design review cycles.",
    tasks: [
      { id: 1, title: "Wireframe approval", done: true },
      { id: 2, title: "Component library setup", done: false },
      { id: 3, title: "Integration with data API", done: false },
    ],
  },
  {
    id: 3, name: "Project Gamma", owner: "User Gamma", status: "behind", progress: 15,
    collaborators: ["User Gamma", "User Zeta", "User Theta"],
    summary: "Real-time notification system. Blocked on infrastructure provisioning.",
    tasks: [
      { id: 1, title: "Architecture design", done: true },
      { id: 2, title: "Provision message queue", done: false },
      { id: 3, title: "Build consumer service", done: false },
      { id: 4, title: "End-to-end testing", done: false },
    ],
  },
  {
    id: 4, name: "Project Delta", owner: "User Delta", status: "on-track", progress: 90,
    collaborators: ["User Delta", "User Alpha"],
    summary: "CI/CD pipeline improvements. Nearly complete, final rollout pending.",
    tasks: [
      { id: 1, title: "Pipeline config refactor", done: true },
      { id: 2, title: "Add canary deployments", done: true },
      { id: 3, title: "Documentation update", done: false },
    ],
  },
  {
    id: 5, name: "Project Epsilon", owner: "User Epsilon", status: "at-risk", progress: 50,
    collaborators: ["User Epsilon", "User Beta", "User Eta"],
    summary: "Search functionality overhaul. Performance benchmarks not yet met.",
    tasks: [
      { id: 1, title: "Index optimization", done: true },
      { id: 2, title: "Query parser rewrite", done: true },
      { id: 3, title: "Benchmark testing", done: false },
      { id: 4, title: "Rollout plan", done: false },
    ],
  },
  {
    id: 6, name: "Project Zeta", owner: "User Zeta", status: "behind", progress: 10,
    collaborators: ["User Zeta", "User Gamma"],
    summary: "Data lake migration. Significantly behind due to schema compatibility issues.",
    tasks: [
      { id: 1, title: "Schema mapping", done: false },
      { id: 2, title: "ETL pipeline setup", done: false },
      { id: 3, title: "Validation scripts", done: false },
    ],
  },
  {
    id: 7, name: "Project Eta", owner: "User Eta", status: "on-track", progress: 65,
    collaborators: ["User Eta", "User Epsilon", "User Alpha"],
    summary: "Mobile app feature rollout. Core features done, polishing in progress.",
    tasks: [
      { id: 1, title: "Feature flag setup", done: true },
      { id: 2, title: "UI polish", done: false },
      { id: 3, title: "QA sign-off", done: false },
    ],
  },
  {
    id: 8, name: "Project Theta", owner: "User Theta", status: "at-risk", progress: 35,
    collaborators: ["User Theta", "User Gamma", "User Delta"],
    summary: "Logging and monitoring revamp. Dependency on vendor SDK update causing delays.",
    tasks: [
      { id: 1, title: "Vendor SDK evaluation", done: true },
      { id: 2, title: "Agent deployment", done: false },
      { id: 3, title: "Dashboard creation", done: false },
      { id: 4, title: "Alert rules config", done: false },
    ],
  },
]
