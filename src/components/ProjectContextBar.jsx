import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderGit2, ShieldCheck, AlertTriangle, AlertOctagon, ArrowUpRight, ChevronDown, FileArchive, ExternalLink } from 'lucide-react'
import GithubIcon from './GithubIcon'
import { useProjects } from '../context/ProjectContext'

export default function ProjectContextBar({ activeTab }) {
  const { selectedProject, projects, selectProjectById } = useProjects()
  const navigate = useNavigate()

  if (!selectedProject) {
    return (
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-saas-xs flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-[#667085]">
          <FolderGit2 className="w-4 h-4 text-[#98A2B3]" />
          <span>No project selected. Choose a project from the fleet portfolio.</span>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="btn-primary text-xs"
        >
          View Projects
        </button>
      </div>
    )
  }

  const p = selectedProject
  const projectName = p.projectName || p.name || 'Unnamed Project'
  const version = p.projectVersion || '1.0.0'
  const ecosystem = p.ecosystem || 'npm'
  
  const lastScanned = p.analyzedAt 
    ? new Date(p.analyzedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Pending Analysis'

  const riskScore = p.averageRiskScore ?? 0
  const riskLevel = p.riskLevel || (riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW')
  
  const policyStatus = (p.policyStatus || 'PASS').toUpperCase()
  const isFail = policyStatus === 'FAIL' || policyStatus === 'FAILED'
  const isReview = policyStatus === 'REVIEW'

  const depCount = p.dependencyCounts?.dependencies || p.dependencyCounts?.total || p.totalDependencies || 0

  const handleProjectSwitch = (newId) => {
    selectProjectById(newId)
    if (activeTab) {
      navigate(`/projects/${newId}/${activeTab}`)
    } else {
      navigate(`/projects/${newId}`)
    }
  }

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-2xl px-5 py-3.5 shadow-saas-xs flex flex-wrap items-center justify-between gap-4">
      {/* Left: Dominant Project Identity */}
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#E4E7EC] flex items-center justify-center text-[#101828] flex-shrink-0">
          <FolderGit2 className="w-5 h-5 text-blue-600" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold text-[#98A2B3] uppercase tracking-wider">PROJECT</span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-mono text-[#667085] font-semibold">{ecosystem}</span>
          </div>
          <div className="flex items-center space-x-2.5 mt-0.5">
            <h2 
              onClick={() => navigate('/projects')}
              className="text-base font-extrabold text-[#101828] tracking-tight hover:text-blue-600 cursor-pointer transition-colors"
            >
              {projectName}
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-[#F2F4F7] text-[#344054] font-mono text-[11px] font-medium border border-[#EAECF0]">
              v{version}
            </span>
            {p.sourceType === 'github' ? (
              <a 
                href={p.github?.repositoryUrl ? `${p.github.repositoryUrl}/commit/${p.github?.commitSha}` : '#'}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#111318] text-white font-mono text-[10px] hover:bg-slate-800 transition-colors"
                title={`GitHub: ${p.github?.owner}/${p.github?.name} (${p.github?.branch})`}
              >
                <GithubIcon className="w-2.5 h-2.5" />
                <span>{p.github?.branch || 'main'}@{p.github?.commitSha ? p.github.commitSha.slice(0, 7) : 'head'}</span>
                <ExternalLink className="w-2 h-2 text-slate-400" />
              </a>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200">
                <FileArchive className="w-2.5 h-2.5 text-slate-400" />
                <span>ZIP Upload</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Structured Telemetry Indicators */}
      <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-xs text-[#667085]">
        {/* Policy Status */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#98A2B3]">Policy Verdict</span>
          <div className="mt-0.5">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              isFail
                ? 'saas-badge-fail'
                : isReview
                ? 'saas-badge-review'
                : 'saas-badge-pass'
            }`}>
              {isFail ? (
                <AlertOctagon className="w-3 h-3 mr-1" />
              ) : isReview ? (
                <AlertTriangle className="w-3 h-3 mr-1" />
              ) : (
                <ShieldCheck className="w-3 h-3 mr-1" />
              )}
              {policyStatus}
            </span>
          </div>
        </div>

        {/* Risk Score */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#98A2B3]">Composite Risk</span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="font-extrabold text-[#101828] font-mono">{riskScore}</span>
            <span className="text-[10px] text-[#98A2B3]">/100</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
              riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
                ? 'text-rose-700 bg-rose-50 border border-rose-200'
                : riskLevel === 'MEDIUM'
                ? 'text-amber-700 bg-amber-50 border border-amber-200'
                : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
            }`}>
              {riskLevel}
            </span>
          </div>
        </div>

        {/* Dependencies */}
        <div className="hidden sm:flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#98A2B3]">Dependencies</span>
          <span className="font-mono text-[#101828] font-semibold mt-0.5">
            {depCount} pkgs
          </span>
        </div>

        {/* Last Scanned */}
        <div className="hidden md:flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#98A2B3]">Last Scanned</span>
          <span className="font-medium text-[#101828] mt-0.5">{lastScanned}</span>
        </div>
      </div>

      {/* Right: Quick Switcher */}
      <div className="flex items-center space-x-2">
        <select
          value={p._id}
          onChange={(e) => handleProjectSwitch(e.target.value)}
          className="bg-white border border-[#D0D5DD] hover:border-[#98A2B3] text-xs text-[#101828] font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-saas-xs"
        >
          {projects.map((proj) => (
            <option key={proj._id} value={proj._id}>
              Switch: {proj.projectName || proj.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => navigate('/projects')}
          className="p-1.5 rounded-xl border border-[#D0D5DD] hover:bg-slate-50 text-[#344054] transition-colors shadow-saas-xs"
          title="Open Projects Fleet"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
