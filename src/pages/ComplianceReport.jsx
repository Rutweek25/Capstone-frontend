import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FileCheck2, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Download, 
  Code, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  FileCode, 
  Sliders, 
  FileText 
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'

export default function ComplianceReport() {
  const { id } = useParams()
  const { activeProject } = useProjects()
  const projectId = id || activeProject?._id

  const [report, setReport] = useState(null)
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showJsonModal, setShowJsonModal] = useState(false)

  const fetchReports = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const res = await api.get(`/projects/${projectId}/reports`)
      const list = res.data.reports || []
      if (list.length > 0) {
        const latest = list[0]
        setReport(latest)
        setSummaryData(latest.summaryData)
      }
    } catch (err) {
      console.warn('Failed to fetch compliance reports', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!projectId) return
    setGenerating(true)
    try {
      const res = await api.post(`/projects/${projectId}/reports/generate`)
      setReport(res.data.report)
      setSummaryData(res.data.summary)
    } catch (err) {
      console.warn('Failed to generate compliance report', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadJson = () => {
    if (!summaryData) return
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(summaryData, null, 2))}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute('download', `compliance-report-${projectId}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  useEffect(() => {
    fetchReports()
  }, [projectId])

  const getStatusBanner = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">Overall Verdict</div>
              <div className="text-2xl font-black text-white mt-0.5">COMPLIANT</div>
              <p className="text-xs text-slate-300 mt-1">
                All organizational security thresholds, license policies, and SBOM integrity checks satisfy requirements.
              </p>
            </div>
          </div>
        )
      case 'REVIEW_REQUIRED':
        return (
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">Overall Verdict</div>
              <div className="text-2xl font-black text-white mt-0.5">REVIEW REQUIRED</div>
              <p className="text-xs text-slate-300 mt-1">
                One or more license classifications or security findings require human review before release.
              </p>
            </div>
          </div>
        )
      case 'NON_COMPLIANT':
        return (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono text-rose-400 uppercase tracking-widest font-bold">Overall Verdict</div>
              <div className="text-2xl font-black text-white mt-0.5">NON-COMPLIANT</div>
              <p className="text-xs text-slate-300 mt-1">
                Critical vulnerabilities, license violations, or broken SBOM hashes fail organizational compliance policies.
              </p>
            </div>
          </div>
        )
      default:
        return (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-slate-800 text-slate-400">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">Overall Verdict</div>
              <div className="text-2xl font-black text-white mt-0.5">ANALYSIS INCOMPLETE</div>
              <p className="text-xs text-slate-400 mt-1">
                Click "Generate Final Compliance Report" below to run policy evaluation and generate report.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Final Compliance Report</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Consolidated security operations audit, SBOM verification, license screening, and final compliance verdict.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {summaryData && (
            <>
              <button
                onClick={() => setShowJsonModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center space-x-2"
              >
                <Code className="w-4 h-4" />
                <span>View JSON</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold text-xs transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>
            </>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Compiling Report...' : 'Generate Compliance Report'}</span>
          </button>
        </div>
      </div>

      {/* Compliance Verdict Banner */}
      {getStatusBanner(summaryData?.compliance?.status || report?.overallStatus)}

      {/* Executive Summaries Grid */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="glass-panel p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Project Inventory</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Project Name</span>
                <span className="font-bold text-white">{summaryData.project?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Version</span>
                <span className="font-mono text-cyan-400">{summaryData.project?.version}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Ecosystem</span>
                <span className="font-mono text-white">{summaryData.project?.ecosystem}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Scan Date</span>
                <span className="font-mono text-slate-400">{new Date(summaryData.generatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Dependencies Summary */}
          <div className="glass-panel p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Dependencies Summary</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Direct</div>
                <div className="text-xl font-extrabold text-cyan-400 mt-1">{summaryData.dependencies?.direct}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Transitive</div>
                <div className="text-xl font-extrabold text-slate-300 mt-1">{summaryData.dependencies?.transitive}</div>
              </div>
            </div>
            <div className="text-xs text-slate-400 text-center font-mono pt-1">
              Total Monitored Dependencies: {summaryData.dependencies?.total}
            </div>
          </div>

          {/* Vulnerabilities Summary */}
          <div className="glass-panel p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Vulnerabilities (OSV)</span>
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-[10px] text-rose-400 font-mono">CRITICAL</div>
                <div className="text-lg font-bold text-rose-400 mt-0.5">{summaryData.vulnerabilities?.critical}</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-[10px] text-amber-400 font-mono">HIGH</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{summaryData.vulnerabilities?.high}</div>
              </div>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="text-[10px] text-cyan-400 font-mono">MEDIUM</div>
                <div className="text-lg font-bold text-cyan-400 mt-0.5">{summaryData.vulnerabilities?.medium}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">LOW</div>
                <div className="text-lg font-bold text-slate-300 mt-0.5">{summaryData.vulnerabilities?.low}</div>
              </div>
            </div>
          </div>

          {/* License Summary */}
          <div className="glass-panel p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>License Screening</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-400 font-mono">APPROVED</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">{summaryData.licenses?.approved}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-[10px] text-amber-400 font-mono">REVIEW</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{summaryData.licenses?.review}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">UNKNOWN</div>
                <div className="text-lg font-bold text-slate-300 mt-0.5">{summaryData.licenses?.unknown}</div>
              </div>
            </div>
          </div>

          {/* SBOM Summary */}
          <div className="glass-panel p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-purple-400" />
              <span>CycloneDX SBOM Audit</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Spec Version</span>
                <span className="font-mono text-white">{summaryData.sbom?.specVersion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Quality Score</span>
                <span className="font-mono text-purple-400 font-bold">{summaryData.sbom?.qualityScore} / 100</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">SHA-256 Hash Integrity</span>
                <span className="font-mono text-emerald-400 font-bold">{summaryData.sbom?.integrityStatus}</span>
              </div>
            </div>
          </div>

          {/* Contextual Risk Summary */}
          <div className="glass-panel p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>Contextual Risk Prioritization</span>
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Average Risk Score</div>
                <div className="text-3xl font-black text-amber-400 mt-1">{summaryData.risk?.averageRiskScore} / 100</div>
              </div>
              <div className="text-right text-xs font-mono space-y-1">
                <div className="text-rose-400">Critical: {summaryData.risk?.critical}</div>
                <div className="text-amber-400">High: {summaryData.risk?.high}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Evaluation Details */}
      {summaryData && summaryData.policies && (
        <div className="glass-panel p-6 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Policy Engine Rules Evaluation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Security Rule</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  summaryData.policies.security?.result === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {summaryData.policies.security?.result || 'PASS'}
                </span>
              </div>
              <p className="text-slate-400 text-xs">{summaryData.policies.security?.reason || 'No critical vulnerabilities'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">License Rule</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  summaryData.policies.license?.result === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {summaryData.policies.license?.result || 'PASS'}
                </span>
              </div>
              <p className="text-slate-400 text-xs">{summaryData.policies.license?.reason || 'OSI-approved licenses'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">SBOM Integrity Rule</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  summaryData.policies.sbom?.result === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {summaryData.policies.sbom?.result || 'PASS'}
                </span>
              </div>
              <p className="text-slate-400 text-xs">{summaryData.policies.sbom?.reason || 'Fresh CycloneDX artifact'}</p>
            </div>
          </div>
        </div>
      )}

      {/* JSON Viewer Modal */}
      {showJsonModal && summaryData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-6 max-w-4xl w-full border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <span>Raw Compliance Report JSON</span>
              </h3>
              <button onClick={() => setShowJsonModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(summaryData, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end space-x-3 border-t border-slate-800 pt-3">
              <button
                onClick={handleDownloadJson}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON File</span>
              </button>
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
