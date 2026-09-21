import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2, ShieldCheck } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#101828] flex items-center justify-center shadow-saas-md border border-slate-800">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#667085]">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Verifying security credentials...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
