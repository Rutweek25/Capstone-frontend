import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  Check,
  GitBranch,
  Globe,
  RotateCcw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react'
import GithubIcon from '../components/GithubIcon'
import api from '../services/api'
import { useProjects } from '../context/ProjectContext'

const PIPELINE_STAGES = [
  { step: '01', title: 'Source Ingestion', desc: 'Secure ZIP staging / GitHub archive fetch', icon: UploadCloud },
  { step: '02', title: 'Static Scan', desc: 'Manifest extraction & parsing', icon: FileArchive },
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
  const [sourceType, setSourceType] = useState('zip') // 'zip' | 'github'
  
  // ZIP Workflow States
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [project, setProject] = useState(null)

  // GitHub Workflow States
  const [githubUrl, setGithubUrl] = useState('')
  const [githubBranch, setGithubBranch] = useState('')
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubProgressStage, setGithubProgressStage] = useState('')
  const [duplicateProject, setDuplicateProject] = useState(null)

  const { refreshProjects, setSelectedProject } = useProjects()
  const navigate = useNavigate()

  // --- ZIP Handlers ---
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

  // --- GitHub Handlers ---
  const handleAnalyzeGithub = async (forceReanalyze = false) => {
    if (!githubUrl.trim()) {
      setError('Please enter a valid public GitHub repository URL.')
      return
    }

    setError('')
    setDuplicateProject(null)
    setGithubLoading(true)
    setGithubProgressStage('Validating repository and resolving branch...')

    try {
      // Step 1: Pre-flight validation
      setGithubProgressStage('Connecting to GitHub and checking repository access...')
      const valRes = await api.post('/projects/github/validate', {
        repositoryUrl: githubUrl.trim(),
        branch: githubBranch.trim() || undefined
      })

      if (!valRes.data?.valid) {
        throw new Error(valRes.data?.error || 'Invalid GitHub repository.')
      }

      // Step 2: Trigger analysis
      setGithubProgressStage(`Resolved commit ${valRes.data.commitSha.slice(0, 7)}. Fetching repository archive...`)

      const res = await api.post('/projects/from-github', {
        repositoryUrl: githubUrl.trim(),
        branch: githubBranch.trim() || undefined,
        forceReanalyze
      })

      // Check if duplicate detection triggered
      if (res.data?.duplicate) {
        setDuplicateProject(res.data.project)
        setGithubLoading(false)
        setGithubProgressStage('')
        return
      }

      setGithubProgressStage('Executing supply chain security analysis pipeline...')
      const newProject = res.data?.project
      if (newProject) {
        setSelectedProject(newProject)
        refreshProjects(newProject._id)
        setMessage('GitHub analysis completed successfully! Redirecting...')
        setTimeout(() => {
          navigate(`/projects/${newProject._id}/dependencies`)
        }, 1200)
      }
    } catch (err) {
      console.warn('GitHub ingestion error:', err)
      const errDetail = err.response?.data?.message || err.response?.data?.detail || err.message || 'GitHub analysis failed.'
      setError(errDetail)
    } finally {
      setGithubLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Editorial Page Header */}
      <div>
        <div className="flex items-center space-x-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <FolderKanban className="w-4 h-4" />
          <span>Artifact Ingestion & Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
          Add New Project
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1 leading-relaxed">
          Choose how you want to analyze your software project. Ingest directly from GitHub or upload a local archive to initiate the automated 11-stage supply chain security, license compliance, and SBOM generation pipeline.
        </p>
      </div>

      {/* Dual Source Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Source Option A: Upload ZIP */}
        <button
          type="button"
          onClick={() => {
            setSourceType('zip')
            setError('')
            setDuplicateProject(null)
          }}
          className={`p-5 rounded-2xl border-2 text-left transition-all relative ${
            sourceType === 'zip'
              ? 'border-blue-600 bg-blue-50/20 shadow-saas-sm'
              : 'border-[#E4E7EC] bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              sourceType === 'zip' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              <UploadCloud className="w-5 h-5" />
            </div>
            {sourceType === 'zip' && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>
          <h3 className="font-bold text-[#101828] text-sm">UPLOAD ZIP</h3>
          <p className="text-xs text-[#667085] mt-1 leading-relaxed">
            Analyze a local project archive (.zip containing package.json).
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-blue-600">
            <span>Choose ZIP Archive</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>

        {/* Source Option B: GitHub Repository */}
        <button
          type="button"
          onClick={() => {
            setSourceType('github')
            setError('')
            setDuplicateProject(null)
          }}
          className={`p-5 rounded-2xl border-2 text-left transition-all relative ${
            sourceType === 'github'
              ? 'border-blue-600 bg-blue-50/20 shadow-saas-sm'
              : 'border-[#E4E7EC] bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              sourceType === 'github' ? 'bg-[#111318] text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              <GithubIcon className="w-5 h-5" />
            </div>
            {sourceType === 'github' && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-[#101828] text-sm">GITHUB REPOSITORY</h3>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              PUBLIC ONLY
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-1 leading-relaxed">
            Analyze a repository directly from GitHub with commit tracking.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-neutral-900">
            <span>Analyze Repository</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Analysis Notice</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Duplicate Repository Commit Modal Alert */}
      {duplicateProject && (
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-3">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span className="font-bold text-sm block text-amber-950">
                This repository commit has already been analyzed.
              </span>
              <p className="text-amber-800 leading-relaxed">
                Project <strong>{duplicateProject.name}</strong> was already scanned at commit{' '}
                <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">
                  {duplicateProject.github?.commitSha?.slice(0, 7) || 'latest'}
                </code>
                . You can review the existing findings or re-run a fresh analysis.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={() => navigate(`/projects/${duplicateProject._id}/dependencies`)}
              className="btn-primary text-xs py-1.5 px-3"
            >
              Open Existing Analysis
            </button>
            <button
              onClick={() => handleAnalyzeGithub(true)}
              disabled={githubLoading}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Analyze Again
            </button>
          </div>
        </div>
      )}

      {/* SOURCE 1: GITHUB REPOSITORY INGESTION FORM */}
      {sourceType === 'github' && (
        <div className="saas-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#111318] text-white flex items-center justify-center">
                <GithubIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#101828]">GitHub Repository Target</h2>
                <p className="text-xs text-[#667085]">Static manifest screening for public repositories</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Public repositories only</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="repoUrl" className="block text-xs font-bold text-[#101828] uppercase tracking-wider mb-1.5">
                Repository URL <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="repoUrl"
                  type="url"
                  placeholder="https://github.com/owner/repository"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  disabled={githubLoading}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D0D5DD] text-xs font-mono text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                Standard GitHub HTTPS URL (e.g., https://github.com/expressjs/express)
              </span>
            </div>

            <div>
              <label htmlFor="repoBranch" className="block text-xs font-bold text-[#101828] uppercase tracking-wider mb-1.5">
                Branch <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="repoBranch"
                  type="text"
                  placeholder="main"
                  value={githubBranch}
                  onChange={(e) => setGithubBranch(e.target.value)}
                  disabled={githubLoading}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D0D5DD] text-xs font-mono text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
              <span className="text-[11px] text-[#667085] mt-1 block">
                Leave empty to automatically use the repository's default branch (e.g. main or master).
              </span>
            </div>
          </div>

          {/* GitHub Progress Status */}
          {githubLoading && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center space-x-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
              <div className="flex-1 font-mono">
                <span>{githubProgressStage || 'Processing GitHub repository...'}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-[#667085]">
              No repository code is ever executed. Static manifest discovery only.
            </span>
            <button
              onClick={() => handleAnalyzeGithub(false)}
              disabled={githubLoading || !githubUrl.trim()}
              type="button"
              className="btn-primary text-xs py-2.5 px-5 font-bold flex items-center space-x-2"
            >
              {githubLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1.5" />
                  <span>ANALYZE REPOSITORY</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SOURCE 2: LOCAL ZIP ARCHIVE INGESTION FORM */}
      {sourceType === 'zip' && (
        <div className="saas-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#101828]">Upload Project ZIP Archive</h2>
                <p className="text-xs text-[#667085]">Accepts local compressed archives containing package.json</p>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-mono">.zip format</span>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragActive 
                  ? 'border-blue-600 bg-blue-50/50' 
                  : file 
                  ? 'border-emerald-500 bg-emerald-50/20' 
                  : 'border-[#D0D5DD] hover:border-slate-400 bg-[#F9FAFB]'
              }`}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E4E7EC] flex items-center justify-center mx-auto text-[#101828] shadow-saas-xs">
                  {file ? (
                    <FileCheck2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <UploadCloud className="w-6 h-6 text-[#667085]" />
                  )}
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#101828]">
                    {file ? (
                      <span className="text-emerald-700 font-mono">{file.name}</span>
                    ) : (
                      <>
                        <span className="text-blue-600 hover:underline">Click to browse</span> or drag and drop archive
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-[#667085] mt-1">
                    Standard Node.js / npm ZIP archive containing <code className="bg-slate-200 px-1 rounded">package.json</code> (max 200MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#667085] font-mono">
                  <span>Staging archive safely...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="submit"
                disabled={!file || uploading || project}
                className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 mr-1.5" />
                    <span>Upload ZIP</span>
                  </>
                )}
              </button>

              {project && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-700 border-emerald-700 font-bold"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1.5" />
                      <span>Start Pipeline Scan</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* 11-Stage Pipeline Architecture Overview */}
      <div className="saas-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Analysis Pipeline Architecture</span>
          <span className="text-[11px] text-blue-600 font-semibold font-mono">11 Automated Stages</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
          {PIPELINE_STAGES.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.step} className="p-2.5 rounded-xl border border-slate-200 bg-white/60 flex items-start space-x-2">
                <span className="font-mono text-[9px] text-slate-400 font-bold">{s.step}</span>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1">
                    <Icon className="w-3 h-3 text-blue-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-[#101828] truncate">{s.title}</span>
                  </div>
                  <p className="text-[10px] text-[#667085] truncate mt-0.5">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
