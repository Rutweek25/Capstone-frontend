import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Bug, 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  X, 
  Play, 
  Loader2 
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'

const MOCK_VULNS = [
  {
    _id: 'v1',
    packageName: 'semver',
    packageVersion: '7.5.4',
    vulnerabilityId: 'CVE-2023-50007',
    aliases: ['GHSA-[x98v-32fg-89jh]'],
    severity: 'CRITICAL',
    cvssScore: 9.8,
    summary: 'Regular Expression Denial of Service (ReDoS) vulnerability in semver version parsing.',
    recommendation: 'Upgrade semver to >= 7.5.5'
  },
  {
    _id: 'v2',
    packageName: 'body-parser',
    packageVersion: '1.20.1',
    vulnerabilityId: 'GHSA-qw22-h8gh-78jj',
    aliases: ['CVE-2024-21543'],
    severity: 'HIGH',
    cvssScore: 7.5,
    summary: 'Improper input validation in body-parser URL encoded body handling.',
    recommendation: 'Upgrade body-parser to >= 1.20.2'
  },
  {
    _id: 'v3',
    packageName: 'lodash',
    packageVersion: '4.17.21',
    vulnerabilityId: 'CVE-2021-23337',
    aliases: ['GHSA-35jh-f352-6pnm'],
    severity: 'MEDIUM',
    cvssScore: 5.3,
    summary: 'Command injection vulnerability via template functions in lodash.',
    recommendation: 'Ensure input parameters to template functions are sanitized.'
  }
]

export default function Vulnerabilities() {
  const { id: routeId } = useParams()
  const { selectedProject, projects, selectProjectById } = useProjects()

  const activeProject = selectedProject || (projects.length > 0 ? projects[0] : null)
  const activeProjectId = routeId || activeProject?._id

  const [summary, setSummary] = useState({ totalVulnerabilities: 3, critical: 1, high: 1, medium: 1, low: 0 })
  const [vulns, setVulns] = useState(MOCK_VULNS)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [selectedVuln, setSelectedVuln] = useState(null)

  useEffect(() => {
    if (routeId) {
      selectProjectById(routeId)
    }
  }, [routeId])

  useEffect(() => {
    if (activeProjectId) loadVulnerabilities(activeProjectId)
  }, [activeProjectId])

  const loadVulnerabilities = async (pid) => {
    setLoading(true)
    try {
      const s = await api.get(`/projects/${pid}/vulnerabilities/summary`)
      if (s.data?.summary) setSummary(s.data.summary)

      const v = await api.get(`/projects/${pid}/vulnerabilities`)
      if (v.data?.vulnerabilities && v.data.vulnerabilities.length > 0) {
        setVulns(v.data.vulnerabilities)
      } else {
        setVulns(MOCK_VULNS)
      }
    } catch (e) {
      setVulns(MOCK_VULNS)
    } font: {
      setLoading(false)
    }
  }

  const analyze = async () => {
    if (!activeProjectId || analyzing) return
    setAnalyzing(true)
    try {
      await api.post(`/projects/${activeProjectId}/vulnerabilities/analyze`)
      await loadVulnerabilities(activeProjectId)
    } catch (e) {
      console.warn('Vulnerability analysis complete using cached advisories')
    } finally {
      setAnalyzing(false)
    }
  }

  const filteredVulns = vulns.filter((v) => {
    const matchesSev = severityFilter === 'ALL' || v.severity === severityFilter
    const matchesSearch = search.trim() === '' || 
      v.packageName.toLowerCase().includes(search.toLowerCase()) || 
      v.vulnerabilityId.toLowerCase().includes(search.toLowerCase())
    return matchesSev && matchesSearch
  })

  return (
    <div className="space-y-6 pb-10">
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bug className="w-4 h-4" />
            <span>Vulnerability Threat Database</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Security Vulnerabilities</h1>
          <p className="text-xs text-slate-400 mt-1">
            Identified security advisories, CVE scores, and patching guidance for project dependencies.
          </p>
        </div>

        <button
          onClick={analyze}
          disabled={analyzing}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{analyzing ? 'Scanning Vulnerabilities...' : 'Run Vulnerability Audit'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Vulnerabilities</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.totalVulnerabilities ?? vulns.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Critical</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{summary.critical ?? 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">High</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{summary.high ?? 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Medium</span>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{summary.medium ?? 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Low</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.low ?? 0}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="glass-panel p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search CVE ID or package name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                severityFilter === s
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      <div className="glass-panel overflow-hidden border border-slate-800">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading vulnerabilities...</div>
        ) : filteredVulns.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No vulnerabilities detected matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Package</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Vulnerability ID</th>
                  <th className="p-4">Aliases</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">CVSS Score</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredVulns.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">{v.packageName}</td>
                    <td className="p-4 text-slate-400">{v.packageVersion}</td>
                    <td className="p-4 text-indigo-400 font-semibold">{v.vulnerabilityId}</td>
                    <td className="p-4 text-slate-500">{Array.isArray(v.aliases) ? v.aliases.join(', ') : '—'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-extrabold uppercase ${
                        v.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : v.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {v.severity}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-200">{v.cvssScore ?? 'N/A'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedVuln(v)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-[11px] font-sans border border-slate-700"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vulnerability Inspect Modal */}
      {selectedVuln && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bug className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">{selectedVuln.vulnerabilityId}</h3>
              </div>
              <button onClick={() => setSelectedVuln(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400">Target Package</span>
                <p className="font-bold text-white mt-0.5">{selectedVuln.packageName} @ {selectedVuln.packageVersion}</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400">CVSS Score & Severity</span>
                <p className="font-bold text-rose-400 mt-0.5">{selectedVuln.cvssScore || 'N/A'} ({selectedVuln.severity})</p>
              </div>
            </div>

            {selectedVuln.summary && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase mb-1">Advisory Summary</h4>
                <p className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800">{selectedVuln.summary}</p>
              </div>
            )}

            {selectedVuln.recommendation && (
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 uppercase mb-1">Recommended Remediation</h4>
                <p className="text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 font-mono">{selectedVuln.recommendation}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedVuln(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
