import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bug, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Play, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ArrowUpDown
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'
import ProjectContextBar from '../components/ProjectContextBar'

const SEVERITY_BADGES = {
  CRITICAL: 'saas-badge-fail',
  HIGH: 'saas-badge-review',
  MEDIUM: 'saas-badge-review',
  LOW: 'saas-badge-pass',
  UNKNOWN: 'saas-badge-neutral'
}

export default function Vulnerabilities() {
  const { id: routeId } = useParams()
  const { selectedProject, projects, selectProjectById } = useProjects()

  const activeProject = selectedProject || (projects.length > 0 ? projects[0] : null)
  const activeProjectId = routeId || activeProject?._id

  const [summary, setSummary] = useState({ totalVulnerabilities: 0, critical: 0, high: 0, medium: 0, low: 0, unknown: 0 })
  const [vulns, setVulns] = useState([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // Filters & Controls
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('severity')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVuln, setSelectedVuln] = useState(null)
  const pageSize = 10

  useEffect(() => {
    if (routeId) {
      selectProjectById(routeId)
    }
  }, [routeId])

  useEffect(() => {
    if (activeProjectId) {
      loadVulnerabilities(activeProjectId)
    } else {
      setVulns([])
      setSummary({ totalVulnerabilities: 0, critical: 0, high: 0, medium: 0, low: 0, unknown: 0 })
    }
  }, [activeProjectId])

  const loadVulnerabilities = async (pid) => {
    setLoading(true)
    try {
      const vRes = await api.get(`/projects/${pid}/vulnerabilities`)
      const fetched = vRes.data?.vulnerabilities && Array.isArray(vRes.data.vulnerabilities) 
        ? vRes.data.vulnerabilities 
        : []
      setVulns(fetched)

      // Calculate summary directly from project's real vulnerability findings
      const crit = fetched.filter(v => (v.severity || '').toUpperCase() === 'CRITICAL').length
      const hi = fetched.filter(v => (v.severity || '').toUpperCase() === 'HIGH').length
      const med = fetched.filter(v => (v.severity || '').toUpperCase() === 'MEDIUM').length
      const lo = fetched.filter(v => (v.severity || '').toUpperCase() === 'LOW').length
      const unk = fetched.filter(v => !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes((v.severity || '').toUpperCase())).length

      setSummary({
        totalVulnerabilities: fetched.length,
        critical: crit,
        high: hi,
        medium: med,
        low: lo,
        unknown: unk
      })
    } catch (e) {
      console.warn('Vulnerabilities API error:', e.message)
      setVulns([])
      setSummary({ totalVulnerabilities: 0, critical: 0, high: 0, medium: 0, low: 0, unknown: 0 })
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    if (!activeProjectId || analyzing) return
    setAnalyzing(true)
    try {
      await api.post(`/projects/${activeProjectId}/vulnerabilities/analyze`)
      await loadVulnerabilities(activeProjectId)
    } catch (e) {
      console.warn('Vulnerability scan error:', e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  // Filtering & Sorting
  const sevPriority = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, UNKNOWN: 0 }

  const filteredVulns = vulns.filter((v) => {
    const sev = (v.severity || 'UNKNOWN').toUpperCase()
    const matchesSev = severityFilter === 'ALL' || sev === severityFilter
    const query = search.toLowerCase()
    const matchesSearch = !query || 
      (v.packageName || '').toLowerCase().includes(query) ||
      (v.vulnerabilityId || '').toLowerCase().includes(query) ||
      (v.summary || '').toLowerCase().includes(query) ||
      (v.aliases || []).some(a => a.toLowerCase().includes(query))
    return matchesSev && matchesSearch
  })

  const sortedVulns = [...filteredVulns].sort((a, b) => {
    if (sortBy === 'severity') {
      const pA = sevPriority[(a.severity || 'UNKNOWN').toUpperCase()] || 0
      const pB = sevPriority[(b.severity || 'UNKNOWN').toUpperCase()] || 0
      return sortOrder === 'desc' ? pB - pA : pA - pB
    }
    if (sortBy === 'cvss') {
      const cA = a.cvssScore ?? -1
      const cB = b.cvssScore ?? -1
      return sortOrder === 'desc' ? cB - cA : cA - cB
    }
    if (sortBy === 'package') {
      const nA = (a.packageName || '').toLowerCase()
      const nB = (b.packageName || '').toLowerCase()
      return sortOrder === 'desc' ? nB.localeCompare(nA) : nA.localeCompare(nB)
    }
    return 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedVulns.length / pageSize) || 1
  const paginatedVulns = sortedVulns.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const projectName = activeProject ? (activeProject.projectName || activeProject.name) : 'Selected Project'

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Project Context Bar */}
      <ProjectContextBar activeTab="vulnerabilities" />

      {/* 2. Editorial Hero Section */}
      <div className="hero-surface radial-glow p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#D92D20] text-xs font-bold uppercase tracking-wider">
              <Bug className="w-4 h-4" />
              <span>OSV Knowledgebase Feed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              Vulnerability Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
              Open-source vulnerability advisories matched against declared dependencies in <strong className="text-[#101828]">{projectName}</strong>.
            </p>

            <div className="flex items-center flex-wrap gap-3 pt-2 text-xs text-[#667085]">
              <span className="inline-flex items-center space-x-1.5 font-semibold text-[#101828]">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>{projectName}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span>Total Advisories: <strong className="text-[#101828] font-mono">{summary.totalVulnerabilities}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Critical: <strong className="text-rose-600 font-mono">{summary.critical}</strong></span>
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={analyzing || !activeProjectId}
            className="btn-primary text-xs self-start lg:self-auto flex-shrink-0"
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-rose-400" />
            ) : (
              <Play className="w-4 h-4 mr-1.5 fill-white" />
            )}
            <span>{analyzing ? 'Querying OSV Batch...' : 'Run Vulnerability Scan'}</span>
          </button>
        </div>
      </div>

      {/* 3. Bento Severity Spectrum Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Critical */}
        <div 
          onClick={() => { setSeverityFilter(severityFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL'); setCurrentPage(1); }}
          className={`saas-card-hover p-5 cursor-pointer transition-all ${
            severityFilter === 'CRITICAL' ? 'ring-2 ring-rose-500 bg-rose-50/20' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Critical</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          </div>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">
            {summary.critical ?? 0}
          </div>
          <p className="text-[11px] text-[#667085] mt-1">Immediate remediation target</p>
        </div>

        {/* High */}
        <div 
          onClick={() => { setSeverityFilter(severityFilter === 'HIGH' ? 'ALL' : 'HIGH'); setCurrentPage(1); }}
          className={`saas-card-hover p-5 cursor-pointer transition-all ${
            severityFilter === 'HIGH' ? 'ring-2 ring-amber-500 bg-amber-50/20' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">High</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">
            {summary.high ?? 0}
          </div>
          <p className="text-[11px] text-[#667085] mt-1">High CVSS exploitability</p>
        </div>

        {/* Medium */}
        <div 
          onClick={() => { setSeverityFilter(severityFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM'); setCurrentPage(1); }}
          className={`saas-card-hover p-5 cursor-pointer transition-all ${
            severityFilter === 'MEDIUM' ? 'ring-2 ring-amber-400 bg-amber-50/10' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Medium</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          </div>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">
            {summary.medium ?? 0}
          </div>
          <p className="text-[11px] text-[#667085] mt-1">Moderate risk impact</p>
        </div>

        {/* Low */}
        <div 
          onClick={() => { setSeverityFilter(severityFilter === 'LOW' ? 'ALL' : 'LOW'); setCurrentPage(1); }}
          className={`saas-card-hover p-5 cursor-pointer transition-all ${
            severityFilter === 'LOW' ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Low</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          </div>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">
            {summary.low ?? 0}
          </div>
          <p className="text-[11px] text-[#667085] mt-1">Minor operational impact</p>
        </div>
      </div>

      {/* 4. Controls & Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search package, CVE ID, summary..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#D0D5DD] rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-saas-xs"
            />
          </div>

          {/* Severity Pills & Sort */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setSeverityFilter(lvl); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  severityFilter === lvl
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="saas-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#98A2B3] text-xs font-medium space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mx-auto" />
              <p>Fetching advisories for {projectName}...</p>
            </div>
          ) : paginatedVulns.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-[#101828]">No vulnerabilities found</h3>
              <p className="text-xs text-[#667085] max-w-md mx-auto">
                No advisories matched the current query or filter criteria in this project.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Package</th>
                    <th>Version</th>
                    <th>Advisory ID</th>
                    <th>CVSS</th>
                    <th>Summary</th>
                    <th>Fixed In</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVulns.map((v) => {
                    const sev = (v.severity || 'UNKNOWN').toUpperCase()
                    const badgeClass = SEVERITY_BADGES[sev] || 'saas-badge-neutral'

                    return (
                      <tr 
                        key={v._id || `${v.packageName}-${v.vulnerabilityId}`}
                        onClick={() => setSelectedVuln(v)}
                        className="cursor-pointer"
                      >
                        <td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                            {sev}
                          </span>
                        </td>

                        <td>
                          <span className="font-extrabold text-[#101828] font-mono text-xs hover:text-blue-600">
                            {v.packageName}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs text-[#667085]">
                            {v.packageVersion || '1.0.0'}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs text-[#101828] font-semibold">
                            {v.vulnerabilityId || 'N/A'}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs font-bold text-[#101828]">
                            {v.cvssScore ?? '—'}
                          </span>
                        </td>

                        <td className="max-w-xs truncate text-xs text-[#667085]">
                          {v.summary || 'No summary text available'}
                        </td>

                        <td>
                          <span className="font-mono text-xs font-medium text-emerald-700">
                            {v.fixedVersions?.[0] ? `>= ${v.fixedVersions[0]}` : 'Unpatched'}
                          </span>
                        </td>

                        <td className="text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedVuln(v); }}
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

          {/* Pagination */}
          {sortedVulns.length > pageSize && (
            <div className="p-4 border-t border-[#E4E7EC] flex items-center justify-between text-xs text-[#667085]">
              <span>
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedVulns.length)} of {sortedVulns.length} vulnerabilities
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-[#D0D5DD] hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-[#101828]">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-[#D0D5DD] hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Slide-Over Detail Drawer (Strictly NO fake EPSS) */}
      <AnimatePresence>
        {selectedVuln && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVuln(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-xl bg-white shadow-saas-xl border-l border-[#E4E7EC] flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#E4E7EC] flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${SEVERITY_BADGES[(selectedVuln.severity || 'UNKNOWN').toUpperCase()]}`}>
                        {(selectedVuln.severity || 'UNKNOWN').toUpperCase()}
                      </span>
                      <span className="text-xs text-[#98A2B3] font-mono">CVSS {selectedVuln.cvssScore ?? 'N/A'}</span>
                    </div>
                    <h2 className="text-xl font-black text-[#101828] font-mono tracking-tight">
                      {selectedVuln.vulnerabilityId}
                    </h2>
                    {selectedVuln.aliases && selectedVuln.aliases.length > 0 && (
                      <p className="text-xs text-[#667085] font-mono">
                        Aliases: {selectedVuln.aliases.join(', ')}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedVuln(null)}
                    className="p-1.5 rounded-lg border border-[#E4E7EC] text-[#98A2B3] hover:text-[#101828]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
                  {/* Context Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
                      <span className="text-[10px] uppercase font-bold text-[#98A2B3] block">Package</span>
                      <span className="font-extrabold text-sm text-[#101828] font-mono mt-0.5 block">
                        {selectedVuln.packageName}
                      </span>
                      <span className="text-[11px] text-[#667085]">Installed: v{selectedVuln.packageVersion || '1.0.0'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
                      <span className="text-[10px] uppercase font-bold text-[#98A2B3] block">Fixed In</span>
                      <span className="font-extrabold text-sm text-emerald-700 font-mono mt-0.5 block">
                        {selectedVuln.fixedVersions?.[0] ? `>= ${selectedVuln.fixedVersions[0]}` : 'Unpatched'}
                      </span>
                      <span className="text-[11px] text-[#667085]">Project: {projectName}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#98A2B3] mb-2">Advisory Summary</h4>
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] text-[#344054] leading-relaxed">
                      {selectedVuln.summary || 'No advisory summary text provided in registry entry.'}
                    </div>
                  </div>

                  {/* Severity Vector */}
                  {selectedVuln.severityVector && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#98A2B3] mb-2">CVSS Vector</h4>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[11px] text-slate-800 break-all">
                        {selectedVuln.severityVector}
                      </div>
                    </div>
                  )}

                  {/* References */}
                  {selectedVuln.references && selectedVuln.references.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#98A2B3] mb-2">Advisory References</h4>
                      <div className="space-y-1.5">
                        {selectedVuln.references.slice(0, 5).map((ref, idx) => (
                          <a
                            key={idx}
                            href={ref.url || ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:underline truncate p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200"
                          >
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate font-mono text-[11px]">{ref.url || ref}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#E4E7EC] bg-slate-50 flex items-center justify-between">
                  <span className="text-[11px] text-[#667085]">
                    Project: <strong className="text-[#101828]">{projectName}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedVuln(null)}
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
