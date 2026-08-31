import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  ShieldAlert, 
  LayoutDashboard, 
  UploadCloud, 
  Layers, 
  GitFork, 
  Bug, 
  FileCheck, 
  AlertTriangle, 
  FileCode2, 
  CheckSquare, 
  Lightbulb,
  FileCheck2,
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { useProjects } from '../context/ProjectContext'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { selectedProject } = useProjects()
  const location = useLocation()

  const pid = selectedProject?._id || 'demo-proj-001'

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Upload & Scan', path: '/upload', icon: UploadCloud },
    { label: 'Dependencies', path: `/projects/${pid}/dependencies`, icon: Layers },
    { label: 'Dependency Graph', path: `/projects/${pid}/graph`, icon: GitFork },
    { label: 'Vulnerabilities', path: `/projects/${pid}/vulnerabilities`, icon: Bug },
    { label: 'License Compliance', path: `/projects/${pid}/licenses`, icon: FileCheck },
    { label: 'Risk Analysis', path: `/projects/${pid}/risk`, icon: AlertTriangle },
    { label: 'SBOM Generator', path: `/projects/${pid}/sbom`, icon: FileCode2 },
    { label: 'Policy Rules', path: `/projects/${pid}/policies`, icon: CheckSquare },
    { label: 'Recommendations', path: `/projects/${pid}/recommendations`, icon: Lightbulb },
    { label: 'Compliance Report', path: `/projects/${pid}/report`, icon: FileCheck2 }
  ]

  const isActive = (itemPath) => {
    if (itemPath === '/') return location.pathname === '/'
    if (itemPath === '/upload') return location.pathname === '/upload'
    const routeType = itemPath.split('/')[3]
    return location.pathname.includes(`/${routeType}`)
  }

  return (
    <aside className={`relative flex flex-col bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800/80 transition-all duration-300 z-30 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-teal-400 text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse-subtle" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                SDSCC
              </span>
              <span className="text-[10px] text-cyan-400 font-extrabold tracking-widest uppercase -mt-1">
                Security Hub
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={`group flex items-center px-3.5 py-3 rounded-2xl font-bold text-xs transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-indigo-600/25 to-cyan-500/15 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
              }`} />
              {!collapsed && (
                <span className="ml-3 truncate tracking-wide">{item.label}</span>
              )}
              {active && !collapsed && (
                <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-slate-200">Phase 8 Active</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Decision-Support Layer</p>
        </div>
      )}
    </aside>
  )
}
