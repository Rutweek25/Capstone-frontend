import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  FolderKanban, 
  UploadCloud, 
  RefreshCw, 
  Radio, 
  ChevronDown,
  Search,
  SlidersHorizontal,
  Layers,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react'
import { useProjects } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { 
    projects, 
    selectedProject, 
    selectProjectById, 
    dbStatus,
    refreshProjects, 
    loading 
  } = useProjects()

  const { user, logout, isDemoMode } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
  const location = useLocation()

  const handleProjectSelect = (projectId) => {
    selectProjectById(projectId)
    // If currently on a project subpage, keep user on same section
    const match = location.pathname.match(/^\/projects\/[^\/]+(\/.*)$/)
    if (match) {
      navigate(`/projects/${projectId}${match[1]}`)
    } else {
      const sections = ['dependencies', 'graph', 'vulnerabilities', 'licenses', 'risk', 'sbom', 'policies', 'recommendations', 'report']
      const found = sections.find(s => location.pathname.includes('/' + s))
      if (found) {
        navigate(`/projects/${projectId}/${found}`)
      }
    }
  }

  // Generate breadcrumb path
  const getBreadcrumb = () => {
    const path = location.pathname
    if (path === '/') return { root: 'Dashboard', sub: 'Overview' }
    if (path === '/projects') return { root: 'Projects', sub: 'Portfolio' }
    if (path === '/upload') return { root: 'Projects', sub: 'Upload & Scan' }
    
    const pName = selectedProject?.projectName || selectedProject?.name || 'Project'
    const sectionMatch = path.split('/').filter(Boolean).pop()
    const sectionNames = {
      dependencies: 'Dependencies',
      graph: 'Dependency Graph',
      vulnerabilities: 'Vulnerabilities',
      licenses: 'License Compliance',
      risk: 'Risk Analysis',
      sbom: 'Software Bill of Materials',
      policies: 'Policy Rules',
      recommendations: 'Recommendations',
      report: 'Compliance Report'
    }
    return {
      root: pName,
      sub: sectionNames[sectionMatch] || sectionMatch
    }
  }

  const breadcrumb = getBreadcrumb()

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#E7E9EE] px-6 flex items-center justify-between flex-shrink-0">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-3 text-xs">
        <Link 
          to="/projects"
          className="text-[#69707D] hover:text-[#111318] font-medium transition-colors"
        >
          {breadcrumb.root}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-[#111318] tracking-tight">
          {breadcrumb.sub}
        </span>
      </div>

      {/* Center/Right: Project Selector & Actions */}
      <div className="flex items-center space-x-3">
        {/* Project Selector */}
        <div className="relative flex items-center">
          <label htmlFor="top-project-select" className="sr-only">Select Project</label>
          <div className="relative">
            <select
              id="top-project-select"
              value={selectedProject?._id || ''}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100/80 text-[#111318] border border-[#E7E9EE] hover:border-slate-300 rounded-xl px-3 py-1.5 pr-8 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-saas-xs transition-all max-w-[200px] sm:max-w-[260px] truncate"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id} className="bg-white text-[#111318]">
                  {p.projectName || p.name} (v{p.projectVersion || '1.0.0'})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Refresh Project Data */}
        <button
          onClick={refreshProjects}
          disabled={loading}
          className="p-1.5 rounded-xl border border-[#E7E9EE] hover:bg-slate-50 text-slate-500 hover:text-[#111318] transition-colors"
          title="Refresh project list"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Live vs Fallback DB Mode Badge */}
        {dbStatus?.isMemoryFallback ? (
          <div
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-[11px] font-semibold"
            title="Notice: Operating in In-Memory Demo Fallback Mode with seeded test data"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Demo Mode (In-Memory DB)</span>
          </div>
        ) : dbStatus?.connected ? (
          <div
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-semibold"
            title="Connected to Live Production Database"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Atlas Production DB</span>
          </div>
        ) : (
          <div
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-[11px] font-semibold"
            title="Connecting to Database..."
          >
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
            <span>Connecting...</span>
          </div>
        )}

        {/* Add Project CTA */}
        <Link
          to="/upload"
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#111318] hover:bg-slate-800 text-white font-semibold text-xs shadow-saas-xs transition-all"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Add Project</span>
        </Link>

        {/* User Profile Area */}
        {user && (
          <div className="relative pl-2 border-l border-slate-200" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
              title="User Account"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#111318] max-w-[120px] truncate leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 max-w-[120px] truncate leading-tight">
                  {user.email}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-saas-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{user.name}</span>
                    {user.isDemoAccount && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        Demo
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate">{user.email}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <Link
                    to="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Editorial Landing Page</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="font-semibold">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
