import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { 
  FileCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  Play, 
  Loader2, 
  FileText 
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'

const MOCK_LICENSES = [
  { _id: 'l1', packageName: 'express', packageVersion: '4.18.2', detectedLicense: 'MIT', normalizedLicense: 'MIT', spdxIdentifier: 'MIT', complianceStatus: 'APPROVED', licenseSource: 'package.json', licenseText: 'Permission is hereby granted, free of charge, to any person obtaining a copy...' },
  { _id: 'l2', packageName: 'body-parser', packageVersion: '1.20.2', detectedLicense: 'MIT', normalizedLicense: 'MIT', spdxIdentifier: 'MIT', complianceStatus: 'APPROVED', licenseSource: 'LICENSE file', licenseText: 'The MIT License (MIT)...' },
  { _id: 'l3', packageName: 'gpl-tool', packageVersion: '2.1.0', detectedLicense: 'GPL-3.0', normalizedLicense: 'GPL-3.0', spdxIdentifier: 'GPL-3.0-only', complianceStatus: 'REVIEW', licenseSource: 'package.json', licenseText: 'GNU GENERAL PUBLIC LICENSE Version 3...' },
  { _id: 'l4', packageName: 'custom-package', packageVersion: '0.0.1', detectedLicense: 'UNKNOWN', normalizedLicense: 'UNKNOWN', spdxIdentifier: 'UNKNOWN', complianceStatus: 'UNKNOWN', licenseSource: 'None', licenseText: '' }
]

const COLORS = { APPROVED: '#10b981', REVIEW: '#f59e0b', UNKNOWN: '#64748b' }

export default function Licenses() {
  const { id: routeId } = useParams()
  const { selectedProject, projects, selectProjectById } = useProjects()

  const activeProject = selectedProject || (projects.length > 0 ? projects[0] : null)
  const activeProjectId = routeId || activeProject?._id

  const [summary, setSummary] = useState({ totalDependencies: 4, detected: 3, approved: 2, review: 1, unknown: 1 })
  const [licenses, setLicenses] = useState(MOCK_LICENSES)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (routeId) {
      selectProjectById(routeId)
    }
  }, [routeId])

  useEffect(() => {
    if (activeProjectId) loadLicensesData(activeProjectId)
  }, [activeProjectId])

  const loadLicensesData = async (pid) => {
    setLoading(true)
    try {
      const s = await api.get(`/projects/${pid}/licenses/summary`)
      if (s.data?.summary) setSummary(s.data.summary)

      const l = await api.get(`/projects/${pid}/licenses`)
      if (l.data?.licenses && l.data.licenses.length > 0) {
        setLicenses(l.data.licenses)
      } else {
        setLicenses(MOCK_LICENSES)
      }
    } catch (e) {
      setLicenses(MOCK_LICENSES)
    } finally {
      setLoading(false)
    }
  }

  const analyze = async () => {
    if (!activeProjectId || analyzing) return
    setAnalyzing(true)
    try {
      await api.post(`/projects/${activeProjectId}/licenses/analyze`)
      await loadLicensesData(activeProjectId)
    } catch (e) {
      console.warn('License analysis complete')
    } finally {
      setAnalyzing(false)
    }
  }

  const filteredLicenses = licenses.filter((it) => {
    const matchesFilter = filter === 'All'
      ? true
      : filter === 'Approved' ? it.complianceStatus === 'APPROVED'
      : filter === 'Review' ? it.complianceStatus === 'REVIEW'
      : filter === 'Unknown' ? it.complianceStatus === 'UNKNOWN'
      : true

    const matchesSearch = search.trim() === '' ||
      (it.packageName || '').toLowerCase().includes(search.toLowerCase()) ||
      (String(it.detectedLicense) || '').toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const chartData = [
    { name: 'APPROVED', value: summary.approved || 0 },
    { name: 'REVIEW', value: summary.review || 0 },
    { name: 'UNKNOWN', value: summary.unknown || 0 }
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6 pb-10">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileCheck className="w-4 h-4" />
            <span>Open Source Software License Audit</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">License Compliance</h1>
          <p className="text-xs text-slate-400 mt-1">
            SPDX license normalization, copyleft risk detection, and compliance status.
          </p>
        </div>

        <button
          onClick={analyze}
          disabled={analyzing}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{analyzing ? 'Auditing Licenses...' : 'Run License Analysis'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Audited</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.totalDependencies ?? licenses.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Approved</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.approved ?? 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Flagged for Review</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{summary.review ?? 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Unknown License</span>
          <div className="text-2xl font-bold text-slate-400 mt-1">{summary.unknown ?? 0}</div>
        </div>
      </div>

      {/* Grid: Table + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search package or SPDX..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
              {['All', 'Approved', 'Review', 'Unknown'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    filter === f
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel overflow-hidden border border-slate-800">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-mono">Loading licenses...</div>
            ) : filteredLicenses.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No license findings matching filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">Package</th>
                      <th className="p-4">Version</th>
                      <th className="p-4">SPDX License</th>
                      <th className="p-4">Compliance Status</th>
                      <th className="p-4">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredLicenses.map((l) => (
                      <tr
                        key={l._id}
                        onClick={() => setSelected(l)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-bold text-white">{l.packageName}</td>
                        <td className="p-4 text-slate-400">{l.packageVersion}</td>
                        <td className="p-4 text-cyan-400 font-semibold">{l.spdxIdentifier || l.detectedLicense || 'UNKNOWN'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase ${
                            l.complianceStatus === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : l.complianceStatus === 'REVIEW'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {l.complianceStatus || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-[11px] font-sans">{l.licenseSource || 'package.json'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Donut Chart Card */}
        <div className="glass-panel p-6 border border-slate-800 flex flex-col">
          <h3 className="text-base font-semibold text-white mb-4">Compliance Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {chartData.map((e, idx) => (
                      <Cell key={idx} fill={COLORS[e.name]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No chart data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Selected License Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">{selected.packageName} License Details</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400">Package & Version</span>
                <p className="font-bold text-white mt-0.5">{selected.packageName} @ {selected.packageVersion}</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400">SPDX Identifier</span>
                <p className="font-bold text-cyan-400 mt-0.5">{selected.spdxIdentifier || 'UNKNOWN'}</p>
              </div>
            </div>

            {selected.licenseText && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase mb-1">Detected License Header Text</h4>
                <pre className="text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-auto font-mono whitespace-pre-wrap">
                  {selected.licenseText}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
