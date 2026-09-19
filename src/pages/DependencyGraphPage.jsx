import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GitFork, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X,
  Layers,
  Info,
  Loader2
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'
import ProjectContextBar from '../components/ProjectContextBar'

const NODE_COLORS = {
  root: { bg: '#101828', border: '#1D2939', text: '#FFFFFF' },
  direct: { bg: '#EFF4FF', border: '#D1E0FF', text: '#1E40AF' },
  transitive: { bg: '#F8FAFC', border: '#E4E7EC', text: '#344054' }
}

export default function DependencyGraphPage() {
  const { id: routeId } = useParams()
  const { selectedProject, projects, selectProjectById } = useProjects()
  const activeProject = selectedProject || (projects.length > 0 ? projects[0] : null)
  const activeProjectId = routeId || activeProject?._id

  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [search, setSearch] = useState('')
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (routeId) {
      selectProjectById(routeId)
    }
  }, [routeId])

  useEffect(() => {
    if (activeProjectId) {
      setNodes([])
      setEdges([])
      setSelectedNode(null)
      loadGraph(activeProjectId)
    } else {
      setNodes([])
      setEdges([])
    }
  }, [activeProjectId])

  const loadGraph = async (pid) => {
    setLoading(true)
    try {
      // 1. Try dedicated graph endpoint
      const res = await api.get(`/projects/${pid}/graph`).catch(() => null)
      if (res?.data?.nodes && Array.isArray(res.data.nodes) && res.data.nodes.length > 0) {
        const rootLabel = activeProject ? `${activeProject.projectName || activeProject.name} v${activeProject.projectVersion || '1.0.0'}` : 'Application'
        const mappedNodes = res.data.nodes.map((n, idx) => ({
          id: n.id,
          label: n.id === 'root' ? rootLabel : (n.data?.label || n.id),
          type: idx === 0 ? 'root' : (n.data?.type || (idx < 4 ? 'direct' : 'transitive')),
          x: 200 + (idx % 4) * 180,
          y: 80 + Math.floor(idx / 4) * 120
        }))
        setNodes(mappedNodes)
        setEdges(res.data.edges || [])
        return
      }

      // 2. Otherwise generate graph from project's actual dependencies
      const depRes = await api.get(`/projects/${pid}/dependencies`)
      const deps = depRes.data?.dependencies || []
      
      const rootId = 'root'
      const rootLabel = activeProject ? `${activeProject.projectName || activeProject.name} v${activeProject.projectVersion || '1.0.0'}` : 'Project Root'
      
      const generatedNodes = [
        { id: rootId, label: rootLabel, type: 'root', x: 450, y: 60 }
      ]
      const generatedEdges = []

      const directs = deps.filter(d => (d.type || '').toLowerCase() === 'direct')
      const transitives = deps.filter(d => (d.type || '').toLowerCase() === 'transitive')

      directs.forEach((d, idx) => {
        const x = 160 + (idx * 160)
        generatedNodes.push({
          id: d.name,
          label: `${d.name} @ ${d.resolvedVersion || d.requestedVersion || '1.0.0'}`,
          type: 'direct',
          license: d.license,
          purl: d.purl,
          paths: d.paths,
          x,
          y: 200
        })
        generatedEdges.push({ source: rootId, target: d.name })
      })

      transitives.forEach((t, idx) => {
        const x = 140 + (idx * 150)
        generatedNodes.push({
          id: t.name,
          label: `${t.name} @ ${t.resolvedVersion || t.requestedVersion || '1.0.0'}`,
          type: 'transitive',
          license: t.license,
          purl: t.purl,
          paths: t.paths,
          x,
          y: 340
        })

        // Edge from direct parent if found in path
        const parentName = t.paths?.[0]?.[1] || (directs[idx % (directs.length || 1)]?.name)
        if (parentName) {
          generatedEdges.push({ source: parentName, target: t.name })
        } else {
          generatedEdges.push({ source: rootId, target: t.name })
        }
      })

      setNodes(generatedNodes)
      setEdges(generatedEdges)
    } catch (e) {
      console.warn('Graph generation error:', e.message)
      setNodes([])
      setEdges([])
    } finally {
      setLoading(false)
    }
  }

  const filteredNodes = nodes.filter((n) => {
    if (!search) return true
    return n.label.toLowerCase().includes(search.toLowerCase()) || n.id.toLowerCase().includes(search.toLowerCase())
  })

  const projectName = activeProject ? (activeProject.projectName || activeProject.name) : 'Selected Project'

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Project Context Bar */}
      <ProjectContextBar activeTab="graph" />

      {/* 2. Editorial Hero Section */}
      <div className="hero-surface radial-glow p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
              <GitFork className="w-4 h-4" />
              <span>Directed Graph Topology</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              Dependency Graph
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
              Interactive topological representation of direct and transitive package resolution paths for <strong className="text-[#101828]">{projectName}</strong>.
            </p>

            <div className="flex items-center flex-wrap gap-3 pt-2 text-xs text-[#667085]">
              <span>Graph Nodes: <strong className="text-[#101828] font-mono">{nodes.length}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Directed Edges: <strong className="text-[#101828] font-mono">{edges.length}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive White Dot-Grid Canvas with Floating Dock */}
      <div className="saas-card relative overflow-hidden bg-white border border-[#E4E7EC] min-h-[550px]">
        {/* Floating Controls Dock */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-[#E4E7EC] rounded-xl p-1.5 shadow-saas-sm">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find node..."
              className="pl-8 pr-3 py-1 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none w-36 sm:w-48"
            />
          </div>

          <div className="h-4 w-px bg-[#E4E7EC]"></div>

          <button
            onClick={() => setZoom(z => Math.min(1.6, z + 0.1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-[#667085] hover:text-[#101828] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-[#667085] hover:text-[#101828] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-[#667085] hover:text-[#101828] transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-3 bg-white/90 backdrop-blur-sm border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs shadow-saas-sm">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#101828]"></span>
            <span className="text-[#667085]">Root</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-[#667085]">Direct</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="text-[#667085]">Transitive</span>
          </div>
        </div>

        {/* Canvas Area with Dot-Grid Background */}
        <div className="dot-grid-canvas w-full h-[550px] overflow-auto relative p-8">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
            </div>
          ) : (
            <div 
              className="relative min-w-[950px] min-h-[500px]"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.15s ease' }}
            >
              {/* SVG Edges */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#CBD5E1" />
                  </marker>
                </defs>
                {edges.map((e, idx) => {
                  const sNode = nodes.find(n => n.id === e.source)
                  const tNode = nodes.find(n => n.id === e.target)
                  if (!sNode || !tNode) return null

                  const x1 = sNode.x + 70
                  const y1 = sNode.y + 20
                  const x2 = tNode.x + 70
                  const y2 = tNode.y + 20

                  return (
                    <line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#CBD5E1"
                      strokeWidth="1.5"
                      strokeDasharray={tNode.type === 'transitive' ? '4 3' : 'none'}
                      markerEnd="url(#arrowhead)"
                    />
                  )
                })}
              </svg>

              {/* Node Chips */}
              {filteredNodes.map((n) => {
                const colors = NODE_COLORS[n.type] || NODE_COLORS.transitive
                const isSelected = selectedNode?.id === n.id

                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    style={{
                      position: 'absolute',
                      left: n.x,
                      top: n.y,
                      backgroundColor: colors.bg,
                      borderColor: isSelected ? '#2563EB' : colors.border,
                      color: colors.text
                    }}
                    className={`px-3.5 py-2 rounded-xl border font-mono text-xs font-semibold cursor-pointer shadow-saas-xs hover:shadow-saas-md transition-all flex items-center space-x-2 ${
                      isSelected ? 'ring-2 ring-blue-500/30' : ''
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.text }}></span>
                    <span className="truncate max-w-[150px]">{n.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Selected Node Inspector Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-white shadow-saas-xl border-l border-[#E4E7EC] flex flex-col justify-between"
              >
                <div className="p-6 border-b border-[#E4E7EC] flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]">
                      TOPOLOGY NODE
                    </span>
                    <h3 className="text-lg font-black text-[#101828] font-mono mt-1">
                      {selectedNode.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded-lg border border-[#E4E7EC] text-[#98A2B3] hover:text-[#101828]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#98A2B3]">Scope Classification</span>
                    <span className="font-extrabold text-[#101828] block uppercase">
                      {selectedNode.type}
                    </span>
                  </div>

                  {selectedNode.license && (
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#98A2B3]">Declared License</span>
                      <span className="font-mono text-emerald-700 font-bold block">
                        {selectedNode.license}
                      </span>
                    </div>
                  )}

                  {selectedNode.paths && selectedNode.paths.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#98A2B3] mb-1.5">Chain Paths</h4>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[11px] text-[#344054] space-y-1">
                        {selectedNode.paths.map((p, idx) => (
                          <div key={idx}>↳ {p.join(' → ')}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-[#E4E7EC] bg-slate-50 flex justify-end">
                  <button
                    onClick={() => setSelectedNode(null)}
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
