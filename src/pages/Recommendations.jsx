import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowRight, 
  ShieldCheck, 
  Check,
  Play,
  Loader2,
  Sparkles
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'
import ProjectContextBar from '../components/ProjectContextBar'

const PRIORITY_BADGES = {
  CRITICAL: 'saas-badge-fail',
  HIGH: 'saas-badge-fail',
  MEDIUM: 'saas-badge-review',
  LOW: 'saas-badge-pass',
  INFO: 'saas-badge-info'
}

const CATEGORY_COLORS = {
  SECURITY: 'bg-rose-50 text-rose-700 border-rose-200',
  LICENSE: 'bg-amber-50 text-amber-700 border-amber-200',
  SBOM: 'bg-blue-50 text-blue-700 border-blue-200',
  POLICY: 'bg-purple-50 text-purple-700 border-purple-200'
}

export default function Recommendations() {
  const { id: routeId } = useParams()
  const { selectedProject, projects, selectProjectById } = useProjects()

  const activeProject = selectedProject || (projects.length > 0 ? projects[0] : null)
  const projectId = routeId || activeProject?._id

  const [recommendations, setRecommendations] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  
  // Controls
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  useEffect(() => {
    if (routeId) {
      selectProjectById(routeId)
    }
  }, [routeId])

  const fetchRecommendations = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const res = await api.get(`/projects/${projectId}/recommendations`)
      const list = res.data?.recommendations && Array.isArray(res.data.recommendations) 
        ? res.data.recommendations 
        : []
      setRecommendations(list)

      const crit = list.filter(r => (r.priority || '').toUpperCase() === 'CRITICAL').length
      const hi = list.filter(r => (r.priority || '').toUpperCase() === 'HIGH').length
      const med = list.filter(r => (r.priority || '').toUpperCase() === 'MEDIUM').length
      const lo = list.filter(r => (r.priority || '').toUpperCase() === 'LOW').length

      setSummary({ critical: crit, high: hi, medium: med, low: lo })
    } catch (err) {
      console.warn('Recommendations API error:', err.message)
      setRecommendations([])
      setSummary({ critical: 0, high: 0, medium: 0, low: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [projectId])

  const handleGenerate = async () => {
    if (!projectId || generating) return
    setGenerating(true)
    try {
      await api.post(`/projects/${projectId}/recommendations/generate`)
      await fetchRecommendations()
    } catch (err) {
      console.warn('Recommendation generation error:', err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleStatusChange = async (recId, newStatus) => {
    try {
      setRecommendations(prev => prev.map(r => r._id === recId ? { ...r, status: newStatus } : r))
      await api.patch(`/projects/${projectId}/recommendations/${recId}/status`, { status: newStatus })
    } catch (err) {
      console.warn('Status update error:', err.message)
    }
  }

  const filtered = useMemo(() => {
    return recommendations.filter((r) => {
      const p = (r.priority || '').toUpperCase()
      const c = (r.category || '').toUpperCase()
      const matchesPriority = priorityFilter === 'ALL' || p === priorityFilter
      const matchesCategory = categoryFilter === 'ALL' || c === categoryFilter
      const query = search.toLowerCase()
      const matchesSearch = !query ||
        (r.title || '').toLowerCase().includes(query) ||
        (r.packageName || '').toLowerCase().includes(query) ||
        (r.action || '').toLowerCase().includes(query)
      return matchesPriority && matchesCategory && matchesSearch
    })
  }, [recommendations, priorityFilter, categoryFilter, search])

  const projectName = activeProject ? (activeProject.projectName || activeProject.name) : 'Selected Project'

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Project Context Bar */}
      <ProjectContextBar activeTab="recommendations" />

      {/* 2. Editorial Hero Section */}
      <div className="hero-surface radial-glow p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Prioritized Decision Support</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              Remediation Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
              Actionable, non-breaking upgrade paths and policy remediation steps computed for <strong className="text-[#101828]">{projectName}</strong>.
            </p>

            <div className="flex items-center flex-wrap gap-3 pt-2 text-xs text-[#667085]">
              <span>Active Action Items: <strong className="text-[#101828] font-mono">{recommendations.length}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Critical Actions: <strong className="text-rose-600 font-mono">{summary?.critical || 0}</strong></span>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !projectId}
            className="btn-primary text-xs self-start lg:self-auto flex-shrink-0"
          >
            {generating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-amber-400" /> : <Play className="w-4 h-4 mr-1.5 fill-white" />}
            <span>{generating ? 'Compiling Actions...' : 'Generate Action Plan'}</span>
          </button>
        </div>
      </div>

      {/* 3. Bento Priority Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">P1 · Critical</span>
          <div className="text-3xl font-black text-rose-600 mt-2 font-mono">{summary?.critical || 0}</div>
          <p className="text-[11px] text-[#667085] mt-1">High-priority fixes</p>
        </div>

        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">P2 · High</span>
          <div className="text-3xl font-black text-amber-600 mt-2 font-mono">{summary?.high || 0}</div>
          <p className="text-[11px] text-[#667085] mt-1">Severe advisories</p>
        </div>

        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">P3 · Medium</span>
          <div className="text-3xl font-black text-[#101828] mt-2 font-mono">{summary?.medium || 0}</div>
          <p className="text-[11px] text-[#667085] mt-1">Moderate improvements</p>
        </div>

        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">P4 · Low / Info</span>
          <div className="text-3xl font-black text-emerald-700 mt-2 font-mono">{summary?.low || 0}</div>
          <p className="text-[11px] text-[#667085] mt-1">Routine updates</p>
        </div>
      </div>

      {/* 4. Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action items..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#D0D5DD] rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-saas-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setPriorityFilter(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                priorityFilter === lvl
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Numbered Action Cards */}
      {loading ? (
        <div className="saas-card p-16 text-center text-[#98A2B3] text-xs font-medium space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
          <p>Evaluating remediation opportunities for {projectName}...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="saas-card p-16 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-[#101828]">No pending remediations</h3>
          <p className="text-xs text-[#667085] max-w-md mx-auto">
            All evaluated dependency risks have been acknowledged or resolved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rec, idx) => {
            const num = String(idx + 1).padStart(2, '0')
            const prio = (rec.priority || 'MEDIUM').toUpperCase()
            const prioBadge = PRIORITY_BADGES[prio] || 'saas-badge-neutral'
            const cat = (rec.category || 'SECURITY').toUpperCase()
            const catColor = CATEGORY_COLORS[cat] || 'bg-slate-50 text-slate-700 border-slate-200'

            return (
              <div
                key={rec._id || idx}
                className="saas-card p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-5 transition-all hover:border-[#D0D5DD]"
              >
                <div className="flex items-start space-x-4 min-w-0">
                  {/* Number Badge */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#101828] font-mono font-black text-xs flex items-center justify-center flex-shrink-0 border border-[#E4E7EC]">
                    {num}
                  </div>

                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${prioBadge}`}>
                        {prio}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catColor}`}>
                        {cat}
                      </span>
                      {rec.packageName && (
                        <span className="font-mono text-xs font-bold text-[#101828]">
                          {rec.packageName}
                        </span>
                      )}
                      {rec.currentVersion && (
                        <span className="font-mono text-xs text-[#667085]">
                          v{rec.currentVersion} → <strong className="text-emerald-700">{rec.recommendedVersion || 'Latest'}</strong>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#101828] leading-tight">
                      {rec.title || rec.action}
                    </h3>

                    <p className="text-xs text-[#667085] leading-relaxed max-w-2xl">
                      {rec.description || rec.reason || rec.remediationDetails}
                    </p>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0 pt-1 sm:pt-0">
                  <select
                    value={rec.status || 'OPEN'}
                    onChange={(e) => handleStatusChange(rec._id, e.target.value)}
                    className="bg-white border border-[#D0D5DD] hover:border-[#98A2B3] text-xs text-[#101828] font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-saas-xs"
                  >
                    <option value="OPEN">Open</option>
                    <option value="ACKNOWLEDGED">Acknowledged</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="DISMISSED">Dismissed</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
