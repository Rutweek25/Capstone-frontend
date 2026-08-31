import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FolderKanban, 
  UploadCloud, 
  RefreshCw, 
  Radio, 
  ChevronDown 
} from 'lucide-react'
import { useProjects } from '../context/ProjectContext'

export default function Navbar() {
  const { 
    projects, 
    selectedProject, 
    selectProjectById, 
    isDemoMode, 
    toggleDemoMode, 
    refreshProjects, 
    loading 
  } = useProjects()

  return (
    <header className="sticky top-0 z-20 h-16 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative flex items-center">
          <FolderKanban className="w-5 h-5 text-indigo-400 mr-2.5" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2 hidden sm:inline">
            Active Project:
          </span>
          <div className="relative">
            <select
              value={selectedProject?._id || ''}
              onChange={(e) => selectProjectById(e.target.value)}
              className="appearance-none bg-slate-900/90 text-white border border-slate-700/80 hover:border-indigo-500/50 rounded-xl px-4 py-2 pr-9 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer shadow-md transition-all"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id} className="bg-slate-900 text-white font-medium">
                  {p.projectName || p.name} ({p.ecosystem || 'npm'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {selectedProject && (
          <div className="hidden md:flex items-center space-x-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-mono text-[11px]">
              v{selectedProject.projectVersion || '1.0.0'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-black ${
              selectedProject.riskLevel === 'CRITICAL' || (selectedProject.averageRiskScore || 0) >= 90
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 badge-glow-rose'
                : selectedProject.riskLevel === 'HIGH' || (selectedProject.averageRiskScore || 0) >= 70
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 badge-glow-amber'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 badge-glow-emerald'
            }`}>
              Risk {selectedProject.averageRiskScore ?? 0} ({selectedProject.riskLevel || 'LOW'})
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={refreshProjects}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800"
          title="Refresh project list"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        <button
          onClick={toggleDemoMode}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            isDemoMode
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
          title="Toggle between Live API and Interactive Demo Data"
        >
          <Radio className={`w-3.5 h-3.5 ${isDemoMode ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
          <span>{isDemoMode ? 'Demo Mode' : 'Live API Connected'}</span>
        </button>

        <Link
          to="/upload"
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-500 to-teal-400 hover:from-indigo-500 hover:to-teal-300 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">Upload ZIP</span>
        </Link>
      </div>
    </header>
  )
}
