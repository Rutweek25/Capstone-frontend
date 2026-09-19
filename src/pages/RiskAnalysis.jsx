import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Play, 
  Loader2, 
  X, 
  Layers, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Scale, 
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  PackageCheck,
  ChevronRight
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'
import ProjectContextBar from '../components/ProjectContextBar'

const RISK_BADGES = {
  CRITICAL: 'saas-badge-fail',
  HIGH: 'saas-badge-fail',
  MEDIUM: 'saas-badge-review',
  LOW: 'saas-badge-pass',
  UNKNOWN: 'saas-badge-neutral'
}

export default function RiskAnalysis() {
  const { id: routeId } = useParams()
  const { selectedProject, projects, selectProjectById } = useProjects()

  const activeProject = selectedProject || (projects.length > 0 ? projects[0] : null)
  const activeProjectId = routeId || activeProject?._id

  const [summary, setSummary] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0, averageRiskScore: 0 })
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState(null)
  const [showFormulaModal, setShowFormulaModal] = useState(false)
  const [filterLevel, setFilterLevel] = useState('ALL')

  useEffect(() => {
    if (routeId) {
      selectProjectById(routeId)
    }
  }, [routeId])

  useEffect(() => {
    if (activeProjectId) {
      loadRiskData(activeProjectId)
    } else {
      setRisks([])
      setSummary({ total: 0, critical: 0, high: 0, medium: 0, low: 0, averageRiskScore: 0 })
    }
  }, [activeProjectId])

  const loadRiskData = async (pid) => {
    setLoading(true)
    try {
      const [sRes, rRes] = await Promise.allSettled([
        api.get(`/projects/${pid}/risk/summary`),
        api.get(`/projects/${pid}/risk`)
      ])
      if (sRes.status === 'fulfilled' && sRes.value?.data?.summary) {
        setSummary(sRes.value.data.summary)
      }
      if (rRes.status === 'fulfilled' && Array.isArray(rRes.value?.data?.risks)) {
        setRisks(rRes.value.data.risks)
      }
    } catch (e) {
      console.warn('Risk API error:', e.message)
    } finally {
      setLoading(false)
    }
  }

  const runRiskAnalysis = async () => {
    if (!activeProjectId || analyzing) return
    setAnalyzing(true)
    try {
      await api.post(`/projects/${activeProjectId}/risk/analyze`)
      await loadRiskData(activeProjectId)
    } catch (e) {
      console.warn('Risk calculation error:', e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const projectName = activeProject ? (activeProject.projectName || activeProject.name) : 'Selected Project'
  const overallRisk = activeProject?.averageRiskScore ?? summary.averageRiskScore ?? 0
  const overallLevel = activeProject?.riskLevel || (overallRisk >= 70 ? 'HIGH' : overallRisk >= 40 ? 'MEDIUM' : 'LOW')

  // Identify highest risk dependency strictly from real project data
  const highestRiskItem = useMemo(() => {
    if (!risks || risks.length === 0) return null
    return [...risks].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))[0]
  }, [risks])

  // Derive contextual factor values strictly from active project data
  const derivedFactors = useMemo(() => {
    if (!risks || risks.length === 0) {
      return {
        severityScore: 0,
        contextScore: 0,
        fixScore: 0,
        licenseScore: 0,
        directCount: 0,
        transitiveCount: 0,
        fixedCount: 0,
        totalWithVulns: 0,
        reviewLicenseCount: 0,
        statement: 'No active risk vectors detected in this project dependency inventory.'
      }
    }

    const totalWithVulns = risks.filter(r => r.vulnerabilitySeverity && r.vulnerabilitySeverity !== 'NONE').length
    const fixedCount = risks.filter(r => r.fixAvailable).length
    const directCount = risks.filter(r => (r.dependencyType || '').toLowerCase() === 'direct').length
    const transitiveCount = risks.filter(r => (r.dependencyType || '').toLowerCase() === 'transitive').length
    const reviewLicenseCount = risks.filter(r => (r.licenseStatus || '').toUpperCase() === 'REVIEW').length

    // Average severity score (0-100)
    const avgCvss = risks.reduce((acc, r) => acc + (typeof r.cvssScore === 'number' ? r.cvssScore : 0), 0) / (totalWithVulns || 1)
    const severityScore = Math.min(100, Math.round((avgCvss / 10) * 100))

    // Context score
    const contextScore = directCount > 0 ? 80 : 50

    // Fix availability score
    const fixScore = totalWithVulns > 0 ? Math.round((fixedCount / totalWithVulns) * 100) : 0

    // License score
    const licenseScore = reviewLicenseCount > 0 ? 50 : 0

    // Dynamic contextual statement generated from real data
    let statement = ''
    if (highestRiskItem) {
      if (highestRiskItem.vulnerabilitySeverity === 'CRITICAL' || highestRiskItem.vulnerabilitySeverity === 'HIGH') {
        statement = `Driven primarily by vulnerability severity (${highestRiskItem.vulnerabilitySeverity} in ${highestRiskItem.packageName}) and ${highestRiskItem.dependencyType || 'transitive'} dependency exposure.`
      } else if (reviewLicenseCount > 0) {
        statement = `Driven by license compliance friction (${reviewLicenseCount} package requires review) with moderate advisory severity.`
      } else {
        statement = `Well-contained baseline risk. Minor exposure driven by transitive placement in ${highestRiskItem.packageName}.`
      }
    } else {
      statement = 'Dependency risk profile is within acceptable operational baseline.'
    }

    return {
      severityScore,
      contextScore,
      fixScore,
      licenseScore,
      directCount,
      transitiveCount,
      fixedCount,
      totalWithVulns,
      reviewLicenseCount,
      statement
    }
  }, [risks, highestRiskItem])

  // Generate "Why This Score?" timeline items strictly from real project data
  const timelineReasons = useMemo(() => {
    if (!risks || risks.length === 0) {
      return [
        {
          num: '01',
          title: 'Clean Baseline Inventory',
          desc: 'No package advisories or high-risk legal friction flagged in this project.',
          type: 'pass'
        }
      ]
    }

    const items = []
    // 01: Vulnerability Severity
    const criticals = risks.filter(r => (r.vulnerabilitySeverity || '').toUpperCase() === 'CRITICAL')
    const highs = risks.filter(r => (r.vulnerabilitySeverity || '').toUpperCase() === 'HIGH')
    if (criticals.length > 0) {
      items.push({
        num: '01',
        title: `Critical vulnerability detected in ${criticals[0].packageName}`,
        desc: `Advisory ${criticals[0].vulnerabilityId || 'CVE'} with CVSS ${criticals[0].cvssScore ?? '9.8'} triggers maximum 50% severity weighting.`,
        type: 'fail'
      })
    } else if (highs.length > 0) {
      items.push({
        num: '01',
        title: `High severity advisory in ${highs[0].packageName}`,
        desc: `Advisory ${highs[0].vulnerabilityId || 'CVE'} (CVSS ${highs[0].cvssScore ?? '7.5'}) contributes weighted severity impact.`,
        type: 'fail'
      })
    } else if (risks[0]?.vulnerabilitySeverity && risks[0].vulnerabilitySeverity !== 'NONE') {
      items.push({
        num: '01',
        title: `Moderate advisory detected in ${risks[0].packageName}`,
        desc: `Advisory ${risks[0].vulnerabilityId || 'CVE'} evaluated at CVSS ${risks[0].cvssScore ?? '5.0'}.`,
        type: 'review'
      })
    } else {
      items.push({
        num: '01',
        title: 'Zero High/Critical Advisories',
        desc: 'All evaluated packages in this project have no active critical vulnerability listings.',
        type: 'pass'
      })
    }

    // 02: Dependency Graph Reachability
    if (derivedFactors.transitiveCount > 0) {
      items.push({
        num: '02',
        title: 'Vulnerable dependency reachable via transitive chain',
        desc: `${derivedFactors.transitiveCount} package(s) located in nested graph chains (20% context model).`,
        type: 'review'
      })
    } else {
      items.push({
        num: '02',
        title: 'Direct top-level placement',
        desc: 'Target packages declared as primary direct dependencies.',
        type: 'info'
      })
    }

    // 03: Fix Availability
    if (derivedFactors.fixedCount > 0) {
      items.push({
        num: '03',
        title: 'Upstream patch available',
        desc: `Patched version released by upstream maintainers for ${derivedFactors.fixedCount} vulnerable component(s).`,
        type: 'pass'
      })
    } else {
      items.push({
        num: '03',
        title: 'No upstream fix published',
        desc: 'Vulnerabilities require architectural workarounds or alternative package substitution.',
        type: 'review'
      })
    }

    // 04: License Exposure
    if (derivedFactors.reviewLicenseCount > 0) {
      items.push({
        num: '04',
        title: 'License compliance review required',
        desc: `${derivedFactors.reviewLicenseCount} package(s) have copyleft or restricted license flags (15% impact).`,
        type: 'fail'
      })
    } else {
      items.push({
        num: '04',
        title: 'Permissive license clearance',
        desc: 'All evaluated dependencies utilize approved permissive licenses (MIT, Apache, BSD).',
        type: 'pass'
      })
    }

    return items
  }, [risks, derivedFactors])

  // Weighted formula contributions (0.50*S + 0.20*C + 0.15*F + 0.15*L)
  const contributions = useMemo(() => {
    const s = Math.round(derivedFactors.severityScore * 0.50)
    const c = Math.round(derivedFactors.contextScore * 0.20)
    const f = Math.round(derivedFactors.fixScore * 0.15)
    const l = Math.round(derivedFactors.licenseScore * 0.15)
    return {
      severity: { pts: s, raw: derivedFactors.severityScore, weight: '50%' },
      context: { pts: c, raw: derivedFactors.contextScore, weight: '20%' },
      fix: { pts: f, raw: derivedFactors.fixScore, weight: '15%' },
      license: { pts: l, raw: derivedFactors.licenseScore, weight: '15%' },
      sum: s + c + f + l
    }
  }, [derivedFactors])

  const filteredRisks = risks.filter((r) => {
    if (filterLevel === 'ALL') return true
    return (r.riskLevel || 'UNKNOWN').toUpperCase() === filterLevel
  })

  // SVG Circular Radial Ring Calculation
  const strokeDashoffset = 283 - (283 * Math.min(100, Math.max(0, overallRisk))) / 100
  const ringColor = overallRisk >= 70 ? '#D92D20' : overallRisk >= 40 ? '#D97706' : '#059669'

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Project Context Bar */}
      <ProjectContextBar activeTab="risk" />

      {/* 2. Editorial Hero Section */}
      <div className="hero-surface radial-glow p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#2563EB] text-xs font-bold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Contextual Prioritization Model</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              Risk Analysis
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
              Understand which dependencies require remediation first based on multivariable weighting: severity, graph placement, patch availability, and licensing.
            </p>

            {/* Micro context metadata */}
            <div className="flex items-center flex-wrap gap-3 pt-2 text-xs text-[#667085]">
              <span className="inline-flex items-center space-x-1.5 font-semibold text-[#101828]">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>{projectName}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span>Evaluated: <strong className="text-[#101828] font-mono">{risks.length} packages</strong></span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[#101828]">Model v1.0 (Non-CVSS)</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start lg:self-auto flex-shrink-0">
            <button
              onClick={() => setShowFormulaModal(true)}
              className="btn-secondary text-xs"
            >
              <Info className="w-4 h-4 mr-1.5 text-[#667085]" />
              <span>Inspect Formula</span>
            </button>

            <button
              onClick={runRiskAnalysis}
              disabled={analyzing || !activeProjectId}
              className="btn-primary text-xs"
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-blue-400" />
              ) : (
                <Play className="w-4 h-4 mr-1.5 fill-white" />
              )}
              <span>{analyzing ? 'Evaluating...' : 'Recalculate Risk'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Large Risk Score + Bento Factor Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Large Segmented Radial Score (5 Cols) */}
        <div className="lg:col-span-5 saas-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-white">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#98A2B3]">
                COMPOSITE PROJECT RISK
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${RISK_BADGES[overallLevel] || 'saas-badge-neutral'}`}>
                {overallLevel} RISK
              </span>
            </div>

            {/* Large Radial SVG Score Gauge */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#F2F4F7"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Active Segmented Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={ringColor}
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </svg>

                {/* Inner Counter */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black text-[#101828] font-mono tracking-tight">
                    {overallRisk}
                  </span>
                  <span className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wider mt-0.5">
                    out of 100
                  </span>
                </div>
              </div>

              {/* Data-Driven Contextual Statement */}
              <p className="text-xs text-[#667085] text-center max-w-sm mt-3 leading-relaxed px-2 font-medium">
                {derivedFactors.statement}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E7EC] flex items-center justify-between text-[11px] text-[#98A2B3]">
            <span>Low: 1–39</span>
            <span>Medium: 40–69</span>
            <span className="font-semibold text-rose-600">High: 70–100</span>
          </div>
        </div>

        {/* Right Column: Visual Analytical Bento Cards (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bento 1: Severity Impact (50%) */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98A2B3]">Factor 1</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                  50% Weight
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#101828] mt-2">Severity Impact</h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
                CVSS-weighted advisory severity rating.
              </p>

              {/* Visual Meter */}
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#667085]">CVSS Factor</span>
                  <span className="font-bold text-[#101828]">{derivedFactors.severityScore} / 100</span>
                </div>
                <div className="w-full h-2 bg-[#F2F4F7] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-600 rounded-full" 
                    style={{ width: `${derivedFactors.severityScore}%`, transition: 'width 0.4s ease' }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#F2F4F7] flex justify-between text-[10px] font-mono text-[#667085]">
              <span>Formula: 0.50 × Severity</span>
              <strong className="text-[#101828]">+{contributions.severity.pts} pts</strong>
            </div>
          </div>

          {/* Bento 2: Tree Context (20%) */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98A2B3]">Factor 2</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  20% Weight
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#101828] mt-2">Dependency Context</h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
                Graph placement and attack surface depth.
              </p>

              {/* Visual Comparison */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-[#98A2B3] uppercase block font-semibold">Direct</span>
                  <span className="font-mono text-sm font-extrabold text-[#101828]">{derivedFactors.directCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-[#98A2B3] uppercase block font-semibold">Transitive</span>
                  <span className="font-mono text-sm font-extrabold text-[#101828]">{derivedFactors.transitiveCount}</span>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#F2F4F7] flex justify-between text-[10px] font-mono text-[#667085]">
              <span>Formula: 0.20 × Context</span>
              <strong className="text-[#101828]">+{contributions.context.pts} pts</strong>
            </div>
          </div>

          {/* Bento 3: Fix Availability (15%) */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98A2B3]">Factor 3</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  15% Weight
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#101828] mt-2">Fix Availability</h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
                Existence of patched releases in registry.
              </p>

              {/* Visual Indicator */}
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center space-x-2">
                <PackageCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-emerald-900">
                  {derivedFactors.fixedCount > 0 ? `${derivedFactors.fixedCount} Patch(es) Available` : 'No known patches'}
                </span>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#F2F4F7] flex justify-between text-[10px] font-mono text-[#667085]">
              <span>Formula: 0.15 × Fix</span>
              <strong className="text-[#101828]">+{contributions.fix.pts} pts</strong>
            </div>
          </div>

          {/* Bento 4: License Impact (15%) */}
          <div className="saas-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98A2B3]">Factor 4</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                  15% Weight
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#101828] mt-2">License Friction</h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
                Copyleft penalty and legal exposure.
              </p>

              {/* Visual Breakdown */}
              <div className="mt-3 flex items-center space-x-2 text-xs">
                <span className={`px-2 py-1 rounded-lg font-bold ${derivedFactors.reviewLicenseCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                  {derivedFactors.reviewLicenseCount > 0 ? `${derivedFactors.reviewLicenseCount} Flagged` : '0 Flagged'}
                </span>
                <span className="text-[11px] text-[#667085]">
                  {derivedFactors.reviewLicenseCount > 0 ? 'Requires legal review' : 'Permissive licenses'}
                </span>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-[#F2F4F7] flex justify-between text-[10px] font-mono text-[#667085]">
              <span>Formula: 0.15 × License</span>
              <strong className="text-[#101828]">+{contributions.license.pts} pts</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Editorial "Why This Score?" Timeline & Risk Contribution Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Editorial Timeline (7 Cols) */}
        <div className="lg:col-span-7 saas-card p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98A2B3]">
                ANALYTICAL RATIONALE
              </span>
              <h2 className="text-lg font-extrabold text-[#101828] tracking-tight">
                Why is this project rated {overallLevel} risk?
              </h2>
            </div>
            <span className="text-xs text-[#667085] font-medium hidden sm:inline">
              Derived from {risks.length} evaluated packages
            </span>
          </div>

          {/* Vertical Editorial Timeline */}
          <div className="space-y-4 pt-1">
            {timelineReasons.map((item) => (
              <div key={item.num} className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#101828] font-mono font-black text-xs flex items-center justify-center flex-shrink-0 border border-[#E4E7EC]">
                  {item.num}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h4 className="text-xs font-bold text-[#101828]">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#667085] mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Contribution Breakdown (5 Cols) */}
        <div className="lg:col-span-5 saas-card p-6 sm:p-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-[#E4E7EC] pb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#98A2B3]">
                WEIGHTED ACCUMULATION
              </span>
              <h2 className="text-lg font-extrabold text-[#101828] tracking-tight">
                Risk Contribution
              </h2>
            </div>

            <div className="space-y-3.5 pt-4">
              {/* Severity */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#101828]">Vulnerability Severity (50%)</span>
                  <span className="font-mono text-[#101828]">+{contributions.severity.pts} pts</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-600 rounded-full" 
                    style={{ width: `${(contributions.severity.pts / 50) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Context */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#101828]">Tree Context (20%)</span>
                  <span className="font-mono text-[#101828]">+{contributions.context.pts} pts</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${(contributions.context.pts / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Fix */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#101828]">Fix Availability (15%)</span>
                  <span className="font-mono text-[#101828]">+{contributions.fix.pts} pts</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full" 
                    style={{ width: `${(contributions.fix.pts / 15) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* License */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#101828]">License Impact (15%)</span>
                  <span className="font-mono text-[#101828]">+{contributions.license.pts} pts</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-600 rounded-full" 
                    style={{ width: `${(contributions.license.pts / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs">
            <span className="text-[#667085] font-medium">Accumulated Score:</span>
            <span className="font-mono font-black text-base text-[#101828]">
              {overallRisk} <span className="text-xs text-[#98A2B3]">/ 100</span>
            </span>
          </div>
        </div>
      </div>

      {/* 5. Security Insights Panel */}
      <div className="saas-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-base font-extrabold text-[#101828] tracking-tight">
              Security Insights
            </h2>
          </div>
          <span className="text-xs text-[#667085]">Generated from selected project findings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center space-x-2 text-blue-700 font-bold uppercase text-[10px]">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Primary Driver</span>
            </div>
            <p className="text-xs text-[#101828] font-medium leading-relaxed">
              {highestRiskItem ? (
                <>
                  Package <strong className="font-mono">{highestRiskItem.packageName}</strong> constitutes the single largest driver with risk score <strong className="font-mono">{highestRiskItem.riskScore}/100</strong>.
                </>
              ) : (
                'No elevated vulnerability drivers detected.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold uppercase text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Remediation Opportunity</span>
            </div>
            <p className="text-xs text-[#101828] font-medium leading-relaxed">
              {derivedFactors.fixedCount > 0 ? (
                `Upstream patches are available for ${derivedFactors.fixedCount} packages. Upgrading them will reduce overall risk immediately.`
              ) : (
                'Maintain current dependency monitoring and inspect advisories regularly.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 6. Dependency Risk Table (With Highest Risk Highlight) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-[#101828] tracking-tight">
              Evaluated Dependency Risk Inventory
            </h2>
            <p className="text-xs text-[#667085]">
              Sorted contextual prioritization scores for {projectName}.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterLevel === lvl
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {lvl === 'ALL' ? `All (${risks.length})` : lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="saas-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#98A2B3] text-xs font-medium space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mx-auto" />
              <p>Computing multivariable risk scores for {projectName}...</p>
            </div>
          ) : filteredRisks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-[#101828]">No matching risk findings</h3>
              <p className="text-xs text-[#667085] max-w-md mx-auto">
                No individual packages match the selected severity filter in this project.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Version</th>
                    <th>Graph Placement</th>
                    <th>Vulnerability Advisory</th>
                    <th>CVSS</th>
                    <th>Calculated Risk</th>
                    <th>Rating</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRisks.map((r) => {
                    const level = (r.riskLevel || 'UNKNOWN').toUpperCase()
                    const badgeClass = RISK_BADGES[level] || 'saas-badge-neutral'
                    const isHighest = highestRiskItem && (r._id === highestRiskItem._id || r.packageName === highestRiskItem.packageName) && r.riskScore > 60

                    return (
                      <tr 
                        key={r._id || `${r.packageName}-${r.vulnerabilityId}`}
                        onClick={() => setSelectedRisk(r)}
                        className={`cursor-pointer ${isHighest ? 'row-critical-highlight' : ''}`}
                      >
                        <td>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-[#101828] font-mono text-xs hover:text-blue-600">
                              {r.packageName}
                            </span>
                            {isHighest && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                                HIGHEST RISK
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="font-mono text-xs text-[#667085]">
                            {r.packageVersion || '1.0.0'}
                          </span>
                        </td>

                        <td>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2F4F7] text-[#344054] border border-[#EAECF0] uppercase">
                            {r.dependencyType || 'transitive'}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs text-[#101828] font-semibold">
                            {r.vulnerabilityId || 'N/A'}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs font-bold text-[#101828]">
                            {r.cvssScore ?? '—'}
                          </span>
                        </td>

                        <td>
                          <div className="flex items-center space-x-2.5">
                            <div className="w-16 h-1.5 bg-[#F2F4F7] rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  r.riskScore >= 70 ? 'bg-rose-600' : r.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${r.riskScore}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-xs font-extrabold text-[#101828]">
                              {r.riskScore}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                            {level}
                          </span>
                        </td>

                        <td className="text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedRisk(r); }}
                            className="btn-secondary text-[11px] py-1 px-2.5"
                          >
                            Breakdown
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 7. Detailed Single Risk Factor Breakdown Modal */}
      <AnimatePresence>
        {selectedRisk && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#E4E7EC] rounded-2xl max-w-lg w-full p-6 shadow-saas-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-[#101828] text-base">
                    {selectedRisk.packageName} Risk Breakdown
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRisk(null)}
                  className="p-1 rounded-lg border border-[#E4E7EC] text-[#98A2B3] hover:text-[#101828]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
                  <span className="text-[10px] uppercase font-bold text-[#98A2B3] block">Calculated Score</span>
                  <div className="flex items-baseline space-x-1.5 mt-0.5">
                    <span className="font-mono font-black text-2xl text-[#101828]">
                      {selectedRisk.riskScore}
                    </span>
                    <span className="text-[#98A2B3] text-xs">/ 100</span>
                  </div>
                  <span className="text-[10px] text-[#667085] block mt-0.5">
                    Rating: <strong className="text-[#101828]">{selectedRisk.riskLevel}</strong>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
                  <span className="text-[10px] uppercase font-bold text-[#98A2B3] block">Placement & CVSS</span>
                  <span className="font-mono font-bold text-sm text-[#101828] mt-1 block uppercase">
                    {selectedRisk.dependencyType || 'Transitive'}
                  </span>
                  <span className="text-[10px] text-[#667085]">CVSS: {selectedRisk.cvssScore ?? 'None'}</span>
                </div>
              </div>

              {/* Justification Reasons */}
              <div>
                <span className="text-[10px] uppercase font-bold text-[#98A2B3] block mb-2">
                  Scoring Inputs & Justifications
                </span>
                <div className="space-y-2">
                  {selectedRisk.reasons && selectedRisk.reasons.length > 0 ? (
                    selectedRisk.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-[#344054] p-2.5 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                        <span>{reason}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#667085] p-3 rounded-xl bg-[#F8FAFC]">
                      Evaluated using weighted multivariable formulation: Severity (50%), Context (20%), Fix (15%), License (15%).
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-between">
                <Link
                  to={`/projects/${activeProjectId}/recommendations`}
                  className="text-xs text-blue-600 hover:underline font-semibold flex items-center space-x-1"
                >
                  <span>View Actionable Remediations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setSelectedRisk(null)}
                  className="btn-primary text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Risk Engine Formula Explanation Modal */}
      <AnimatePresence>
        {showFormulaModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#E4E7EC] rounded-2xl max-w-lg w-full p-6 shadow-saas-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB]">
                    MATHEMATICAL SPECIFICATION
                  </span>
                  <h3 className="font-black text-[#101828] text-base">
                    HOW YOUR RISK SCORE IS CALCULATED
                  </h3>
                </div>
                <button
                  onClick={() => setShowFormulaModal(false)}
                  className="p-1 rounded-lg border border-[#E4E7EC] text-[#98A2B3] hover:text-[#101828]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Summation Display */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EAECF0] space-y-2 text-xs">
                <div className="flex justify-between font-mono text-[#667085]">
                  <span>Severity Factor (50%)</span>
                  <span className="text-[#101828] font-bold">+{contributions.severity.pts}.0</span>
                </div>
                <div className="flex justify-between font-mono text-[#667085]">
                  <span>Context Factor (20%)</span>
                  <span className="text-[#101828] font-bold">+{contributions.context.pts}.0</span>
                </div>
                <div className="flex justify-between font-mono text-[#667085]">
                  <span>Fix Availability (15%)</span>
                  <span className="text-[#101828] font-bold">+{contributions.fix.pts}.0</span>
                </div>
                <div className="flex justify-between font-mono text-[#667085]">
                  <span>License Impact (15%)</span>
                  <span className="text-[#101828] font-bold">+{contributions.license.pts}.0</span>
                </div>
                <div className="pt-2 border-t border-[#E4E7EC] flex justify-between font-mono text-sm font-extrabold text-[#101828]">
                  <span>Composite Total</span>
                  <span>= {overallRisk} / 100</span>
                </div>
              </div>

              {/* Exact Formula Callout */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                <span className="font-bold block">Authoritative Formula:</span>
                <code className="font-mono text-xs block font-bold text-blue-950">
                  Score = (0.50 × S) + (0.20 × C) + (0.15 × F) + (0.15 × L)
                </code>
                <p className="text-[11px] text-blue-800 pt-1 leading-relaxed">
                  Where S = CVSS severity, C = graph depth placement (Direct: 80, Transitive: 50), F = fix version presence, and L = license friction penalty.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowFormulaModal(false)}
                  className="btn-primary text-xs"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
