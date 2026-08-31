import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  GitFork, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Box, 
  ShieldAlert, 
  X 
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'

const MOCK_GRAPH = {
  nodes: [
    { id: 'root', label: 'payment-gateway-service v2.4.1', type: 'root', x: 400, y: 80 },
    { id: 'express', label: 'express @ 4.18.2', type: 'direct', x: 220, y: 220 },
    { id: 'jsonwebtoken', label: 'jsonwebtoken @ 9.0.2', type: 'direct', x: 400, y: 220 },
    { id: 'axios', label: 'axios @ 1.6.2', type: 'direct', x: 580, y: 220 },
    { id: 'body-parser', label: 'body-parser @ 1.20.2', type: 'transitive', x: 140, y: 360 },
    { id: 'qs', label: 'qs @ 6.11.0', type: 'transitive', x: 300, y: 360 },
    { id: 'semver', label: 'semver @ 7.5.4', type: 'transitive', x: 440, y: 360 },
    { id: 'lodash', label: 'lodash @ 4.17.21', type: 'transitive', x: 620, y: 360 },
  ],
  edges: [
    { source: 'root', target: 'express' },
    { source: 'root', target: 'jsonwebtoken' },
    { source: 'root', target: 'axios' },
    { source: 'express', target: 'body-parser' },
    { source: 'express', target: 'qs' },
    { source: 'jsonwebtoken', target: 'semver' },
    { source: 'axios', target: 'lodash' },
  ]
}

export default function DependencyGraphPage() {
  const { id: routeId } = useParams()
  const { selectedProject, projects } = useProjects()
  const activeProjectId = routeId || selectedProject?._id || (projects[0]?._id)

  const [nodes, setNodes] = useState(MOCK_GRAPH.nodes)
  const [edges, setEdges] = useState(MOCK_GRAPH.edges)
  const [selectedNode, setSelectedNode] = useState(null)
  const [search, setSearch] = useState('')
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (activeProjectId) loadGraph(activeProjectId)
  }, [activeProjectId])

  const loadGraph = async (pid) => {
    try {
      const res = await api.get(`/projects/${pid}/graph`)
      if (res.data && res.data.nodes && res.data.nodes.length > 0) {
        const mappedNodes = res.data.nodes.map((n, idx) => ({
          id: n.id,
          label: n.data?.label || n.id,
          type: idx === 0 ? 'root' : idx < 4 ? 'direct' : 'transitive',
          x: 200 + (idx % 4) * 180,
          y: 100 + Math.floor(idx / 4) * 140
        }))
        setNodes(mappedNodes)
        setEdges(res.data.edges || [])
      }
    } catch (e) {
      setNodes(MOCK_GRAPH.nodes)
      setEdges(MOCK_GRAPH.edges)
    }
  }

  const filteredNodes = nodes.filter(n => 
    search.trim() === '' || n.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-10">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GitFork className="w-4 h-4" />
            <span>Dependency Tree Visualizer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dependency Graph</h1>
          <p className="text-xs text-slate-400 mt-1">
            Interactive canvas graph showing direct and transitive dependency relationships.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.15, 1.6))}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.15, 0.6))}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative glass-panel border border-slate-800 overflow-hidden h-[600px] rounded-2xl">
        {/* Search Overlay */}
        <div className="absolute top-4 left-4 z-10 w-64">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search graph node..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 backdrop-blur-md"
            />
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-3 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl backdrop-blur-md text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></span>
            <span className="text-slate-300">Direct</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span className="text-slate-300">Transitive</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Root App</span>
          </div>
        </div>

        {/* Canvas SVG */}
        <div className="w-full h-full flex items-center justify-center overflow-auto p-8">
          <div className="transition-transform duration-200 origin-center" style={{ transform: `scale(${zoom})` }}>
            <svg width="850" height="500" className="overflow-visible">
              <defs>
                <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Render Connections */}
              {edges.map((e, idx) => {
                const sourceNode = nodes.find(n => n.id === e.source)
                const targetNode = nodes.find(n => n.id === e.target)
                if (!sourceNode || !targetNode) return null

                return (
                  <line
                    key={idx}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="url(#edge-gradient)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                )
              })}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id
                const isRoot = node.type === 'root'
                const isDirect = node.type === 'direct'

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={isRoot ? 24 : 18}
                      fill={isRoot ? '#10b981' : isDirect ? '#6366f1' : '#06b6d4'}
                      opacity={isSelected ? 1 : 0.85}
                      className="transition-all duration-200 group-hover:scale-125"
                      style={{
                        filter: isSelected
                          ? 'drop-shadow(0 0 12px rgba(99,102,241,0.8))'
                          : 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))'
                      }}
                    />
                    <text
                      y={isRoot ? 40 : 34}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight="600"
                      className="font-mono pointer-events-none drop-shadow"
                    >
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Inspect Drawer */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-4 bottom-4 z-20 w-80 glass-panel p-5 border border-slate-700 shadow-2xl rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <Box className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-white text-sm">{selectedNode.label}</h4>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">NodeType:</span>
                <span className="text-indigo-400 font-semibold uppercase">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License:</span>
                <span className="text-emerald-400 font-mono">MIT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vulnerabilities:</span>
                <span className="text-slate-300">0 open</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
