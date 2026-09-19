import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  Search, 
  Layers, 
  GitFork, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'
import ProjectContextBar from '../components/ProjectContextBar'

export default function Dependencies() {
  const { id: routeId } = useParams()
  const { selectedProject, projects, selectProjectById } = useProjects()

  const activeProject = selectedProject || (projects.length > 0 ? projects[0] : null)
  const activeProjectId = routeId || activeProject?._id

  const [dependencies, setDependencies] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'direct', 'transitive', 'dev'
  const [selectedDep, setSelectedDep] = useState(null)

  useEffect(() => {
    if (routeId) {
      selectProjectById(routeId)
    }
  }, [routeId])

  useEffect(() => {
    if (activeProjectId) {
      loadDependencies(activeProjectId)
    } else {
      setDependencies([])
    }
  }, [activeProjectId])

  const loadDependencies = async (pid) => {
    setLoading(true)
    try {
      const res = await api.get(`/projects/${pid}/dependencies`)
      const fetched = res.data?.dependencies && Array.isArray(res.data.dependencies) 
        ? res.data.dependencies 
        : []
      setDependencies(fetched)
    } catch (e) {
      console.warn('Dependencies API error:', e.message)
      setDependencies([])
    } finally {
      setLoading(false)
    }
  }

  const filteredDeps = useMemo(() => {
    return dependencies.filter((dep) => {
      const query = search.toLowerCase()
      const matchesSearch = !query ||
        (dep.name || '').toLowerCase().includes(query) ||
        (dep.license || '').toLowerCase().includes(query) ||
        (dep.resolvedVersion || dep.requestedVersion || '').toLowerCase().includes(query)

      if (!matchesSearch) return false

      if (filter === 'direct') return (dep.type || '').toLowerCase() === 'direct'
      if (filter === 'transitive') return (dep.type || '').toLowerCase() === 'transitive'
      if (filter === 'dev') return dep.isDevDependency || dep.dependencySection === 'devDependencies'

      return true
    })
  }, [dependencies, search, filter])

  const projectName = activeProject ? (activeProject.projectName || activeProject.name) : 'Selected Project'
  const directCount = dependencies.filter(d => (d.type || '').toLowerCase() === 'direct').length
  const transitiveCount = dependencies.filter(d => (d.type || '').toLowerCase() === 'transitive').length
  const devCount = dependencies.filter(d => d.isDevDependency || d.dependencySection === 'devDependencies').length

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Project Context Bar */}
      <ProjectContextBar activeTab="dependencies" />

      {/* 2. Editorial Hero Section */}
      <div className="hero-surface radial-glow p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Static Dependency Manifest</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              Dependency Inventory
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
              Complete inventory of packages parsed from manifest and lockfiles for <strong className="text-[#101828]">{projectName}</strong>.
            </p>

            <div className="flex items-center flex-wrap gap-3 pt-2 text-xs text-[#667085]">
              <span>Total Packages: <strong className="text-[#101828] font-mono">{dependencies.length}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Direct: <strong className="text-[#101828] font-mono">{directCount}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Transitive: <strong className="text-[#101828] font-mono">{transitiveCount}</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start lg:self-auto flex-shrink-0">
            <Link
              to={`/projects/${activeProjectId}/graph`}
              className="btn-primary text-xs"
            >
              <GitFork className="w-4 h-4 mr-1.5" />
              <span>View Dependency Graph</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Bento Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Total Discovered</span>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">{dependencies.length}</div>
          <p className="text-[11px] text-[#667085] mt-1">Total resolved manifest components</p>
        </div>

        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Direct Dependencies</span>
          <div className="text-3xl font-black text-blue-600 font-mono mt-2">{directCount}</div>
          <p className="text-[11px] text-[#667085] mt-1">Declared in package.json root</p>
        </div>

        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Transitive Chains</span>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">{transitiveCount}</div>
          <p className="text-[11px] text-[#667085] mt-1">Nested dependency chain resolution</p>
        </div>

        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Dev Scope</span>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">{devCount}</div>
          <p className="text-[11px] text-[#667085] mt-1">Build & test tools</p>
        </div>
      </div>

      {/* 4. Controls & Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search package name, license..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#D0D5DD] rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-saas-xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            {[
              { id: 'all', label: 'All Packages' },
              { id: 'direct', label: 'Direct' },
              { id: 'transitive', label: 'Transitive' },
              { id: 'dev', label: 'DevDependencies' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="saas-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#98A2B3] text-xs font-medium space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mx-auto" />
              <p>Scanning dependency manifests for {projectName}...</p>
            </div>
          ) : filteredDeps.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-[#101828]">No packages found</h3>
              <p className="text-xs text-[#667085] max-w-md mx-auto">
                No dependencies matched your filter query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Requested</th>
                    <th>Resolved</th>
                    <th>Scope / Type</th>
                    <th>License</th>
                    <th>Dependency Chain Path</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeps.map((dep) => {
                    const type = (dep.type || 'direct').toLowerCase()
                    const pathStr = dep.paths?.[0] ? dep.paths[0].join(' → ') : dep.name

                    return (
                      <tr 
                        key={dep._id || `${dep.name}-${dep.resolvedVersion}`}
                        onClick={() => setSelectedDep(dep)}
                        className="cursor-pointer"
                      >
                        <td>
                          <span className="font-extrabold text-[#101828] font-mono text-xs hover:text-blue-600">
                            {dep.name}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs text-[#667085]">
                            {dep.requestedVersion || dep.resolvedVersion || '1.0.0'}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs font-bold text-[#101828]">
                            {dep.resolvedVersion || dep.requestedVersion || '1.0.0'}
                          </span>
                        </td>

                        <td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            type === 'direct'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {type}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs text-emerald-700 font-semibold">
                            {dep.license || 'MIT'}
                          </span>
                        </td>

                        <td className="max-w-xs truncate text-[11px] font-mono text-[#667085]">
                          {pathStr}
                        </td>

                        <td className="text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedDep(dep); }}
                            className="btn-secondary text-[11px] py-1 px-2.5"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 5. Detail Slide-over Drawer */}
      <AnimatePresence>
        {selectedDep && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDep(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-lg bg-white shadow-saas-xl border-l border-[#E4E7EC] flex flex-col justify-between"
              >
                <div className="p-6 border-b border-[#E4E7EC] flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]">
                      PACKAGE SPECIFICATION
                    </span>
                    <h2 className="text-xl font-black text-[#101828] font-mono tracking-tight">
                      {selectedDep.name}
                    </h2>
                    <p className="text-xs text-[#667085] font-mono">
                      Resolved: v{selectedDep.resolvedVersion || selectedDep.requestedVersion || '1.0.0'}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedDep(null)}
                    className="p-1 rounded-lg border border-[#E4E7EC] text-[#98A2B3] hover:text-[#101828]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
                      <span className="text-[10px] uppercase font-bold text-[#98A2B3] block">Placement</span>
                      <span className="font-extrabold text-sm text-[#101828] mt-0.5 block uppercase">
                        {selectedDep.type || 'direct'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
                      <span className="text-[10px] uppercase font-bold text-[#98A2B3] block">License</span>
                      <span className="font-mono text-sm text-emerald-700 font-bold mt-0.5 block">
                        {selectedDep.license || 'MIT'}
                      </span>
                    </div>
                  </div>

                  {selectedDep.purl && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#98A2B3] mb-1.5">Package URL (PURL)</h4>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[11px] text-[#101828] break-all">
                        {selectedDep.purl}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#98A2B3] mb-1.5">Dependency Chain</h4>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[11px] text-[#344054] space-y-1">
                      {selectedDep.paths && selectedDep.paths.length > 0 ? (
                        selectedDep.paths.map((p, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5">
                            <span className="text-blue-600">↳</span>
                            <span>{p.join(' → ')}</span>
                          </div>
                        ))
                      ) : (
                        <span>Direct root dependency</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-[#E4E7EC] bg-slate-50 flex items-center justify-between">
                  <a
                    href={`https://www.npmjs.com/package/${selectedDep.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline font-semibold flex items-center space-x-1"
                  >
                    <span>Inspect on npm</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setSelectedDep(null)}
                    className="btn-primary text-xs"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
