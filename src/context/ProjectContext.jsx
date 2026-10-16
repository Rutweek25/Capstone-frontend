import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const ProjectContext = createContext()

const DEMO_PROJECTS = [
  {
    _id: 'demo-proj-001',
    projectName: 'FinTech Payment Gateway',
    name: 'payment-gateway-service',
    projectVersion: '2.4.1',
    ecosystem: 'npm',
    packageManager: 'npm',
    analysisStatus: 'VALID',
    analyzedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    dependencyCounts: { total: 42, direct: 12, transitive: 30 },
    vulnerabilities: { total: 5, critical: 1, high: 2, medium: 2, low: 0 },
    approvedLicenses: 36,
    reviewLicenses: 4,
    unknownLicenses: 2,
    sbomStatus: 'VALID',
    averageRiskScore: 78,
    riskLevel: 'HIGH',
    policyStatus: 'PASSED'
  },
  {
    _id: 'demo-proj-002',
    projectName: 'OAuth2 Authentication API',
    name: 'auth-service-backend',
    projectVersion: '1.8.0',
    ecosystem: 'npm',
    packageManager: 'npm',
    analysisStatus: 'VALID',
    analyzedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    dependencyCounts: { total: 28, direct: 8, transitive: 20 },
    vulnerabilities: { total: 1, critical: 0, high: 0, medium: 1, low: 0 },
    approvedLicenses: 27,
    reviewLicenses: 1,
    unknownLicenses: 0,
    sbomStatus: 'VALID',
    averageRiskScore: 24,
    riskLevel: 'LOW',
    policyStatus: 'PASSED'
  }
]

const STORAGE_KEY = 'sdscc_active_project_id'

export function ProjectProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    isMemoryFallback: false,
    type: 'unknown',
    message: ''
  })

  const fetchLiveProjects = async (targetId = null) => {
    if (!isAuthenticated) {
      setProjects([])
      setSelectedProject(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setApiError(null)
    try {
      const [res, healthRes] = await Promise.allSettled([
        api.get('/projects'),
        api.get('/health')
      ])

      if (healthRes.status === 'fulfilled' && healthRes.value?.data?.database) {
        setDbStatus(healthRes.value.data.database)
      }

      const fetched = (res.status === 'fulfilled' && res.value?.data?.projects) || []
      setProjects(fetched)
      setIsDemoMode(Boolean(user?.isDemoAccount))

      // Safe parameter extraction: determine target string ID or project object
      let targetIdStr = null
      let projectMatch = null

      if (typeof targetId === 'string' && targetId.trim()) {
        targetIdStr = targetId.trim()
      } else if (targetId && typeof targetId === 'object') {
        // If it's a DOM / React SyntheticEvent (e.g. onClick), ignore it
        const isEvent = Boolean(targetId.nativeEvent || targetId._reactName || targetId.target)
        if (!isEvent && typeof targetId._id === 'string' && targetId._id.trim()) {
          targetIdStr = targetId._id.trim()
          projectMatch = targetId
        }
      }

      // Safe local storage fallback
      let storedId = targetIdStr
      if (!storedId) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (typeof raw === 'string' && raw.trim() && raw !== '[object Object]') {
            storedId = raw.trim()
          }
        } catch (e) {
          storedId = null
        }
      }

      if (fetched.length > 0) {
        let active = null
        if (typeof storedId === 'string' && storedId && !storedId.startsWith('demo-proj-')) {
          active = fetched.find(p => p._id === storedId || String(p._id) === storedId)
        }
        if (!active && projectMatch && projectMatch._id) {
          active = fetched.find(p => p._id === projectMatch._id || String(p._id) === String(projectMatch._id)) || projectMatch
        }
        if (!active) {
          active = fetched[0]
        }
        setSelectedProject(active)
        if (active && active._id) {
          localStorage.setItem(STORAGE_KEY, String(active._id))
        }
      } else if (projectMatch && projectMatch._id) {
        setSelectedProject(projectMatch)
        localStorage.setItem(STORAGE_KEY, String(projectMatch._id))
      } else {
        // Authenticated user with 0 projects starts with a pristine workspace
        setProjects([])
        setSelectedProject(null)
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Backend API connection failed:', err.message)
      // DO NOT inject demo data into real authenticated accounts
      if (user?.isDemoAccount) {
        setProjects(DEMO_PROJECTS)
        setSelectedProject(DEMO_PROJECTS[0])
        setIsDemoMode(true)
      } else {
        setProjects([])
        setSelectedProject(null)
        setApiError('Unable to load projects from server.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Reload projects whenever authentication state changes
  useEffect(() => {
    fetchLiveProjects()
  }, [isAuthenticated, user?.id])

  const selectProjectById = async (id) => {
    if (!id) return
    const proj = projects.find(p => p._id === id)
    if (proj) {
      setSelectedProject(proj)
      localStorage.setItem(STORAGE_KEY, proj._id)
      return proj
    }
    // If not found in current projects array, fetch from API
    try {
      const res = await api.get(`/projects/${id}`)
      if (res.data?.project) {
        const fetched = res.data.project
        setSelectedProject(fetched)
        localStorage.setItem(STORAGE_KEY, fetched._id)
        setProjects(prev => {
          const exists = prev.some(p => p._id === fetched._id)
          return exists ? prev.map(p => p._id === fetched._id ? fetched : p) : [fetched, ...prev]
        })
        return fetched
      }
    } catch (e) {
      // project not found or not owned by user
    }
    return null
  }

  const setCurrentProject = (project) => {
    if (!project) return
    setSelectedProject(project)
    localStorage.setItem(STORAGE_KEY, project._id)
    setProjects(prev => {
      const exists = prev.some(p => p._id === project._id)
      if (exists) {
        return prev.map(p => p._id === project._id ? project : p)
      }
      return [project, ...prev]
    })
  }

  const deleteProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`)
      setProjects(prev => prev.filter(p => p._id !== projectId))
      if (selectedProject?._id === projectId) {
        const remaining = projects.filter(p => p._id !== projectId)
        if (remaining.length > 0) {
          setSelectedProject(remaining[0])
          localStorage.setItem(STORAGE_KEY, remaining[0]._id)
        } else {
          setSelectedProject(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete project'
      return { success: false, message: msg }
    }
  }

  return (
    <ProjectContext.Provider value={{
      projects,
      selectedProject,
      activeProject: selectedProject,
      setSelectedProject: setCurrentProject,
      selectProjectById,
      deleteProject,
      loading,
      dbStatus,
      isDemoMode,
      apiError,
      refreshProjects: fetchLiveProjects
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('useProjects must be used within ProjectProvider')
  return context
}
