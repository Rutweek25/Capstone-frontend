import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Layers, 
  FileText,
  ChevronRight
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'

export default function Recommendations() {
  const { id } = useParams()
  const { activeProject } = useProjects()
  const projectId = id || activeProject?._id

  const [recommendations, setRecommendations] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [selectedRec, setSelectedRec] = useState(null)

  const fetchRecommendations = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const res = await api.get(`/projects/${projectId}/recommendations`)
      const list = res.data.recommendations || []
      setRecommendations(list)

      const sumRes = await api.get(`/projects/${projectId}/recommendations/summary`)
      setSummary(sumRes.data.summary)
    } catch (err) {
      console.warn('Failed to fetch recommendations', err)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!projectId) return
    setGenerating(true)
    try {
      const res = await api.post(`/projects/${projectId}/recommendations/generate`)
      setRecommendations(res.data.recommendations || [])
      setSummary(res.data.summary)
    } catch (err) {
      console.warn('Recommendation generation error', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleStatusChange = async (recId, newStatus) => {
    try {
      await api.put(`/projects/${projectId}/recommendations/${recId}/status`, { status: newStatus })
      setRecommendations(prev => prev.map(r => r._id === recId ? { ...r, status: newStatus } : r))
      if (selectedRec && selectedRec._id === recId) {
        setSelectedRec(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      console.warn('Status update failed', err)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [projectId])

  const filteredRecs = recommendations.filter(r => {
    const matchesSearch = (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.packageName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.action || '').toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter
    return matchesSearch && matchesPriority && matchesCategory
  })

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center space-x-1"><ShieldAlert className="w-3 h-3" /><span>CRITICAL</span></span>
      case 'HIGH':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1"><AlertTriangle className="w-3 h-3" /><span>HIGH</span></span>
      case 'MEDIUM':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1"><Info className="w-3 h-3" /><span>MEDIUM</span></span>
      case 'LOW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">LOW</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">INFO</span>
    }
  }

  const getCategoryBadge = (cat) => {
    const colors = {
      SECURITY: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      LICENSE: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      SBOM: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      POLICY: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      DEPENDENCY: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
    }
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${colors[cat] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
        {cat}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Remediation Recommendations</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Actionable remediation guidance synthesized from vulnerability, license, SBOM, and policy engine findings.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Synthesizing Guidance...' : 'Generate Recommendations'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Actions</div>
          <div className="text-2xl font-black text-white mt-1">{summary?.total ?? recommendations.length}</div>
        </div>
        <div className="glass-panel p-4 border border-rose-500/20 bg-rose-500/5">
          <div className="text-xs text-rose-400 font-medium">Critical Priority</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{summary?.critical ?? 0}</div>
        </div>
        <div className="glass-panel p-4 border border-amber-500/20 bg-amber-500/5">
          <div className="text-xs text-amber-400 font-medium">High Priority</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{summary?.high ?? 0}</div>
        </div>
        <div className="glass-panel p-4 border border-cyan-500/20 bg-cyan-500/5">
          <div className="text-xs text-cyan-400 font-medium">Medium Priority</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{summary?.medium ?? 0}</div>
        </div>
        <div className="glass-panel p-4 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Low Priority</div>
          <div className="text-2xl font-black text-slate-300 mt-1">{summary?.low ?? 0}</div>
        </div>
        <div className="glass-panel p-4 border border-emerald-500/20 bg-emerald-500/5">
          <div className="text-xs text-emerald-400 font-medium">Open Items</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{summary?.open ?? 0}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search recommendations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
          </div>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                priorityFilter === p ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-800 mx-2"></div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
            <span>Category:</span>
          </div>
          {['ALL', 'SECURITY', 'LICENSE', 'SBOM', 'POLICY'].map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === c ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20' : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Table */}
      <div className="glass-panel border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading recommendations...</div>
        ) : filteredRecs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
            <p className="text-base font-bold text-white">No Open Recommendations</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No pending remediation recommendations match your criteria. Click "Generate Recommendations" to synthesize fresh guidance.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Title & Package</th>
                  <th className="py-3.5 px-4">Recommended Action</th>
                  <th className="py-3.5 px-4">Fix Version</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredRecs.map(rec => (
                  <tr key={rec._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono">{getPriorityBadge(rec.priority)}</td>
                    <td className="py-3.5 px-4">{getCategoryBadge(rec.category)}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{rec.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {rec.packageName ? `${rec.packageName}@${rec.currentVersion || 'current'}` : 'Project Scope'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-slate-300 text-xs line-clamp-2">{rec.action}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400">
                      {rec.recommendedVersion || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={rec.status || 'OPEN'}
                        onChange={e => handleStatusChange(rec._id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="DISMISSED">DISMISSED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedRec(rec)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-medium text-xs transition-all inline-flex items-center space-x-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-6 max-w-2xl w-full border border-slate-700 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                {getPriorityBadge(selectedRec.priority)}
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedRec.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Category: {selectedRec.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRec(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                <span className="font-bold">Recommended Action:</span> {selectedRec.action}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 font-mono">Affected Package</div>
                  <div className="font-bold text-white mt-1">{selectedRec.packageName || 'Project Scope'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 font-mono">Target Fix Version</div>
                  <div className="font-bold text-cyan-400 mt-1">{selectedRec.recommendedVersion || 'N/A'}</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300">Justification & Reason:</span>
                <p className="text-slate-400 mt-1">{selectedRec.reason}</p>
              </div>

              {selectedRec.description && (
                <div>
                  <span className="font-bold text-slate-300">Detailed Description:</span>
                  <p className="text-slate-400 mt-1">{selectedRec.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedRec(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
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
