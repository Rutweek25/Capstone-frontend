import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProjectProvider } from './context/ProjectContext'
import Layout from './components/Layout'

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

export default function App() {
  return (
    <ProjectProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<Dashboard />} />
          <Route path="/upload" element={<UploadProject />} />
          
          <Route path="/dependencies" element={<Dependencies />} />
          <Route path="/projects/:id/dependencies" element={<Dependencies />} />
          
          <Route path="/graph" element={<DependencyGraphPage />} />
          <Route path="/projects/:id/graph" element={<DependencyGraphPage />} />
          
          <Route path="/vulnerabilities" element={<Vulnerabilities />} />
          <Route path="/projects/:id/vulnerabilities" element={<Vulnerabilities />} />
          
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/projects/:id/licenses" element={<Licenses />} />
          
          <Route path="/risk" element={<RiskAnalysis />} />
          <Route path="/projects/:id/risk" element={<RiskAnalysis />} />
          
          <Route path="/sbom" element={<SBOMPage />} />
          <Route path="/projects/:id/sbom" element={<SBOMPage />} />
          
          <Route path="/policies" element={<Policies />} />
          <Route path="/projects/:id/policies" element={<Policies />} />

          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/projects/:id/recommendations" element={<Recommendations />} />

          <Route path="/report" element={<ComplianceReport />} />
          <Route path="/projects/:id/report" element={<ComplianceReport />} />
        </Routes>
      </Layout>
    </ProjectProvider>
  )
}
