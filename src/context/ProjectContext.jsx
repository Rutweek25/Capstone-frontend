import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

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
      setIsDemoMode(false)

      const storedId = targetId || localStorage.getItem(STORAGE_KEY)
      const projectMatch = targetId && typeof targetId === 'object' ? targetId : null

      if (fetched.length > 0) {
        let active = null
        if (storedId && !storedId.startsWith('demo-proj-')) {
          active = fetched.find(p => p._id === storedId)
        }
        if (!active && projectMatch) {
          active = projectMatch
        }
        if (!active) {
          active = fetched[0]
        }
        setSelectedProject(active)
        localStorage.setItem(STORAGE_KEY, active._id)
      } else if (projectMatch) {
        setSelectedProject(projectMatch)
        localStorage.setItem(STORAGE_KEY, projectMatch._id)
      } else {
        setProjects([])
        setSelectedProject(null)
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (err) {
      console.warn('Backend API connection failed:', err.message)
      const activeProject = selectedProject && !DEMO_PROJECTS.some(p => p._id === selectedProject._id)
        ? selectedProject
        : (targetId && typeof targetId === 'object' ? targetId : null)

      if (activeProject) {
        setProjects(prev => {
          const exists = prev.some(p => p._id === activeProject._id)
          if (exists) {
            return prev.map(p => p._id === activeProject._id ? activeProject : p)
          }
          return [activeProject, ...prev]
        })
        setSelectedProject(activeProject)
        setIsDemoMode(false)
        localStorage.setItem(STORAGE_KEY, activeProject._id)
        setApiError('Live API unavailable. Showing the current uploaded project in offline mode.')
      } else {
        setApiError('Unable to connect to Live API (http://localhost:5000/api). Running Demo Mode.')
        setProjects(DEMO_PROJECTS)
        setIsDemoMode(true)
        const storedId = targetId || localStorage.getItem(STORAGE_KEY)
        const active = DEMO_PROJECTS.find(p => p._id === storedId) || DEMO_PROJECTS[0]
        setSelectedProject(active)
        localStorage.setItem(STORAGE_KEY, active._id)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveProjects()
  }, [])

  const selectProjectById = async (id) => {
    if (!id) return
    const proj = projects.find(p => p._id === id)
    if (proj) {
      setSelectedProject(proj)
      localStorage.setItem(STORAGE_KEY, proj._id)
      return proj
    }
    // If not found in current projects array, attempt to fetch directly from API
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
      // project not found in API
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

  const toggleDemoMode = () => {
    if (isDemoMode) {
      setIsDemoMode(false)
      fetchLiveProjects()
    } else {
      setIsDemoMode(true)
      setProjects(DEMO_PROJECTS)
      setSelectedProject(DEMO_PROJECTS[0])
      localStorage.setItem(STORAGE_KEY, DEMO_PROJECTS[0]._id)
      setApiError(null)
    }
  }

  return (
    <ProjectContext.Provider value={{
      projects,
      selectedProject,
      activeProject: selectedProject,
      setSelectedProject: setCurrentProject,
      selectProjectById,
      loading,
      dbStatus,
      isDemoMode,
      apiError,
      toggleDemoMode,
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
