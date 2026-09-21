import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProjectProvider } from './context/ProjectContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Public Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Protected Application Pages
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import UploadProject from './pages/UploadProject'
import Dependencies from './pages/Dependencies'
import DependencyGraphPage from './pages/DependencyGraphPage'
import SBOMPage from './pages/SBOM'
import Vulnerabilities from './pages/Vulnerabilities'
import Licenses from './pages/Licenses'
import RiskAnalysis from './pages/RiskAnalysis'
import Policies from './pages/Policies'
import Recommendations from './pages/Recommendations'
import ComplianceReport from './pages/ComplianceReport'

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold font-mono text-sm animate-pulse">
          S
        </div>
      </div>
    )
  }
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <UploadProject />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dependencies"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dependencies />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/dependencies"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dependencies />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/graph"
            element={
              <ProtectedRoute>
                <Layout>
                  <DependencyGraphPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/graph"
            element={
              <ProtectedRoute>
                <Layout>
                  <DependencyGraphPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vulnerabilities"
            element={
              <ProtectedRoute>
                <Layout>
                  <Vulnerabilities />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/vulnerabilities"
            element={
              <ProtectedRoute>
                <Layout>
                  <Vulnerabilities />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/licenses"
            element={
              <ProtectedRoute>
                <Layout>
                  <Licenses />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/licenses"
            element={
              <ProtectedRoute>
                <Layout>
                  <Licenses />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/risk"
            element={
              <ProtectedRoute>
                <Layout>
                  <RiskAnalysis />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/risk"
            element={
              <ProtectedRoute>
                <Layout>
                  <RiskAnalysis />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sbom"
            element={
              <ProtectedRoute>
                <Layout>
                  <SBOMPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/sbom"
            element={
              <ProtectedRoute>
                <Layout>
                  <SBOMPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/policies"
            element={
              <ProtectedRoute>
                <Layout>
                  <Policies />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/policies"
            element={
              <ProtectedRoute>
                <Layout>
                  <Policies />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Layout>
                  <Recommendations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/recommendations"
            element={
              <ProtectedRoute>
                <Layout>
                  <Recommendations />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Layout>
                  <ComplianceReport />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/report"
            element={
              <ProtectedRoute>
                <Layout>
                  <ComplianceReport />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect unknown paths to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ProjectProvider>
    </AuthProvider>
  )
}
