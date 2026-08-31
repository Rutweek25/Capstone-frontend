import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts'
import { 
  ShieldAlert, 
  FolderKanban, 
  Layers, 
  Bug, 
  FileCheck, 
  AlertTriangle, 
  FileCode2, 
  Zap, 
  UploadCloud, 
  GitFork,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Lightbulb,
  FileCheck2
} from 'lucide-react'
import { useProjects } from '../context/ProjectContext'

const SEVERITY_COLORS = {
  Critical: '#f43f5e',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#10b981'
}

const LICENSE_COLORS = {
  Approved: '#10b981',
  Review: '#f59e0b',
  Unknown: '#64748b'
}

export default function Dashboard() {
  const { projects, selectedProject, setSelectedProject, loading, isDemoMode } = useProjects()

  const pid = selectedProject?._id || (projects[0] ? projects[0]._id : 'demo-proj-001')

  const totalProjects = projects.length
  const totalDeps = projects.reduce((acc, p) => acc + (p.dependencyCounts?.dependencies || p.dependencyCounts?.total || 0), 0)
  const totalVulns = projects.reduce((acc, p) => acc + (p.vulnerabilities?.total || 0), 0)
  const totalCriticalVulns = projects.reduce((acc, p) => acc + (p.vulnerabilities?.critical || 0), 0)
  
  const totalApprovedLicenses = projects.reduce((acc, p) => acc + (p.approvedLicenses || 0), 0)
  const totalReviewLicenses = projects.reduce((acc, p) => acc + (p.reviewLicenses || 0), 0)
  const totalUnknownLicenses = projects.reduce((acc, p) => acc + (p.unknownLicenses || 0), 0)

  const avgRisk = totalProjects > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.averageRiskScore || 0), 0) / totalProjects) 
    : 0

  const vulnChartData = [
    { name: 'Critical', count: projects.reduce((acc, p) => acc + (p.vulnerabilities?.critical || 0), 0) },
    { name: 'High', count: projects.reduce((acc, p) => acc + (p.vulnerabilities?.high || 0), 0) },
    { name: 'Medium', count: projects.reduce((acc, p) => acc + (p.vulnerabilities?.medium || 0), 0) },
    { name: 'Low', count: projects.reduce((acc, p) => acc + (p.vulnerabilities?.low || 0), 0) },
  ]

  const licenseChartData = [
    { name: 'Approved', value: totalApprovedLicenses },
    { name: 'Review', value: totalReviewLicenses },
    { name: 'Unknown', value: totalUnknownLicenses },
  ].filter(d => d.value > 0)

  const riskChartData = [
    { name: 'Critical (≥90)', value: projects.filter(p => (p.averageRiskScore || 0) >= 90).length, fill: '#f43f5e' },
    { name: 'High (70-89)', value: projects.filter(p => (p.averageRiskScore || 0) >= 70 && (p.averageRiskScore || 0) < 90).length, fill: '#f97316' },
    { name: 'Medium (40-69)', value: projects.filter(p => (p.averageRiskScore || 0) >= 40 && (p.averageRiskScore || 0) < 70).length, fill: '#eab308' },
    { name: 'Low (<40)', value: projects.filter(p => (p.averageRiskScore || 0) < 40).length, fill: '#10b981' },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Security Hub Phase 8</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                Decision-Support Active
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Software Dependency <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">Security Dashboard</span>
            </h1>
            
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Real-time software bill of materials (SBOM) scanning, open-source SPDX license audit, vulnerability detection, remediation guidance, and compliance enforcement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <Link
              to={`/projects/${pid}/recommendations`}
              className="px-5 py-3 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-bold text-xs shadow-lg transition-all flex items-center space-x-2"
            >
              <Lightbulb className="w-4 h-4 text-indigo-400" />
              <span>Recommendations</span>
            </Link>

            <Link
              to={`/projects/${pid}/report`}
              className="px-5 py-3 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 font-bold text-xs shadow-lg transition-all flex items-center space-x-2"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Final Report</span>
            </Link>

            <Link
              to="/upload"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-cyan-500 to-teal-400 hover:from-indigo-500 hover:to-cyan-300 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 transition-all flex items-center space-x-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload & Scan ZIP</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monitored Projects</span>
            <div className="p-3 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-4xl font-black text-white">{totalProjects}</span>
            <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Active Scans
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{isDemoMode ? 'Interactive Demo Mode' : 'Connected Repositories'}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dependencies</span>
            <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-4xl font-black text-white">{totalDeps}</span>
            <span className="text-xs text-cyan-400 font-bold">Packages</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Direct & transitive trees</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vulnerabilities</span>
            <div className="p-3 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30">
              <Bug className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-4xl font-black text-white">{totalVulns}</span>
            {totalCriticalVulns > 0 && (
              <span className="text-xs text-rose-400 font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 badge-glow-rose">
                {totalCriticalVulns} Critical
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">CVE & OSV database advisories</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Risk Score</span>
            <div className="p-3 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-4xl font-black text-white">{avgRisk}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Weighted CVSS & license rating</p>
        </motion.div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <Bug className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Vulnerability Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">CVE Advisories</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vulnChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {vulnChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">License Compliance</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">SPDX Normalization</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {licenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={licenseChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {licenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={LICENSE_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No license data</p>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Risk Rating Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Risk Rating</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {riskChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No risk rating data</p>
            )}
          </div>
        </div>
      </div>

      {/* Projects Inventory */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Analyzed Project Portfolio</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select a project portfolio to inspect security, licenses, recommendations, and report</p>
          </div>
          <Link to="/upload" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1">
            <span>+ Upload project</span>
          </Link>
        </div>

        {loading ? (
          <div className="glass-panel p-12 text-center text-slate-400">Loading workspace projects...</div>
        ) : projects.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
            <FolderKanban className="w-12 h-12 text-indigo-400 mx-auto" />
            <p className="text-lg font-bold text-white">No projects analyzed yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Upload a project ZIP file to scan dependencies and generate SBOM</p>
            <Link to="/upload" className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20">
              Upload Project ZIP
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => {
              const isSelected = selectedProject?._id === p._id
              return (
                <div
                  key={p._id}
                  className={`glass-panel p-6 border transition-all duration-300 flex flex-col justify-between ${
                    isSelected ? 'border-indigo-500/80 shadow-2xl shadow-indigo-500/15 bg-indigo-950/30' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-indigo-300 uppercase tracking-wider border border-slate-700">
                          {p.ecosystem || 'npm'}
                        </span>
                        <h3 className="text-xl font-bold text-white mt-1.5">
                          {p.projectName || p.name}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        (p.averageRiskScore || 0) >= 90
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 badge-glow-rose'
                          : (p.averageRiskScore || 0) >= 70
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 badge-glow-amber'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 badge-glow-emerald'
                      }`}>
                        Score {p.averageRiskScore ?? 0}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      v{p.projectVersion || '1.0.0'} • Analyzed {p.analyzedAt ? new Date(p.analyzedAt).toLocaleDateString() : 'Recently'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-slate-800 text-center">
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Dependencies</div>
                        <div className="text-base font-black text-cyan-400 mt-0.5">
                          {p.dependencyCounts?.dependencies ?? p.dependencyCounts?.total ?? 0}
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Approved Lic</div>
                        <div className="text-base font-black text-emerald-400 mt-0.5">
                          {p.approvedLicenses ?? 0}
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">SBOM Status</div>
                        <div className={`text-xs font-bold mt-1 ${p.sbomStatus === 'STALE' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {p.sbomStatus || 'VALID'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedProject(p)}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20' 
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? 'Active Project' : 'Select Project'}
                    </button>

                    <div className="flex items-center space-x-1">
                      <Link
                        to={`/projects/${p._id}/recommendations`}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 text-slate-400 hover:text-indigo-300 transition-colors border border-slate-700/50"
                        title="Remediation Recommendations"
                      >
                        <Lightbulb className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/projects/${p._id}/report`}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-600/30 text-slate-400 hover:text-emerald-300 transition-colors border border-slate-700/50"
                        title="Compliance Report"
                      >
                        <FileCheck2 className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/projects/${p._id}/vulnerabilities`}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 transition-colors border border-slate-700/50"
                        title="View Vulnerabilities"
                      >
                        <Bug className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/projects/${p._id}/sbom`}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-teal-600/30 text-slate-400 hover:text-teal-300 transition-colors border border-slate-700/50"
                        title="View SBOM"
                      >
                        <FileCode2 className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
