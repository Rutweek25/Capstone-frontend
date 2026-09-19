import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  UploadCloud, 
  FileArchive, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Loader2, 
  ArrowRight, 
  Package, 
  ShieldCheck,
  FolderKanban,
  FileCode2,
  FileCheck2,
  Info,
  Layers,
  Network,
  Binary,
  Scale,
  Activity,
  Sliders,
  Sparkles,
  Award,
  Check
} from 'lucide-react'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'

const PIPELINE_STAGES = [
  { step: '01', title: 'Upload', desc: 'Secure ZIP staging & validation', icon: UploadCloud },
  { step: '02', title: 'Scan', desc: 'Manifest extraction & parsing', icon: FileArchive },
  { step: '03', title: 'Discovery', desc: 'Direct & transitive package tree', icon: Package },
  { step: '04', title: 'Graph', desc: 'Cyclic dependency resolution', icon: Network },
  { step: '05', title: 'SBOM', desc: 'CycloneDX 1.4 specification', icon: Binary },
  { step: '06', title: 'Vulnerabilities', desc: 'OSV advisory batch screening', icon: ShieldCheck },
  { step: '07', title: 'Licenses', desc: 'SPDX open-source compliance', icon: Scale },
  { step: '08', title: 'Risk Engine', desc: 'Multi-factor score calculation', icon: Activity },
  { step: '09', title: 'Policy Rules', desc: 'Automated threshold checks', icon: Sliders },
  { step: '10', title: 'Remediation', desc: 'Actionable fix recommendations', icon: Sparkles },
  { step: '11', title: 'Report', desc: 'Executive audit attestation', icon: Award }
]

export default function UploadProject() {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [project, setProject] = useState(null)

  const { refreshProjects, setSelectedProject } = useProjects()
  const navigate = useNavigate()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.name.endsWith('.zip')) {
        setFile(droppedFile)
        setError('')
      } else {
        setError('Only .zip archive files containing package.json are supported.')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (selected.name.endsWith('.zip')) {
        setFile(selected)
        setError('')
      } else {
        setError('Only .zip archive files containing package.json are supported.')
      }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return setError('Please select or drop a project ZIP archive.')

    setUploading(true)
    setError('')
    setMessage('Uploading and verifying archive safely...')
    setUploadProgress(15)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/projects/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        }
      })

      const uploadedProj = res.data.project
      setProject(uploadedProj)
      setSelectedProject(uploadedProj)
      setMessage('Archive uploaded successfully! Manifest detected.')
      refreshProjects(uploadedProj._id)
    } catch (err) {
      console.warn('Upload error:', err)
      setError('Failed to upload archive. Please verify that the file contains package.json.')
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!project) return
    setAnalyzing(true)
    setMessage('Parsing dependency trees, auditing SPDX licenses, querying OSV advisories & evaluating policies...')
    setError('')

    try {
      const res = await api.post(`/projects/${project._id}/analyze`)
      const analyzed = res.data.project || project
      setProject(analyzed)
      setSelectedProject(analyzed)
      setMessage('Analysis complete! Redirecting to dependency inventory...')
      refreshProjects(analyzed._id)

      setTimeout(() => {
        navigate(`/projects/${analyzed._id}/dependencies`)
      }, 1000)
    } catch (err) {
      console.warn('Analysis error:', err)
      setError('Analysis failed. Please inspect server logs or try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Editorial Page Header */}
      <div>
        <div className="flex items-center space-x-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <UploadCloud className="w-4 h-4" />
          <span>Artifact Ingestion & Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
          Upload & Scan Project Archive
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1 leading-relaxed">
          Upload your Node.js application repository ZIP archive to initiate the automated 11-stage supply chain security, license compliance, and SBOM generation pipeline.
        </p>
      </div>

      {/* 11-Stage Pipeline Visual Architecture */}
      <div className="saas-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Analysis Pipeline Architecture</span>
          <span className="text-[11px] text-blue-600 font-semibold font-mono">11 Automated Stages</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {PIPELINE_STAGES.map((stage, i) => {
            const IconComponent = stage.icon
            return (
              <div 
                key={stage.step}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  analyzing 
                    ? 'border-blue-200 bg-blue-50/40 text-blue-900' 
                    : project 
                      ? 'border-emerald-100 bg-emerald-50/30 text-slate-800'
                      : 'border-[#E4E7EC] bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>{stage.step}</span>
                  <IconComponent className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="font-bold text-[#101828] truncate">{stage.title}</div>
                <div className="text-[10px] text-[#667085] truncate mt-0.5">{stage.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upload Dropzone Card */}
      <div className="saas-card p-6 sm:p-8 space-y-6">
        <form onSubmit={handleUpload} className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
              dragActive 
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
                : 'border-[#E4E7EC] hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E4E7EC] shadow-saas-xs flex items-center justify-center mx-auto text-blue-600 mb-4 transition-transform hover:scale-105">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-sm sm:text-base font-bold text-[#101828]">
                {file ? file.name : 'Click to select or drag & drop ZIP repository'}
              </p>
              <p className="text-xs text-[#667085]">
                Node.js archives containing <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">package.json</code> and optional lockfile (Up to 100MB)
              </p>
            </div>

            {file && (
              <div className="mt-4 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E4E7EC] text-xs font-mono text-[#101828] shadow-saas-xs">
                <FileArchive className="w-4 h-4 text-blue-600" />
                <span>{file.name}</span>
                <span className="text-slate-400 font-normal">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {!project && (
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-saas-xs transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <UploadCloud className="w-4 h-4" />}
              <span>{uploading ? 'Extracting & Ingesting Repository...' : 'Upload & Verify Manifest'}</span>
            </button>
          )}
        </form>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#667085]">
              <span>Ingestion progress</span>
              <span className="font-mono font-semibold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Messages */}
        {message && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="leading-relaxed">{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Analysis Trigger Zone */}
        {project && (
          <div className="pt-4 border-t border-[#E4E7EC] space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E4E7EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Staged Target Archive</span>
                <h4 className="text-sm font-bold text-[#101828] font-mono mt-0.5">{project.name || file?.name}</h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold saas-badge-pass">
                STAGED & VALIDATED
              </span>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-saas-xs transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{analyzing ? 'Executing Comprehensive Security Pipeline...' : 'Start Comprehensive Security Analysis'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Safety & Non-Intrusive Guidance Banner */}
      <div className="saas-card p-5 bg-[#F8FAFC] text-xs text-[#667085] space-y-1.5">
        <div className="flex items-center space-x-2 font-bold text-[#101828]">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Static Analysis Safety Guarantee</span>
        </div>
        <p className="leading-relaxed">
          SDSCC performs non-intrusive static manifest inspection. It enforces strict Zip Slip path traversal mitigation, never executes untrusted code, and does not alter repository source files.
        </p>
      </div>
    </div>
  )
}
