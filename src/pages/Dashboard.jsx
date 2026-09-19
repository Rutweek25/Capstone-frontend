import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts'
import { 
  ShieldCheck, 
  Layers, 
  Bug, 
  FileCheck, 
  Scale, 
  FileCode2, 
  UploadCloud, 
  GitFork,
  ArrowRight,
  Lightbulb,
  FileCheck2,
  AlertOctagon,
  Clock,
  Activity,
  CheckSquare
} from 'lucide-react'
import { useProjects } from '../context/ProjectContext'
import ProjectContextBar from '../components/ProjectContextBar'

const SEVERITY_COLORS = {
  Critical: '#D92D20',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#059669'
}

const LICENSE_COLORS = {
  Approved: '#059669',
  Review: '#D97706',
  Unknown: '#667085'
}

export default function Dashboard() {
  const { id: routeId } = useParams()
  const { projects, selectedProject, selectProjectById } = useProjects()

  useEffect(() => {
    if (routeId) {
      selectProjectById(routeId)
    }
  }, [routeId])

  const p = selectedProject || projects[0]

  if (!p) {
    return (
      <div className="saas-card p-12 text-center space-y-4 max-w-lg mx-auto my-12">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-[#101828]">No Projects Available</h2>
        <p className="text-xs text-[#667085]">
          Upload a project archive (ZIP) containing package.json to begin static dependency security analysis.
        </p>
        <Link
          to="/upload"
          className="btn-primary text-xs"
        >
          <UploadCloud className="w-4 h-4 mr-1.5" />
          <span>Upload Project ZIP</span>
        </Link>
      </div>
    )
  }

  const projectName = p.projectName || p.name || 'Unnamed Project'
  const version = p.projectVersion || '1.0.0'
  const ecosystem = p.ecosystem || 'npm'
  const pid = p._id

  const lastScanned = p.analyzedAt 
    ? new Date(p.analyzedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Pending Analysis'

  // Strictly Project-Scoped Metrics
  const totalDeps = p.dependencyCounts?.dependencies || p.dependencyCounts?.total || p.totalDependencies || 0
  const directDeps = p.dependencyCounts?.direct || p.directDependencies || 0
  const transitiveDeps = p.dependencyCounts?.transitive || p.transitiveDependencies || 0

  const totalVulns = p.criticalRiskCount !== undefined 
    ? ((p.criticalRiskCount || 0) + (p.highRiskCount || 0) + (p.mediumRiskCount || 0) + (p.lowRiskCount || 0))
    : (p.vulnerabilities?.total || 0)
  const criticalVulns = p.criticalRiskCount ?? p.vulnerabilities?.critical ?? 0
  const highVulns = p.highRiskCount ?? p.vulnerabilities?.high ?? 0
  const mediumVulns = p.mediumRiskCount ?? p.vulnerabilities?.medium ?? 0
  const lowVulns = p.lowRiskCount ?? p.vulnerabilities?.low ?? 0

  const approvedLicenses = p.approvedLicenses || 0
  const reviewLicenses = p.reviewLicenses || 0
  const unknownLicenses = p.unknownLicenses || 0
  const totalLicenses = approvedLicenses + reviewLicenses + unknownLicenses

  const riskScore = p.averageRiskScore ?? 0
  const riskLevel = p.riskLevel || (riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW')

  // Overall Status
  const policyStatus = (p.policyStatus || 'PASS').toUpperCase()
  const isPass = policyStatus === 'PASS' || policyStatus === 'PASSED'
  const isReview = policyStatus === 'REVIEW'
  const isFail = policyStatus === 'FAIL' || policyStatus === 'FAILED'

  // Posture Score (0-100, where 100 is cleanest)
  const postureScore = Math.max(0, 100 - riskScore)
  const postureRating = postureScore >= 80 ? 'Good' : postureScore >= 50 ? 'Moderate' : 'Needs Attention'

  // Chart Data strictly for Selected Project
  const vulnChartData = [
    { name: 'Critical', count: criticalVulns, fill: SEVERITY_COLORS.Critical },
    { name: 'High', count: highVulns, fill: SEVERITY_COLORS.High },
    { name: 'Medium', count: mediumVulns, fill: SEVERITY_COLORS.Medium },
    { name: 'Low', count: lowVulns, fill: SEVERITY_COLORS.Low }
  ]

  const licenseChartData = [
    { name: 'Approved', value: approvedLicenses, color: LICENSE_COLORS.Approved },
    { name: 'Review', value: reviewLicenses, color: LICENSE_COLORS.Review },
    { name: 'Unknown', value: unknownLicenses, color: LICENSE_COLORS.Unknown }
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Project Context Bar */}
      <ProjectContextBar activeTab="" />

      {/* 2. Editorial Hero Section */}
      <div className="hero-surface radial-glow p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Security Command Center</span>
            </div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
                {projectName}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#F2F4F7] text-[#344054] font-mono text-xs border border-[#EAECF0]">
                v{version}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
              Consolidated security posture, multi-path dependency graph telemetry, and continuous compliance evaluation.
            </p>

            <div className="flex items-center flex-wrap gap-3 pt-2 text-xs text-[#667085]">
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-[#98A2B3]" />
                Scanned: <strong className="text-[#101828] ml-1 font-medium">{lastScanned}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[#667085]">{ecosystem}</span>
              <span className="text-slate-300">•</span>
              <span>Overall Posture: <strong className="text-[#101828]">{postureRating}</strong></span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 self-start lg:self-auto flex-shrink-0">
            <Link
              to={`/projects/${pid}/recommendations`}
              className="btn-secondary text-xs"
            >
              <Lightbulb className="w-4 h-4 mr-1.5 text-amber-500" />
              <span>Remediations</span>
            </Link>

            <Link
              to={`/projects/${pid}/report`}
              className="btn-secondary text-xs"
            >
              <FileCheck2 className="w-4 h-4 mr-1.5 text-emerald-600" />
              <span>Compliance Report</span>
            </Link>

            <Link
              to={`/projects/${pid}/dependencies`}
              className="btn-primary text-xs"
            >
              <span>Explore Tree</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Metric Bento Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Dependencies */}
        <Link to={`/projects/${pid}/dependencies`} className="saas-card-hover p-5 block group">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">Dependencies</span>
            <Layers className="w-4 h-4 text-[#98A2B3] group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">
            {totalDeps}
          </div>
          <div className="text-[11px] text-[#667085] mt-1 flex items-center space-x-1">
            <span className="font-semibold text-[#101828]">{directDeps}</span> direct
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-[#101828]">{transitiveDeps}</span> transitive
          </div>
        </Link>

        {/* Metric 2: Vulnerabilities */}
        <Link to={`/projects/${pid}/vulnerabilities`} className="saas-card-hover p-5 block group">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">Vulnerabilities</span>
            <Bug className="w-4 h-4 text-[#98A2B3] group-hover:text-rose-600 transition-colors" />
          </div>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">
            {totalVulns}
          </div>
          <div className="text-[11px] text-[#667085] mt-1 flex items-center space-x-1.5">
            {criticalVulns > 0 ? (
              <span className="font-extrabold text-rose-600">{criticalVulns} critical</span>
            ) : (
              <span className="text-emerald-600 font-semibold">0 critical</span>
            )}
            <span className="text-slate-300">•</span>
            <span>{highVulns} high</span>
          </div>
        </Link>

        {/* Metric 3: Licenses */}
        <Link to={`/projects/${pid}/licenses`} className="saas-card-hover p-5 block group">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">Licenses</span>
            <FileCheck className="w-4 h-4 text-[#98A2B3] group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">
            {totalLicenses || totalDeps}
          </div>
          <div className="text-[11px] text-[#667085] mt-1 flex items-center space-x-1.5">
            <span className="text-emerald-600 font-semibold">{approvedLicenses} approved</span>
            {reviewLicenses > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600 font-semibold">{reviewLicenses} review</span>
              </>
            )}
          </div>
        </Link>

        {/* Metric 4: Risk Score */}
        <Link to={`/projects/${pid}/risk`} className="saas-card-hover p-5 block group">
          <div className="flex items-center justify-between text-[#667085]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">Risk Score</span>
            <Scale className="w-4 h-4 text-[#98A2B3] group-hover:text-amber-500 transition-colors" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-[#101828] font-mono">{riskScore}</span>
            <span className="text-xs text-[#98A2B3]">/ 100</span>
          </div>
          <div className="mt-1">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
              riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
                ? 'saas-badge-fail'
                : riskLevel === 'MEDIUM'
                ? 'saas-badge-review'
                : 'saas-badge-pass'
            }`}>
              {riskLevel} RATING
            </span>
          </div>
        </Link>
      </div>

      {/* 4. Asymmetric Posture + Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Posture Gauge Card (4 Cols) */}
        <div className="lg:col-span-4 saas-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98A2B3]">
              SECURITY POSTURE INDEX
            </span>
            <h3 className="text-base font-extrabold text-[#101828] mt-1">
              Overall Health Rating
            </h3>

            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#F2F4F7"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={postureScore >= 80 ? '#059669' : postureScore >= 50 ? '#D97706' : '#D92D20'}
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * postureScore) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-[#101828] font-mono">
                    {postureScore}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#98A2B3]">
                    / 100
                  </span>
                </div>
              </div>
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                postureScore >= 80 ? 'saas-badge-pass' : postureScore >= 50 ? 'saas-badge-review' : 'saas-badge-fail'
              }`}>
                {postureRating}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E7EC] text-xs text-[#667085] leading-relaxed">
            Derived as inverse composite risk (100 - Risk Score).
          </div>
        </div>

        {/* Vulnerability Severity Chart (4 Cols) */}
        <div className="lg:col-span-4 saas-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98A2B3]">
                ADVISORY SPECTRUM
              </span>
              <Link to={`/projects/${pid}/vulnerabilities`} className="text-xs text-blue-600 hover:underline font-semibold">
                View All
              </Link>
            </div>
            <h3 className="text-base font-extrabold text-[#101828] mt-1">
              Vulnerabilities by Severity
            </h3>

            <div className="h-44 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vulnChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E4E7EC', borderRadius: '0.75rem', fontSize: '11px', boxShadow: '0 4px 12px rgba(16,24,40,0.06)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs text-[#667085]">
            <span>Critical Advisories:</span>
            <strong className="font-mono text-rose-600">{criticalVulns}</strong>
          </div>
        </div>

        {/* License Compliance Donut (4 Cols) */}
        <div className="lg:col-span-4 saas-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98A2B3]">
                LEGAL FRICTION
              </span>
              <Link to={`/projects/${pid}/licenses`} className="text-xs text-blue-600 hover:underline font-semibold">
                Audit
              </Link>
            </div>
            <h3 className="text-base font-extrabold text-[#101828] mt-1">
              License Distribution
            </h3>

            <div className="h-44 mt-4 flex items-center justify-center">
              {licenseChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={licenseChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {licenseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E4E7EC', borderRadius: '0.75rem', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-[#98A2B3]">No license data</span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs text-[#667085]">
            <span>Approved Permissive:</span>
            <strong className="font-mono text-emerald-600">{approvedLicenses}</strong>
          </div>
        </div>
      </div>

      {/* 5. Module Quick Jump Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#101828] tracking-tight">
            Security Intelligence Modules
          </h3>
          <span className="text-xs text-[#667085]">All modules scoped to {projectName}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={`/projects/${pid}/graph`} className="saas-card-hover p-4 block group">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <GitFork className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#101828] group-hover:text-blue-600 transition-colors">
                  Dependency Graph
                </h4>
                <p className="text-[10px] text-[#667085] truncate">Visual interactive graph canvas</p>
              </div>
            </div>
          </Link>

          <Link to={`/projects/${pid}/sbom`} className="saas-card-hover p-4 block group">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <FileCode2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#101828] group-hover:text-purple-600 transition-colors">
                  CycloneDX SBOM
                </h4>
                <p className="text-[10px] text-[#667085] truncate">v1.4 verified manifest</p>
              </div>
            </div>
          </Link>

          <Link to={`/projects/${pid}/policies`} className="saas-card-hover p-4 block group">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#101828] group-hover:text-emerald-600 transition-colors">
                  Policy Rules
                </h4>
                <p className="text-[10px] text-[#667085] truncate">Governance compliance gating</p>
              </div>
            </div>
          </Link>

          <Link to={`/projects/${pid}/report`} className="saas-card-hover p-4 block group">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#101828] group-hover:text-amber-600 transition-colors">
                  Audit Report
                </h4>
                <p className="text-[10px] text-[#667085] truncate">Formal verification document</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
