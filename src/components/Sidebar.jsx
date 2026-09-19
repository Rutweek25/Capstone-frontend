import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FolderKanban, 
  Layers, 
  GitFork, 
  Bug, 
  FileCheck, 
  Scale, 
  FileCode2, 
  CheckSquare, 
  Lightbulb, 
  FileCheck2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { useProjects } from '../context/ProjectContext'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { selectedProject } = useProjects()
  const location = useLocation()

  const pid = selectedProject?._id

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Overview', path: '/', icon: LayoutDashboard },
        { label: 'Projects', path: '/projects', icon: FolderKanban }
      ]
    },
    {
      title: 'Analysis',
      items: [
        { label: 'Dependencies', path: pid ? `/projects/${pid}/dependencies` : '/dependencies', icon: Layers },
        { label: 'Dependency Graph', path: pid ? `/projects/${pid}/graph` : '/graph', icon: GitFork },
        { label: 'Vulnerabilities', path: pid ? `/projects/${pid}/vulnerabilities` : '/vulnerabilities', icon: Bug },
        { label: 'Licenses', path: pid ? `/projects/${pid}/licenses` : '/licenses', icon: FileCheck },
        { label: 'Risk Analysis', path: pid ? `/projects/${pid}/risk` : '/risk', icon: Scale }
      ]
    },
    {
      title: 'Compliance',
      items: [
        { label: 'SBOM', path: pid ? `/projects/${pid}/sbom` : '/sbom', icon: FileCode2 },
        { label: 'Policy Rules', path: pid ? `/projects/${pid}/policies` : '/policies', icon: CheckSquare },
        { label: 'Recommendations', path: pid ? `/projects/${pid}/recommendations` : '/recommendations', icon: Lightbulb },
        { label: 'Compliance Reports', path: pid ? `/projects/${pid}/report` : '/report', icon: FileCheck2 }
      ]
    }
  ]

  const isActive = (itemPath) => {
    if (itemPath === '/') return location.pathname === '/'
    if (itemPath === '/projects') return location.pathname === '/projects'
    const parts = itemPath.split('/')
    const routeType = parts[parts.length - 1]
    return location.pathname.endsWith(`/${routeType}`) || location.pathname.includes(`/${routeType}/`)
  }

  return (
    <aside 
      className={`relative flex flex-col bg-white border-r border-[#E4E7EC] transition-all duration-200 z-30 flex-shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#E4E7EC]">
        <div className="flex items-center space-x-3 overflow-hidden">
          {/* Shield icon with subtle brand blue gradient inside icon only */}
          <div className="w-9 h-9 rounded-xl bg-[#101828] flex items-center justify-center flex-shrink-0 shadow-saas-xs border border-slate-800">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                fill="url(#shieldGrad)"
                stroke="#93C5FD"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight text-[#101828]">
                SDSCC
              </span>
              <span className="text-[10px] text-[#667085] font-semibold tracking-wide uppercase truncate -mt-0.5">
                Security & Compliance
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg border border-[#E4E7EC] hover:bg-slate-50 text-[#667085] hover:text-[#101828] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#98A2B3]">
                  {group.title}
                </span>
              </div>
            )}

            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex items-center px-3 py-2 rounded-xl font-medium text-xs transition-all duration-150 ${
                    active
                      ? 'bg-blue-50/70 text-[#101828] font-semibold'
                      : 'text-[#667085] hover:text-[#101828] hover:bg-slate-50'
                  }`}
                >
                  {/* Subtle 3px left rounded accent bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#2563EB] rounded-r-full"></span>
                  )}
                  <Icon 
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      active ? 'text-[#2563EB]' : 'text-[#98A2B3] group-hover:text-[#475467]'
                    }`} 
                  />
                  {!collapsed && (
                    <span className="ml-3 truncate tracking-tight">{item.label}</span>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Status Panel */}
      <div className="p-3 border-t border-[#E4E7EC]">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#101828]">Security Platform</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-[#667085] leading-relaxed">
              Static dependency audit & multi-project isolation engine.
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="SDSCC Engine Active"></span>
          </div>
        )}
      </div>
    </aside>
  )
}
