import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FolderKanban, 
  Search, 
  UploadCloud, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Layers, 
  Bug, 
  ExternalLink,
  Activity,
  FileArchive,
  Plus
} from 'lucide-react'
import GithubIcon from '../components/GithubIcon'
import { useProjects } from '../context/ProjectContext'

export default function Projects() {
  const { projects, selectedProject, selectProjectById, setSelectedProject } = useProjects()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const navigate = useNavigate()

  const handleOpenProject = (project) => {
    selectProjectById(project._id)
    navigate(`/projects/${project._id}/dependencies`)
  }

  const handleViewOverview = (project) => {
    selectProjectById(project._id)
    navigate(`/`)
  }

  // Aggregate Metrics strictly from database projects
  const totalProjects = projects.length
  const totalDeps = projects.reduce((acc, p) => acc + (p.dependencyCounts?.dependencies || p.dependencyCounts?.total || p.totalDependencies || 0), 0)
  const totalCriticalVulns = projects.reduce((acc, p) => acc + (p.criticalRiskCount ?? p.vulnerabilities?.critical ?? 0), 0)
  const avgRisk = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.averageRiskScore || 0), 0) / totalProjects)
    : 0

  const filtered = projects.filter((p) => {
    const nameMatch = (p.projectName || p.name || '').toLowerCase().includes(search.toLowerCase())
    if (!nameMatch) return false

    const status = (p.policyStatus || p.complianceStatus || 'PASS').toUpperCase()
    if (filterStatus === 'SAFE') return status.includes('PASS') || status.includes('COMPLIANT')
    if (filterStatus === 'REVIEW') return status.includes('REVIEW')
    if (filterStatus === 'FAIL') return status.includes('FAIL') || status.includes('NON_COMPLIANT')
    return true
  })

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Editorial Hero Section */}
      <div className="hero-surface radial-glow p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
              <FolderKanban className="w-4 h-4" />
              <span>Fleet Governance Inventory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              Projects Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
              Centrally manage monitored software repositories, inspect isolated dependency inventories, and enforce corporate compliance gating.
            </p>

            <div className="flex items-center flex-wrap gap-3 pt-2 text-xs text-[#667085]">
              <span>Fleet Count: <strong className="text-[#101828] font-mono">{totalProjects} repositories</strong></span>
              <span className="text-slate-300">•</span>
              <span>Average Risk: <strong className="text-[#101828] font-mono">{avgRisk}/100</strong></span>
            </div>
          </div>

          <button
            onClick={() => navigate('/upload')}
            className="btn-primary text-xs self-start lg:self-auto flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* 2. Aggregate KPI Fleet Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Monitored Projects</span>
          <div className="text-3xl font-black text-[#101828] mt-2">{totalProjects}</div>
          <p className="text-[11px] text-[#667085] mt-1">Active dependency scopes</p>
        </div>

        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Total Dependencies</span>
          <div className="text-3xl font-black text-[#101828] mt-2 font-mono">{totalDeps}</div>
          <p className="text-[11px] text-[#667085] mt-1">Direct & transitive packages</p>
        </div>

        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Critical Advisories</span>
          <div className="text-3xl font-black text-rose-600 mt-2 font-mono">{totalCriticalVulns}</div>
          <p className="text-[11px] text-[#667085] mt-1">Fleet-wide critical CVEs</p>
        </div>

        <div className="saas-card p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Fleet Average Risk</span>
          <div className="text-3xl font-black text-[#101828] mt-2 font-mono">{avgRisk} <span className="text-xs font-normal text-[#98A2B3]">/ 100</span></div>
          <p className="text-[11px] text-[#667085] mt-1">Cross-project baseline</p>
        </div>
      </div>

      {/* 3. Filter Controls & Projects Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#D0D5DD] rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-saas-xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            {[
              { id: 'ALL', label: 'All Projects' },
              { id: 'SAFE', label: 'Compliant' },
              { id: 'REVIEW', label: 'Under Review' },
              { id: 'FAIL', label: 'Flagged' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === tab.id
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Table */}
        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Source</th>
                  <th>Ecosystem</th>
                  <th>Dependencies</th>
                  <th>Vulnerabilities</th>
                  <th>Risk Score</th>
                  <th>Policy Verdict</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((proj) => {
                  const isSelected = selectedProject?._id === proj._id
                  const risk = proj.averageRiskScore ?? 0
                  const status = (proj.policyStatus || proj.complianceStatus || 'PASS').toUpperCase()
                  const isFail = status === 'FAIL' || status === 'FAILED' || status === 'NON_COMPLIANT'
                  const isReview = status === 'REVIEW' || status === 'REVIEW_REQUIRED'
                  const deps = proj.dependencyCounts?.dependencies || proj.dependencyCounts?.total || proj.totalDependencies || 0
                  const vulnCount = proj.criticalRiskCount !== undefined 
                    ? ((proj.criticalRiskCount || 0) + (proj.highRiskCount || 0) + (proj.mediumRiskCount || 0) + (proj.lowRiskCount || 0))
                    : (proj.vulnerabilities?.total || 0)

                  return (
                    <tr 
                      key={proj._id}
                      className={isSelected ? 'bg-blue-50/30' : ''}
                    >
                      <td>
                        <div className="flex items-center space-x-2.5">
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-[#101828] text-xs hover:text-blue-600 cursor-pointer" onClick={() => handleViewOverview(proj)}>
                                {proj.projectName || proj.name}
                              </span>
                              {isSelected && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[11px] text-[#667085]">
                              v{proj.projectVersion || '1.0.0'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {proj.sourceType === 'github' ? (
                          <div className="flex flex-col space-y-0.5">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#111318] text-white w-fit font-bold">
                              <GithubIcon className="w-2.5 h-2.5" />
                              <span>GitHub</span>
                            </span>
                            <span className="text-[10px] font-mono text-[#667085] truncate max-w-[130px]" title={proj.github?.commitSha}>
                              {proj.github?.branch || 'main'} @ {proj.github?.commitSha ? proj.github.commitSha.slice(0, 7) : 'head'}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 w-fit font-semibold">
                            <FileArchive className="w-2.5 h-2.5 text-slate-500" />
                            <span>ZIP</span>
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="font-mono text-xs text-[#667085]">
                          {proj.ecosystem || 'npm'}
                        </span>
                      </td>

                      <td>
                        <span className="font-mono text-xs font-semibold text-[#101828]">
                          {deps} packages
                        </span>
                      </td>

                      <td>
                        <div className="flex items-center space-x-1.5 text-xs font-mono">
                          {proj.criticalRiskCount > 0 ? (
                            <span className="text-rose-600 font-extrabold">{proj.criticalRiskCount} critical</span>
                          ) : (
                            <span className="text-[#667085]">{vulnCount} total</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-xs font-black text-[#101828]">
                            {risk}
                          </span>
                          <span className="text-[10px] text-[#98A2B3]">/100</span>
                        </div>
                      </td>

                      <td>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isFail
                            ? 'saas-badge-fail'
                            : isReview
                            ? 'saas-badge-review'
                            : 'saas-badge-pass'
                        }`}>
                          {isFail ? <AlertOctagon className="w-3 h-3 mr-1" /> : isReview ? <AlertTriangle className="w-3 h-3 mr-1" /> : <ShieldCheck className="w-3 h-3 mr-1" />}
                          {isFail ? 'FAIL' : isReview ? 'REVIEW' : 'PASS'}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewOverview(proj)}
                            className="btn-secondary text-[11px] py-1 px-2.5"
                          >
                            Overview
                          </button>
                          <button
                            onClick={() => handleOpenProject(proj)}
                            className="btn-primary text-[11px] py-1 px-2.5"
                          >
                            Open Tree
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
