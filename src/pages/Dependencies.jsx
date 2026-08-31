import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Folder, 
  FolderOpen, 
  Package, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Filter, 
  Layers, 
  Box, 
  Info, 
  ShieldAlert, 
  GitFork, 
  FileCode,
  CheckCircle2
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'

const MOCK_DEPENDENCIES = [
  { _id: 'dep-1', name: 'express', requestedVersion: '^4.18.2', resolvedVersion: '4.18.2', type: 'direct', dependencySection: 'dependencies', isDevDependency: false, isOptional: false, license: 'MIT', vulns: 0, parentNames: [], paths: [['Application', 'express']] },
  { _id: 'dep-2', name: 'body-parser', requestedVersion: '^1.20.1', resolvedVersion: '1.20.2', type: 'transitive', dependencySection: 'dependencies', isDevDependency: false, isOptional: false, license: 'MIT', vulns: 1, parentNames: ['express'], paths: [['Application', 'express', 'body-parser']] },
  { _id: 'dep-3', name: 'raw-body', requestedVersion: '^2.5.1', resolvedVersion: '2.5.2', type: 'transitive', dependencySection: 'dependencies', isDevDependency: false, isOptional: false, license: 'MIT', vulns: 0, parentNames: ['body-parser'], paths: [['Application', 'express', 'body-parser', 'raw-body']] },
  { _id: 'dep-4', name: 'jsonwebtoken', requestedVersion: '^9.0.0', resolvedVersion: '9.0.2', type: 'direct', dependencySection: 'dependencies', isDevDependency: false, isOptional: false, license: 'MIT', vulns: 0, parentNames: [], paths: [['Application', 'jsonwebtoken']] },
  { _id: 'dep-5', name: 'semver', requestedVersion: '^7.5.4', resolvedVersion: '7.5.4', type: 'transitive', dependencySection: 'dependencies', isDevDependency: false, isOptional: false, license: 'ISC', vulns: 2, parentNames: ['jsonwebtoken'], paths: [['Application', 'jsonwebtoken', 'semver']] },
  { _id: 'dep-6', name: 'cors', requestedVersion: '^2.8.5', resolvedVersion: '2.8.5', type: 'direct', dependencySection: 'dependencies', isDevDependency: false, isOptional: false, license: 'MIT', vulns: 0, parentNames: [], paths: [['Application', 'cors']] },
  { _id: 'dep-7', name: 'axios', requestedVersion: '^1.6.0', resolvedVersion: '1.6.2', type: 'direct', dependencySection: 'dependencies', isDevDependency: false, isOptional: false, license: 'MIT', vulns: 0, parentNames: [], paths: [['Application', 'axios']] },
  { _id: 'dep-8', name: 'lodash', requestedVersion: '^4.17.21', resolvedVersion: '4.17.21', type: 'transitive', dependencySection: 'dependencies', isDevDependency: false, isOptional: false, license: 'MIT', vulns: 1, parentNames: ['axios', 'express'], paths: [['Application', 'axios', 'lodash'], ['Application', 'express', 'lodash']] },
  { _id: 'dep-9', name: 'jest', requestedVersion: '^29.7.0', resolvedVersion: '29.7.0', type: 'direct', dependencySection: 'devDependencies', isDevDependency: true, isOptional: false, license: 'MIT', vulns: 0, parentNames: [], paths: [['Application', 'jest']] },
  { _id: 'dep-10', name: 'eslint', requestedVersion: '^8.50.0', resolvedVersion: '8.50.0', type: 'direct', dependencySection: 'devDependencies', isDevDependency: true, isOptional: false, license: 'MIT', vulns: 0, parentNames: [], paths: [['Application', 'eslint']] }
]

export default function Dependencies() {
  const { id: routeId } = useParams()
  const { selectedProject, projects, selectProjectById } = useProjects()

  const activeProject = selectedProject || (projects.length > 0 ? projects[0] : null)
  const activeProjectId = routeId || activeProject?._id

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  // Expanded Folder States
  const [projectFolderOpen, setProjectFolderOpen] = useState(true)
  const [prodFolderOpen, setProdFolderOpen] = useState(true)
  const [devFolderOpen, setDevFolderOpen] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState(new Set(['express', 'body-parser', 'axios']))

  // Selected Dependency for Details Drawer
  const [selectedDep, setSelectedDep] = useState(null)

  useEffect(() => {
    if (routeId) {
      selectProjectById(routeId)
    }
  }, [routeId])

  useEffect(() => {
    if (activeProjectId) {
      loadDependencies(activeProjectId)
    }
  }, [activeProjectId])

  const loadDependencies = async (pid) => {
    setLoading(true)
    try {
      const res = await api.get(`/projects/${pid}/dependencies`)
      if (res.data && res.data.dependencies && res.data.dependencies.length > 0) {
        setData(res.data)
      } else {
        useFallback()
      }
    } catch (err) {
      useFallback()
    } finally {
      setLoading(false)
    }
  }

  const useFallback = () => {
    setData({
      summary: { total: MOCK_DEPENDENCIES.length, direct: 6, transitive: 4 },
      dependencies: MOCK_DEPENDENCIES
    })
  }

  const toggleNode = (name) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const deps = data?.dependencies || []

  // Filtered packages
  const matchesFilter = (d) => {
    if (filter === 'all') return true
    if (filter === 'direct') return d.type === 'direct'
    if (filter === 'transitive') return d.type === 'transitive'
    if (filter === 'production') return !d.isDevDependency
    if (filter === 'development') return d.isDevDependency
    return true
  }

  const matchesSearch = (d) => {
    if (!search.trim()) return true
    const term = search.toLowerCase()
    return d.name.toLowerCase().includes(term) || (d.license || '').toLowerCase().includes(term)
  }

  const prodDeps = deps.filter(d => !d.isDevDependency && matchesFilter(d) && matchesSearch(d))
  const devDeps = deps.filter(d => d.isDevDependency && matchesFilter(d) && matchesSearch(d))

  // Build tree hierarchy for a list of dependencies
  const buildTreeNodes = (depList) => {
    const map = new Map()
    depList.forEach(d => map.set(d.name, { ...d, children: [] }))

    const roots = []
    depList.forEach(d => {
      const node = map.get(d.name)
      if (d.type === 'direct' || !d.parentNames || d.parentNames.length === 0) {
        roots.push(node)
      } else {
        let attached = false
        d.parentNames.forEach(pName => {
          if (map.has(pName)) {
            map.get(pName).children.push(node)
            attached = true
          }
        })
        if (!attached) roots.push(node)
      }
    })
    return roots
  }

  const prodTree = buildTreeNodes(prodDeps)
  const devTree = buildTreeNodes(devDeps)

  // Recursive Tree Node component
  const TreeNode = ({ node, depth = 0 }) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.name) || search.trim() !== ''
    const hasMultiplePaths = (node.paths || []).length > 1

    return (
      <div className="space-y-1">
        <div 
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          className={`flex items-center justify-between py-2 pr-4 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-900/60 transition-all cursor-pointer group ${
            selectedDep?.name === node.name ? 'bg-indigo-950/40 border-indigo-500/40' : ''
          }`}
          onClick={() => setSelectedDep(node)}
        >
          <div className="flex items-center space-x-2 overflow-hidden">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNode(node.name)
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-5"></span>
            )}

            <Box className={`w-4 h-4 flex-shrink-0 ${node.type === 'direct' ? 'text-indigo-400' : 'text-slate-500'}`} />
            
            <span className="font-bold text-white text-xs">{node.name}</span>
            <span className="font-mono text-[11px] text-slate-400">@{node.resolvedVersion || node.requestedVersion || 'latest'}</span>

            {hasMultiplePaths && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Paths ({node.paths.length})
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              node.type === 'direct' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {node.type}
            </span>

            {node.license && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-sans border border-slate-700">
                {node.license}
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map((child, idx) => (
              <TreeNode key={`${child.name}-${idx}`} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Software Dependency Tree Explorer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Project Dependency Hierarchy</h1>
          <p className="text-xs text-slate-400 mt-1">
            Project-first folder hierarchy displaying direct and transitive dependencies parsed from build manifests.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Packages</span>
          <div className="text-2xl font-bold text-white mt-1">{deps.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Direct Dependencies</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{deps.filter(d=>d.type==='direct').length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Transitive Packages</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{deps.filter(d=>d.type==='transitive').length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Development Tools</span>
          <div className="text-2xl font-bold text-slate-400 mt-1">{deps.filter(d=>d.isDevDependency).length}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search package name, license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          {['all', 'direct', 'transitive', 'production', 'development'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 border border-slate-700/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Project-First Tree Explorer */}
      <div className="glass-panel border border-slate-800 p-6 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading project dependency explorer...</div>
        ) : !activeProject ? (
          <div className="p-12 text-center text-slate-400">No project selected.</div>
        ) : (
          <div className="space-y-3">
            {/* LEVEL 1: Root Project Folder */}
            <div className="border border-slate-800 rounded-2xl bg-slate-900/50 overflow-hidden">
              <div 
                onClick={() => setProjectFolderOpen(!projectFolderOpen)}
                className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {projectFolderOpen ? <FolderOpen className="w-6 h-6 text-indigo-400" /> : <Folder className="w-6 h-6 text-indigo-400" />}
                  <div>
                    <h2 className="text-lg font-bold text-white">{activeProject.projectName || activeProject.name}</h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Ecosystem: {activeProject.ecosystem || 'npm'} • Total Dependencies: {deps.length} • Contextual Risk: {activeProject.averageRiskScore ?? 0}/100
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {deps.length} Packages
                  </span>
                  {projectFolderOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* LEVEL 2: Sub-folders (Production & Development Dependencies) */}
              {projectFolderOpen && (
                <div className="p-4 space-y-4">
                  {/* Production Dependencies Sub-folder */}
                  {prodDeps.length > 0 && (
                    <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
                      <div
                        onClick={() => setProdFolderOpen(!prodFolderOpen)}
                        className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          {prodFolderOpen ? <FolderOpen className="w-4 h-4 text-emerald-400" /> : <Folder className="w-4 h-4 text-emerald-400" />}
                          <span className="font-bold text-sm text-white">Production Dependencies</span>
                          <span className="text-xs text-emerald-400 font-mono">({prodDeps.length})</span>
                        </div>
                        {prodFolderOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </div>

                      {prodFolderOpen && (
                        <div className="p-2 space-y-1">
                          {prodTree.map((node, idx) => (
                            <TreeNode key={`prod-${node.name}-${idx}`} node={node} depth={0} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Development Dependencies Sub-folder */}
                  {devDeps.length > 0 && (
                    <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
                      <div
                        onClick={() => setDevFolderOpen(!devFolderOpen)}
                        className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          {devFolderOpen ? <FolderOpen className="w-4 h-4 text-amber-400" /> : <Folder className="w-4 h-4 text-amber-400" />}
                          <span className="font-bold text-sm text-white">Development Dependencies</span>
                          <span className="text-xs text-amber-400 font-mono">({devDeps.length})</span>
                        </div>
                        {devFolderOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </div>

                      {devFolderOpen && (
                        <div className="p-2 space-y-1">
                          {devTree.map((node, idx) => (
                            <TreeNode key={`dev-${node.name}-${idx}`} node={node} depth={0} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Package Inspector Modal / Drawer */}
      {selectedDep && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-6 max-w-xl w-full border border-slate-700 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Box className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">{selectedDep.name}</h3>
                <span className="text-xs text-slate-400 font-mono">@{selectedDep.resolvedVersion || selectedDep.requestedVersion}</span>
              </div>
              <button onClick={() => setSelectedDep(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-mono">Dependency Type</span>
                <p className="font-bold text-white mt-1 uppercase">{selectedDep.type}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-mono">Section</span>
                <p className="font-bold text-emerald-400 mt-1">{selectedDep.isDevDependency ? 'devDependencies' : 'dependencies'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-mono">Requested Spec</span>
                <p className="font-bold text-cyan-400 mt-1 font-mono">{selectedDep.requestedVersion || '*'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-mono">SPDX License</span>
                <p className="font-bold text-amber-400 mt-1">{selectedDep.license || 'MIT'}</p>
              </div>
            </div>

            {/* Parent Dependencies */}
            {selectedDep.parentNames && selectedDep.parentNames.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-300">Parent Dependencies:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedDep.parentNames.map((p, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dependency Chain Paths */}
            {selectedDep.paths && selectedDep.paths.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-300">Root-to-Leaf Dependency Paths ({selectedDep.paths.length}):</span>
                <div className="space-y-1.5 mt-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {selectedDep.paths.map((pathArr, pIdx) => (
                    <div key={pIdx} className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                      {pathArr.map((step, sIdx) => (
                        <React.Fragment key={sIdx}>
                          {sIdx > 0 && <span className="text-slate-600">→</span>}
                          <span className={sIdx === pathArr.length - 1 ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
                            {step}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-800 pt-3">
              <button
                onClick={() => setSelectedDep(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
