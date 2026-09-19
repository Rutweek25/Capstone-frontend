import React from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useProjects } from '../context/ProjectContext'

export default function Layout({ children }) {
  const { dbStatus } = useProjects()

  return (
    <div className="flex h-screen bg-[#F7F8FA] text-[#101828] overflow-hidden antialiased">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        {/* Notice when running in in-memory fallback */}
        {dbStatus?.isMemoryFallback && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] uppercase tracking-wider">
                Demo Mode
              </span>
              <span>
                Operating on local in-memory fallback database with authentic seeded fixtures (MongoDB Atlas is currently unreachable).
              </span>
            </div>
            <span className="text-[11px] text-amber-700 font-mono hidden md:inline">
              MongoMemoryServer Active
            </span>
          </div>
        )}

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#F7F8FA]">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
