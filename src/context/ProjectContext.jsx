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

  const fetchLiveProjects = async (targetId = null) => {
    setLoading(true)
    setApiError(null)
    try {
      const res = await api.get('/projects')
      const fetched = res.data?.projects || []
      setProjects(fetched)
      setIsDemoMode(false)

      const storedId = targetId || localStorage.getItem(STORAGE_KEY)

      if (fetched.length > 0) {
        let active = null
        if (storedId) {
          active = fetched.find(p => p._id === storedId)
        }
        if (!active) {
          active = fetched[0]
        }
        setSelectedProject(active)
        localStorage.setItem(STORAGE_KEY, active._id)
      } else {
        setSelectedProject(null)
      }
    } catch (err) {
      console.warn('Backend API connection failed:', err.message)
      setApiError('Unable to connect to Live API (http://localhost:5000/api). Running Demo Mode.')
      setProjects(DEMO_PROJECTS)
      setIsDemoMode(true)
      const storedId = targetId || localStorage.getItem(STORAGE_KEY)
      const active = DEMO_PROJECTS.find(p => p._id === storedId) || DEMO_PROJECTS[0]
      setSelectedProject(active)
      localStorage.setItem(STORAGE_KEY, active._id)
    } font: {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveProjects()
  }, [])

  const selectProjectById = (id) => {
    if (!id) return
    const proj = projects.find(p => p._id === id)
    if (proj) {
      setSelectedProject(proj)
      localStorage.setItem(STORAGE_KEY, proj._id)
    }
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
      setSelectedProject: setCurrentProject,
      selectProjectById,
      loading,
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
