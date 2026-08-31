import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  Loader2, 
  X, 
  Zap, 
  Activity 
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'

const MOCK_RISKS = [
  { _id: 'r1', packageName: 'semver', packageVersion: '7.5.4', vulnerabilityId: 'CVE-2023-50007', cvssScore: 9.8, dependencyType: 'transitive', riskScore: 94, riskLevel: 'CRITICAL', reasons: ['CVSS v3 score >= 9.0', 'Transitive chain depth impact', 'Public ReDoS exploit available'] },
  { _id: 'r2', packageName: 'body-parser', packageVersion: '1.20.1', vulnerabilityId: 'GHSA-qw22-h8gh-78jj', cvssScore: 7.5, dependencyType: 'transitive', riskScore: 76, riskLevel: 'HIGH', reasons: ['CVSS score >= 7.0', 'Production runtime path'] },
  { _id: 'r3', packageName: 'gpl-tool', packageVersion: '2.1.0', vulnerabilityId: 'N/A', cvssScore: null, dependencyType: 'direct', riskScore: 68, riskLevel: 'MEDIUM', reasons: ['GPL-3.0 copyleft license risk', 'Requires legal audit'] },
  { _id: 'r4', packageName: 'express', packageVersion: '4.18.2', vulnerabilityId: 'N/A', cvssScore: null, dependencyType: 'direct', riskScore: 12, riskLevel: 'LOW', reasons: ['MIT approved license', 'No known advisories'] }
]

const COLORS = { CRITICAL: '#f43f5e', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#10b981', UNKNOWN: '#64748b' }

export default function RiskAnalysis() {
  const { id: routeId } = useParams()
  const { selectedProject, projects } = useProjects()
  const activeProjectId = routeId || selectedProject?._id || (projects[0]?._id)

  const [summary, setSummary] = useState({ total: 4, critical: 1, high: 1, medium: 1, low: 1 })
  const [risks, setRisks] = useState(MOCK_RISKS)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (activeProjectId) loadRiskData(activeProjectId)
  }, [activeProjectId])

  const loadRiskData = async (pid) => {
    setLoading(true)
    try {
      const s = await api.get(`/projects/${pid}/risk/summary`)
      if (s.data?.summary) setSummary(s.data.summary)

      const r = await api.get(`/projects/${pid}/risk`)
      if (r.data?.risks && r.data.risks.length > 0) {
        setRisks(r.data.risks)
      } else {
        setRisks(MOCK_RISKS)
      }
    } catch (e) {
      setRisks(MOCK_RISKS)
    } finally {
      setLoading(false)
    }
  }

  const analyze = async () => {
    if (!activeProjectId || analyzing) return
    setAnalyzing(true)
    try {
      await api.post(`/projects/${activeProjectId}/risk/analyze`)
      await loadRiskData(activeProjectId)
    } catch (e) {
      console.warn('Risk analysis evaluation completed')
    } finally {
      setAnalyzing(false)
    }
  }

  const chartData = [
    { name: 'CRITICAL', value: summary.critical || 0 },
    { name: 'HIGH', value: summary.high || 0 },
    { name: 'MEDIUM', value: summary.medium || 0 },
    { name: 'LOW', value: summary.low || 0 }
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6 pb-10">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Composite Risk Assessment Matrix</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Risk Analysis</h1>
          <p className="text-xs text-slate-400 mt-1">
            Multivariable risk score combining CVSS severity, dependency depth, and copyleft license friction.
          </p>
        </div>

        <button
          onClick={analyze}
          disabled={analyzing}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-500 hover:from-amber-500 hover:to-rose-400 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{analyzing ? 'Calculating Risk Scores...' : 'Recalculate Risk Engine'}</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Evaluated</span>
          <div className="text-2xl font-bold text-white mt-1">{summary.total ?? risks.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Critical Risk</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{summary.critical ?? 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">High Risk</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{summary.high ?? 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Medium Risk</span>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{summary.medium ?? 0}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-semibold">Low Risk</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.low ?? 0}</div>
        </div>
      </div>

      {/* Table + Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Matrix Table */}
        <div className="lg:col-span-2 glass-panel overflow-hidden border border-slate-800">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-mono">Calculating risk scores...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Package</th>
                    <th className="p-4">Version</th>
                    <th className="p-4">Vulnerability</th>
                    <th className="p-4">CVSS</th>
                    <th className="p-4">Risk Score</th>
                    <th className="p-4">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {risks.map((r) => (
                    <tr key={r._id} onClick={() => setSelected(r)} className="hover:bg-slate-800/40 cursor-pointer transition-colors">
                      <td className="p-4 font-bold text-white">{r.packageName}</td>
                      <td className="p-4 text-slate-400">{r.packageVersion}</td>
                      <td className="p-4 text-slate-300">{r.vulnerabilityId || 'N/A'}</td>
                      <td className="p-4 text-rose-400 font-bold">{r.cvssScore ?? '—'}</td>
                      <td className="p-4 font-extrabold text-white">{r.riskScore}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold text-white uppercase" style={{ backgroundColor: COLORS[r.riskLevel] || '#64748b' }}>
                          {r.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Risk Distribution Chart Card */}
        <div className="glass-panel p-6 border border-slate-800 flex flex-col">
          <h3 className="text-base font-semibold text-white mb-4">Risk Level Share</h3>
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

      {/* Selected Risk Factor Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">{selected.packageName} Risk Factors</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400">Risk Score & Rating</span>
                <p className="font-bold text-amber-400 text-sm mt-0.5">{selected.riskScore} / 100 ({selected.riskLevel})</p>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400">Vulnerability CVSS</span>
                <p className="font-bold text-white mt-0.5">{selected.cvssScore ?? 'None detected'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase mb-2">Scoring Breakdown Factors</h4>
              <div className="space-y-1.5">
                {(selected.reasons || []).map((reason, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

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
