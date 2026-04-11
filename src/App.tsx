import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import './App.css'
import { Navbar } from './components/Navbar'
import { users } from './data/users'
import type { User } from './data/users'
import { motion, AnimatePresence } from 'motion/react'
import { XIcon, RefreshCwIcon, MessageSquareIcon, AlertTriangleIcon, ShieldAlertIcon, ClipboardListIcon, ExternalLinkIcon } from 'lucide-react'
import { Button } from './components/ui/button'
import { listProjects, ping } from './api/client'
import type { ProjectSummary } from './api/client'
import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react'
import sparklesLottie from '@/assets/Sparkles Loop Loader ai.lottie?url'
import { SearchPage } from './components/SearchPage'
import { useStandupCache } from './hooks/use-standup-cache'

const SPRINT_ID = '0530dc38-0d6f-443c-89c7-c3b3c66698f1'

type ProjectHealth = 'green' | 'yellow' | 'red'
type ProjectStatus = 'on-track' | 'at-risk' | 'behind'

const healthToStatus: Record<ProjectHealth, ProjectStatus> = {
  green: 'on-track',
  yellow: 'at-risk',
  red: 'behind',
}

const statusStyles: Record<ProjectStatus, string> = {
  'on-track': 'bg-green-50 border-green-200 text-green-800',
  'at-risk': 'bg-yellow-50 border-yellow-200 text-yellow-800',
  'behind': 'bg-red-50 border-red-200 text-red-800',
}

const statusLabel: Record<ProjectStatus, string> = {
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  'behind': 'Behind',
}

const statusBadge: Record<ProjectStatus, string> = {
  'on-track': 'bg-green-100 text-green-700',
  'at-risk': 'bg-yellow-100 text-yellow-700',
  'behind': 'bg-red-100 text-red-700',
}

const cardPositions = [
  // Top 4
  '-top-16 lg:-top-20 left-[15%] -translate-x-1/2',
  '-top-16 lg:-top-20 left-[38%] -translate-x-1/2',
  '-top-16 lg:-top-20 left-[62%] -translate-x-1/2',
  '-top-16 lg:-top-20 left-[85%] -translate-x-1/2',
  // Bottom 4
  '-bottom-16 lg:-bottom-20 left-[15%] -translate-x-1/2',
  '-bottom-16 lg:-bottom-20 left-[38%] -translate-x-1/2',
  '-bottom-16 lg:-bottom-20 left-[62%] -translate-x-1/2',
  '-bottom-16 lg:-bottom-20 left-[85%] -translate-x-1/2',
  // Left 1
  'top-1/2 -left-20 lg:-left-28 xl:-left-32 -translate-y-1/2',
]

// ─── Standup section config ───────────────────────────────────────────────────
const standupSections = [
  {
    key: 'suggested_talking_points' as const,
    label: 'Talking Points',
    Icon: MessageSquareIcon,
    bg: 'bg-[#EEF4FF] border-[#C7D9FF]',
    labelColor: 'text-[#3B6FD4]',
    iconColor: 'text-[#7AAAF7]',
    dotColor: 'bg-[#7AAAF7]',
  },
  {
    key: 'risks_to_mention' as const,
    label: 'Risks',
    Icon: AlertTriangleIcon,
    bg: 'bg-[#FFFBEB] border-[#FDEAAA]',
    labelColor: 'text-[#B07D1A]',
    iconColor: 'text-[#F0C060]',
    dotColor: 'bg-[#F0C060]',
  },
  {
    key: 'blockers' as const,
    label: 'Blockers',
    Icon: ShieldAlertIcon,
    bg: 'bg-[#FFF3F3] border-[#FCCFCF]',
    labelColor: 'text-[#C0444A]',
    iconColor: 'text-[#F09090]',
    dotColor: 'bg-[#F09090]',
  },
  {
    key: 'pending_items' as const,
    label: 'Pending Items',
    Icon: ClipboardListIcon,
    bg: 'bg-[#F5F0FF] border-[#DDD0FF]',
    labelColor: 'text-[#6B44C0]',
    iconColor: 'text-[#B09AE8]',
    dotColor: 'bg-[#B09AE8]',
  },
]

const STANDUP_ARTIFICIAL_DELAY_MS = 2000

function StandupPanel({
  user,
  sprintId,
  handleLottieRef,
}: {
  user: User
  sprintId: string
  handleLottieRef: (d: DotLottie | null) => void
}) {
  const { data, loading, error } = useStandupCache(user.alias, sprintId)
  const [delayDone, setDelayDone] = useState(false)

  // 3-second artificial delay so the loader always shows briefly
  useEffect(() => {
    setDelayDone(false)
    const t = setTimeout(() => setDelayDone(true), STANDUP_ARTIFICIAL_DELAY_MS)
    return () => clearTimeout(t)
  }, [user.alias])

  const showLoader = loading || !delayDone

  const isLoading = showLoader || (!!data && data.status === 'pending')
  const isFailed = !showLoader && (!!error || (!!data && data.status === 'failed'))
  const isReady = !showLoader && !!data && data.status === 'completed'

  return (
    <div className="flex-1 overflow-auto flex flex-col gap-3 bg-white rounded-xl border border-gray-200 shadow-md py-[32px] px-[16px] ">

      {/* ── Loading state ── */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <DotLottieReact
            src={sparklesLottie}
            loop
            autoplay
            dotLottieRefCallback={handleLottieRef}
            style={{ width: 140, height: 140 }}
          />
          <p className="text-sm text-gray-400">Generating standup for {user.name}…</p>
        </div>
      )}

      {/* ── Error state ── */}
      {isFailed && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-red-400 text-center">
            {error ?? (data?.error ? `Generation failed: ${data.error}` : 'No standup data available.')}
          </p>
        </div>
      )}

      {/* ── Ready state ── */}
      {isReady && (
        <>
          {/* User header */}
          <div className="flex items-center gap-3 px-1">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold shrink-0">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-800 leading-tight">{user.name}</span>
              <span className="text-xs text-gray-400">@{user.alias}</span>
            </div>
            <span className="ml-auto text-xs text-gray-300">
              {new Date(data.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* 4 colored boxes — staggered fade-in, 2 cols on xl */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {standupSections.map((section, idx) => {
              const items = data[section.key]
              return (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.15 }}
                  className={` border p-4 flex flex-col gap-3 h-[350px] w-full max-w-[600px] overflow-auto ${section.bg}`}
                >
                  <div className={`flex items-center gap-2 ${section.labelColor}`}>
                    <section.Icon className={`size-4 ${section.iconColor}`} />
                    <span className="text-xl font-semibold uppercase tracking-wide">{section.label}</span>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">None</p>
                  ) : (
                    <ul className="space-y-3">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${section.dotColor}`} />
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-700 leading-relaxed">{item.summary}</span>
                            {item.resources.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.resources.map((url, ri) => {
                                  const ticketId = url.split('/').pop() ?? url
                                  return (
                                    <a
                                      key={ri}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${section.labelColor} border-current opacity-70 hover:opacity-100 transition-opacity`}
                                    >
                                      {ticketId}
                                      <ExternalLinkIcon className="size-2.5 shrink-0" />
                                    </a>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function App() {
  const getInitialUser = () => {
    const params = new URLSearchParams(window.location.search)
    const alias = params.get('user')
    return alias ? (users.find(u => u.alias === alias) ?? null) : null
  }

  const [selectedUser, setSelectedUser] = useState<User | null>(getInitialUser)
  const [showSummary, setShowSummary] = useState(
    () => window.location.search.includes('projects')
  )
  const [showSearch, setShowSearch] = useState(
    () => window.location.search.includes('search')
  )
  const [zoomOrigin, setZoomOrigin] = useState({ x: '50%', y: '50%' })
  const containerRef = useRef<HTMLDivElement>(null)

  const [apiProjects, setApiProjects] = useState<ProjectSummary[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null)

  useEffect(() => {
    ping()
      .then(data => console.log('Ping response:', data))
      .catch(err => console.error('Ping error:', err))
  }, [])

  // Sync URL params with page state (including ?user=alias)
  useEffect(() => {
    if (showSearch) {
      window.history.replaceState(null, '', '?search')
    } else if (showSummary) {
      window.history.replaceState(null, '', '?projects')
    } else if (selectedUser) {
      window.history.replaceState(null, '', `?user=${selectedUser.alias}`)
    } else {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [showSummary, showSearch, selectedUser])

  const fetchProjects = async () => {
    setProjectsLoading(true)
    setProjectsError(null)
    try {
      const start = Date.now()
      const data = await listProjects(SPRINT_ID)
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 2500 - elapsed)
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining))
      setApiProjects(data)
      setProjectsLoading(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load projects'
      if (msg === '__PENDING__') {
        // Still generating — poll every 5s
        setTimeout(() => fetchProjects(), 5000)
      } else {
        setProjectsError(msg)
        setProjectsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (showSummary) {
      fetchProjects()
    }
  }, [showSummary])

  const handleUserClick = (user: User, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setZoomOrigin({ x: `${x}%`, y: `${y}%` })
    }
    setSelectedUser(user)
  }

  // Force loop on the lottie instance via ref callback
  const handleLottieRef = (dotLottie: DotLottie | null) => {
    if (dotLottie) {
      dotLottie.setLoop(true)
      dotLottie.play()
    }
  }

  // Right-side card indices (85% left position)
  const isRightSideUser = selectedUser
    ? [3, 7].includes(users.indexOf(selectedUser))
    : false

  return (
    <div className="h-screen overflow-hidden">
      <Navbar
        onLeadershipDashboard={() => { setShowSearch(false); setShowSummary(prev => !prev) }}
        isLeadershipView={showSummary}
        onSearch={() => { setShowSummary(false); setShowSearch(prev => !prev) }}
        isSearchView={showSearch}
      />
      <div
        ref={containerRef}
        className="relative flex items-center justify-center h-[calc(100vh-73px)] bg-white overflow-hidden"
        onClick={() => selectedUser && setSelectedUser(null)}
      >
        <motion.div
          className="relative"
          animate={{
            scale: selectedUser ? 1.3 : 1,
            x: selectedUser ? (isRightSideUser ? -300 : -150) : 0,
          }}
          style={{ transformOrigin: `${zoomOrigin.x} ${zoomOrigin.y}` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <div className="w-[400px] h-[200px] lg:w-[600px] lg:h-[300px] xl:w-[700px] xl:h-[350px] 2xl:w-[800px] 2xl:h-[400px] rounded-full border border-gray-300 bg-white shadow-lg" />

          {users.map((user, i) => (
            <motion.div
              key={user.id}
              onClick={(e) => !selectedUser && handleUserClick(user, e)}
              animate={{
                filter: selectedUser && selectedUser.id !== user.id ? 'blur(4px)' : 'blur(0px)',
                opacity: selectedUser && selectedUser.id !== user.id ? 0.4 : 1,
              }}
              whileHover={!selectedUser ? { y: -4, boxShadow: '0 10px 15px -3px rgba(0,0,0,.1)' } : {}}
              transition={{ duration: 0.4 }}
              className={`absolute ${cardPositions[i]} w-18 h-18 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-white rounded-lg shadow border border-gray-300 flex flex-col items-center justify-center text-center p-1 ${!selectedUser ? 'cursor-pointer' : ''}`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full object-cover"
                  onError={(e: SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs lg:text-sm font-semibold ${user.avatar ? 'hidden' : ''}`}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-[10px] lg:text-xs font-medium text-gray-700 truncate w-full">{user.name}</span>
              <span className="text-[8px] lg:text-[10px] text-gray-400 truncate w-full">{user.jobTitle}</span>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {selectedUser && (
            <motion.div
              className="absolute right-0 top-0 h-full w-[60vw] flex flex-col gap-4 p-4"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <XIcon className="size-5" />
              </button>

              {selectedUser.isManager ? (
                <div className="flex-1 bg-white rounded-xl shadow-lg p-4 lg:p-6 overflow-auto">
                  <h2 className="text-base lg:text-lg font-semibold mb-4">Team Members</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.filter(u => !u.isManager).map(u => (
                      <motion.div
                        key={u.id}
                        whileHover={{ y: -2, boxShadow: '0 8px 16px -4px rgba(0,0,0,.08)' }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSelectedUser(u)}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-100 bg-gray-50 cursor-pointer"
                      >
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold">
                            {u.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                        <span className="text-xs lg:text-sm font-medium text-gray-700 text-center truncate w-full">{u.name}</span>
                        <span className="text-[10px] text-gray-400 text-center truncate w-full">{u.jobTitle}</span>
                        <span className="text-[10px] text-blue-500 font-medium">View standup →</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <StandupPanel user={selectedUser} sprintId={SPRINT_ID} handleLottieRef={handleLottieRef} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search page */}
        <AnimatePresence>
          {showSearch && (
            <SearchPage onClose={() => setShowSearch(false)} />
          )}
        </AnimatePresence>

        {/* Summary page */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              className="absolute inset-0 z-50 bg-white p-6 overflow-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setShowSummary(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <XIcon className="size-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-semibold">Projects Summary</h2>
                {!projectsLoading && (
                  <button
                    onClick={() => fetchProjects()}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                    title="Refresh"
                  >
                    <RefreshCwIcon className="size-4" />
                  </button>
                )}
              </div>

              {/* Loading state */}
              {projectsLoading && (
                <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
                  <DotLottieReact
                    src={sparklesLottie}
                    loop
                    autoplay
                    dotLottieRefCallback={handleLottieRef}
                    style={{ width: 160, height: 160 }}
                  />
                  <p className="text-sm text-gray-400">Generating Summary</p>
                </div>
              )}

              {/* Error state */}
              {!projectsLoading && projectsError && (
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                  <p className="text-sm text-red-500">{projectsError}</p>
                  <Button variant="outline" onClick={() => fetchProjects()}>
                    <RefreshCwIcon className="size-4 mr-2" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Projects grid */}
              {!projectsLoading && !projectsError && (
                <div className="grid grid-cols-3 gap-4">
                  {apiProjects.map((p, idx) => {
                    const status = healthToStatus[p.health] ?? 'on-track'
                    return (
                      <motion.div
                        key={p.project_id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.1 }}
                        onClick={() => setSelectedProject(p)}
                        className={`rounded-xl border p-4 shadow-sm flex flex-col gap-3 cursor-pointer transition-shadow hover:shadow-md min-h-[200px] ${statusStyles[status]}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{p.project_name}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge[status]}`}>
                            {statusLabel[status]}
                          </span>
                        </div>
                        <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-current opacity-40"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] opacity-60">{p.progress}% complete</span>
                        <p className="text-[11px] opacity-70 line-clamp-2 leading-relaxed">{p.summary}</p>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Project detail modal */}
              <AnimatePresence>
                {selectedProject && (
                  <motion.div
                    className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-xs flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedProject(null)}
                  >
                    <motion.div
                      className="bg-white rounded-xl shadow-xl w-[90%] max-w-2xl max-h-[80vh] overflow-auto p-6 relative"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedProject(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
                      >
                        <XIcon className="size-5" />
                      </button>

                      {/* Header */}
                      <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-lg font-semibold">{selectedProject.project_name}</h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge[healthToStatus[selectedProject.health] ?? 'on-track']}`}>
                          {statusLabel[healthToStatus[selectedProject.health] ?? 'on-track']}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mb-5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Progress</span>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gray-400"
                              style={{ width: `${selectedProject.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 shrink-0">{selectedProject.progress}%</span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mb-5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Summary</span>
                        <p className="text-sm mt-2 text-gray-600 leading-relaxed">{selectedProject.summary}</p>
                      </div>

                      {/* Developers */}
                      {selectedProject.developers.length > 0 && (
                        <div className="mb-5">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Developers</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedProject.developers.map(dev => (
                              <span key={dev} className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                {dev.replace(/^USER#/, '')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SIMs */}
                      {selectedProject.sims.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">SIMs</span>
                          <ul className="mt-2 space-y-2">
                            {selectedProject.sims.map(sim => (
                              <li key={sim.sim_id} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-gray-50 border border-gray-100">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-700 truncate">{sim.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <a
                                      href={`https://issues.amazon.com/issues/${sim.sim_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 transition-colors"
                                    >
                                      {sim.sim_id}
                                      <ExternalLinkIcon className="size-2.5 shrink-0" />
                                    </a>
                                    <span className="text-[11px] text-gray-400">· {sim.owner}</span>
                                  </div>
                                </div>
                                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                  sim.status.toLowerCase() === 'open'
                                    ? 'bg-blue-100 text-blue-700'
                                    : sim.status.toLowerCase() === 'resolved'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {sim.status}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
