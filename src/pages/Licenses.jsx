import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  Play, 
  Loader2, 
  Info,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'
import ProjectContextBar from '../components/ProjectContextBar'

const LICENSE_BADGES = {
  APPROVED: 'saas-badge-pass',
  REVIEW: 'saas-badge-review',
  UNKNOWN: 'saas-badge-neutral'
}

export default function Licenses() {
  const { id: routeId } = useParams()
  const { selectedProject, projects, selectProjectById } = useProjects()

  const activeProject = selectedProject || (projects.length > 0 ? projects[0] : null)
  const activeProjectId = routeId || activeProject?._id

  const [summary, setSummary] = useState({ totalDependencies: 0, detected: 0, approved: 0, review: 0, unknown: 0 })
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedLicense, setSelectedLicense] = useState(null)

  useEffect(() => {
    if (routeId) {
      selectProjectById(routeId)
    }
  }, [routeId])

  useEffect(() => {
    if (activeProjectId) {
      loadLicensesData(activeProjectId)
    } else {
      setLicenses([])
      setSummary({ totalDependencies: 0, detected: 0, approved: 0, review: 0, unknown: 0 })
    }
  }, [activeProjectId])

  const loadLicensesData = async (pid) => {
    setLoading(true)
    try {
      const lRes = await api.get(`/projects/${pid}/licenses`)
      const fetched = lRes.data?.licenses && Array.isArray(lRes.data.licenses)
        ? lRes.data.licenses
        : []
      setLicenses(fetched)

      // Calculate summary directly from actual project license records
      const app = fetched.filter(l => (l.complianceStatus || '').toUpperCase() === 'APPROVED').length
      const rev = fetched.filter(l => (l.complianceStatus || '').toUpperCase() === 'REVIEW').length
      const unk = fetched.filter(l => (l.complianceStatus || '').toUpperCase() === 'UNKNOWN' || !['APPROVED', 'REVIEW'].includes((l.complianceStatus || '').toUpperCase())).length

      setSummary({
        totalDependencies: fetched.length,
        detected: app + rev,
        approved: app,
        review: rev,
        unknown: unk
      })
    } catch (e) {
      console.warn('Licenses API error:', e.message)
      setLicenses([])
      setSummary({ totalDependencies: 0, detected: 0, approved: 0, review: 0, unknown: 0 })
    } finally {
      setLoading(false)
    }
  }

  const runAudit = async () => {
    if (!activeProjectId || analyzing) return
    setAnalyzing(true)
    try {
      await api.post(`/projects/${activeProjectId}/licenses/analyze`)
      await loadLicensesData(activeProjectId)
    } catch (e) {
      console.warn('License audit error:', e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const filteredLicenses = useMemo(() => {
    return licenses.filter((it) => {
      const status = (it.complianceStatus || 'UNKNOWN').toUpperCase()
      const matchesFilter = statusFilter === 'ALL' || status === statusFilter
      const query = search.toLowerCase()
      const matchesSearch = !query ||
        (it.packageName || '').toLowerCase().includes(query) ||
        (it.detectedLicense || '').toLowerCase().includes(query) ||
        (it.spdxIdentifier || '').toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [licenses, statusFilter, search])

  const projectName = activeProject ? (activeProject.projectName || activeProject.name) : 'Selected Project'
  const complianceRate = summary.totalDependencies > 0 
    ? Math.round((summary.approved / summary.totalDependencies) * 100) 
    : 100

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Project Context Bar */}
      <ProjectContextBar activeTab="licenses" />

      {/* 2. Editorial Hero Section */}
      <div className="hero-surface radial-glow p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#059669] text-xs font-bold uppercase tracking-wider">
              <FileCheck className="w-4 h-4" />
              <span>SPDX Licensing & Legal Screening</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              License Compliance Audit
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
              SPDX compliance evaluation, copyleft risk detection, and intellectual property clearance for dependencies in <strong className="text-[#101828]">{projectName}</strong>.
            </p>

            <div className="flex items-center flex-wrap gap-3 pt-2 text-xs text-[#667085]">
              <span>Compliance Rate: <strong className="text-emerald-700 font-mono">{complianceRate}%</strong></span>
              <span className="text-slate-300">•</span>
              <span>Audited: <strong className="text-[#101828] font-mono">{licenses.length} packages</strong></span>
            </div>
          </div>

          <button
            onClick={runAudit}
            disabled={analyzing || !activeProjectId}
            className="btn-primary text-xs self-start lg:self-auto flex-shrink-0"
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-emerald-400" />
            ) : (
              <Play className="w-4 h-4 mr-1.5 fill-white" />
            )}
            <span>{analyzing ? 'Scanning Licenses...' : 'Run License Audit'}</span>
          </button>
        </div>
      </div>

      {/* 3. Bento Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Approved */}
        <div className="saas-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Approved Permissive</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          </div>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">{summary.approved}</div>
          <p className="text-[11px] text-[#667085] mt-1">MIT, Apache-2.0, BSD-3-Clause</p>
        </div>

        {/* Review */}
        <div className="saas-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Review Required</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">{summary.review}</div>
          <p className="text-[11px] text-[#667085] mt-1">Copyleft or restricted terms</p>
        </div>

        {/* Unknown */}
        <div className="saas-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Unspecified / Missing</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
          </div>
          <div className="text-3xl font-black text-[#101828] font-mono mt-2">{summary.unknown}</div>
          <p className="text-[11px] text-[#667085] mt-1">Undeclared manifest fields</p>
        </div>
      </div>

      {/* 4. Controls & Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search package, license name..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#D0D5DD] rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-saas-xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            {['ALL', 'APPROVED', 'REVIEW', 'UNKNOWN'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="saas-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[#98A2B3] text-xs font-medium space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mx-auto" />
              <p>Auditing licenses for {projectName}...</p>
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-[#101828]">No matching licenses</h3>
              <p className="text-xs text-[#667085] max-w-md mx-auto">
                No package licenses match the selected criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Version</th>
                    <th>Detected License</th>
                    <th>SPDX Identifier</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.map((lic) => {
                    const st = (lic.complianceStatus || 'UNKNOWN').toUpperCase()
                    const badgeClass = LICENSE_BADGES[st] || 'saas-badge-neutral'

                    return (
                      <tr 
                        key={lic._id || `${lic.packageName}-${lic.detectedLicense}`}
                        onClick={() => setSelectedLicense(lic)}
                        className="cursor-pointer"
                      >
                        <td>
                          <span className="font-extrabold text-[#101828] font-mono text-xs hover:text-blue-600">
                            {lic.packageName}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs text-[#667085]">
                            {lic.packageVersion || '1.0.0'}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs font-bold text-[#101828]">
                            {lic.detectedLicense || 'MIT'}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono text-xs text-[#667085]">
                            {lic.spdxIdentifier || lic.detectedLicense || 'MIT'}
                          </span>
                        </td>

                        <td>
                          <span className="text-xs text-[#344054]">
                            {lic.category || 'Permissive'}
                          </span>
                        </td>

                        <td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                            {st}
                          </span>
                        </td>

                        <td className="text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedLicense(lic); }}
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
        </div>
      </div>

      {/* 5. Inspection Modal */}
      <AnimatePresence>
        {selectedLicense && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#E4E7EC] rounded-2xl max-w-lg w-full p-6 shadow-saas-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-[#101828] text-base">
                    {selectedLicense.packageName} License Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLicense(null)}
                  className="p-1 rounded-lg border border-[#E4E7EC] text-[#98A2B3] hover:text-[#101828]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
                  <span className="text-[10px] uppercase font-bold text-[#98A2B3] block">SPDX Identifier</span>
                  <span className="font-mono font-bold text-sm text-[#101828] mt-1 block">
                    {selectedLicense.spdxIdentifier || selectedLicense.detectedLicense || 'MIT'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#EAECF0]">
                  <span className="text-[10px] uppercase font-bold text-[#98A2B3] block">Compliance Status</span>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${LICENSE_BADGES[(selectedLicense.complianceStatus || 'UNKNOWN').toUpperCase()]}`}>
                    {(selectedLicense.complianceStatus || 'UNKNOWN').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-[#667085] leading-relaxed">
                Category classification: <strong className="text-[#101828]">{selectedLicense.category || 'Permissive'}</strong>. Evaluated against organizational open-source licensing policy.
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLicense(null)}
                  className="btn-primary text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
