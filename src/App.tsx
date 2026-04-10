import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Navbar } from './components/Navbar'
import { users } from './data/users'
import type { User } from './data/users'
import { motion, AnimatePresence } from 'motion/react'
import { XIcon, FileTextIcon } from 'lucide-react'
import { Progress, ProgressValue } from './components/ui/progress'
import { Button } from './components/ui/button'
import { projects } from './data/projects'
import type { Project, ProjectStatus } from './data/projects'
import { ping } from './api/client'

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

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState({ x: '50%', y: '50%' })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ping()
      .then(data => console.log('Ping response:', data))
      .catch(err => console.error('Ping error:', err))
  }, [])

  const handleUserClick = (user: User, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setZoomOrigin({ x: `${x}%`, y: `${y}%` })
    }
    setSelectedUser(user)
  }

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Right-side card indices (85% left position)
  const isRightSideUser = selectedUser
    ? [3, 7].includes(users.indexOf(selectedUser))
    : false

  return (
    <div className="h-screen overflow-hidden">
      <Navbar />
      <div
        ref={containerRef}
        className="relative flex items-center justify-center h-[calc(100vh-73px)] bg-gray-200 overflow-hidden"
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
              <span className="text-[10px] lg:text-xs font-medium text-gray-700 truncate w-full">{user.name}</span>
              <span className="text-[8px] lg:text-[10px] text-gray-400 truncate w-full">{user.jobTitle}</span>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {selectedUser && (
            <motion.div
              className="absolute right-0 top-0 h-full w-[50%] lg:w-[45%] xl:w-[40%] flex flex-col gap-4 p-4"
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
                  <h2 className="text-base lg:text-lg font-semibold mb-4">Team Progress</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.filter(u => !u.isManager).map(u => (
                      <div key={u.id} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold">
                          {u.name.charAt(5)}
                        </div>
                        <span className="text-xs lg:text-sm font-medium text-gray-700 text-center truncate w-full">{u.name}</span>
                        <Progress value={0} className="w-full">
                          <ProgressValue />
                        </Progress>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 bg-white rounded-xl shadow-lg p-4 lg:p-6 overflow-auto">
                    <h2 className="text-base lg:text-lg font-semibold mb-4">User Details</h2>
                    <div className="space-y-3 text-xs lg:text-sm text-gray-600">
                      <p><span className="font-medium text-gray-800">Name:</span> {selectedUser.name}</p>
                      <p><span className="font-medium text-gray-800">Job Title:</span> {selectedUser.jobTitle}</p>
                      <p><span className="font-medium text-gray-800">City:</span> {selectedUser.city}</p>
                      <p><span className="font-medium text-gray-800">ID:</span> {selectedUser.id}</p>
                    </div>
                  </div>

                  <div className="flex-1 bg-white rounded-xl shadow-lg p-4 lg:p-6 flex items-center justify-center">
                    <span className="text-gray-400 text-xs lg:text-sm">Placeholder</span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary button */}
        {!selectedUser && !showSummary && (
          <Button
            onClick={() => setShowSummary(true)}
            className="absolute bottom-6 left-6 z-10"
          >
            <FileTextIcon className="size-4 mr-2" />
            Summary
          </Button>
        )}

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
              <h2 className="text-lg font-semibold mb-6">Summary</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className={`rounded-xl border p-4 shadow-sm flex flex-col gap-3 cursor-pointer transition-shadow hover:shadow-md ${statusStyles[p.status]}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{p.name}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge[p.status]}`}>
                        {statusLabel[p.status]}
                      </span>
                    </div>
                    <span className="text-xs opacity-70">{p.owner}</span>
                    <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-current opacity-40"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] opacity-60">{p.progress}% complete</span>
                  </div>
                ))}
              </div>

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

                      <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-lg font-semibold">{selectedProject.name}</h3>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge[selectedProject.status]}`}>
                          {statusLabel[selectedProject.status]}
                        </span>
                      </div>

                      {/* Collaborators */}
                      <div className="mb-5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Collaborators</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedProject.collaborators.map(c => (
                            <span key={c} className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">{c}</span>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mb-5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Summary</span>
                        <p className="text-sm mt-2 text-gray-600 leading-relaxed">{selectedProject.summary}</p>
                      </div>

                      {/* Tasks */}
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tasks</span>
                        <ul className="mt-2 space-y-2">
                          {selectedProject.tasks.map(t => (
                            <li key={t.id} className="flex items-center gap-2 text-sm">
                              <span className={`size-4 rounded border flex items-center justify-center text-[10px] ${t.done ? 'bg-green-100 border-green-300 text-green-600' : 'border-gray-300'}`}>
                                {t.done && '✓'}
                              </span>
                              <span className={t.done ? 'line-through text-gray-400' : 'text-gray-700'}>{t.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
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
