import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Loader2, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react'

export default function GoogleAuthButton({ isSignup = false }) {
  const { loginWithGoogle, devLogin, authError, clearError, isDemoMode } = useAuth()
  const [loading, setLoading] = useState(false)
  const [gisLoaded, setGisLoaded] = useState(false)
  const [clientId, setClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '')
  const googleBtnRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // If clientId is empty or placeholder in Vite env, query backend /api/auth/config
  useEffect(() => {
    if (!clientId || clientId.includes('your_google_client_id') || clientId.includes('your-google-client-id')) {
      api.get('/auth/config')
        .then(res => {
          if (res.data?.googleClientId) {
            setClientId(res.data.googleClientId)
          }
        })
        .catch(() => {})
    }
  }, [clientId])

  const isClientIdConfigured = Boolean(
    clientId && 
    !clientId.includes('your_google_client_id') && 
    !clientId.includes('your-google-client-id')
  )

  const from = location.state?.from?.pathname || '/dashboard'

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      return
    }
    setLoading(true)
    clearError()
    try {
      const result = await loginWithGoogle(response.credential)
      if (result.success) {
        navigate(from, { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  // Check for window.google GIS SDK availability
  useEffect(() => {
    const checkGis = () => {
      if (window.google?.accounts?.id) {
        setGisLoaded(true)
        return true
      }
      return false
    }

    if (checkGis()) return

    const interval = setInterval(() => {
      if (checkGis()) clearInterval(interval)
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // Initialize and render the official Google button
  useEffect(() => {
    if (!gisLoaded || !isClientIdConfigured || !googleBtnRef.current) return

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      })

      // Clean container first
      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          text: isSignup ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 320
        })
      }
    } catch (e) {
      console.warn('GIS button render error:', e)
    }
  }, [gisLoaded, isClientIdConfigured, isSignup, clientId])

  const handleDevLogin = async () => {
    setLoading(true)
    clearError()
    try {
      const result = await devLogin()
      if (result.success) {
        navigate(from, { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Auth Error Notification */}
      {authError && (
        <div className="w-full p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Authentication Notice</span>
            <span>{authError}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center space-x-2 text-xs text-neutral-600 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
          <span>Verifying credentials with server...</span>
        </div>
      )}

      {/* Official Google Identity Services Button Container */}
      {isClientIdConfigured ? (
        <div className="w-full flex justify-center py-1">
          <div ref={googleBtnRef} className="min-h-[44px] flex justify-center" />
        </div>
      ) : (
        /* Configuration Guidance & Fallback */
        <div className="w-full space-y-3">
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 text-xs space-y-1.5 text-left">
            <div className="flex items-center space-x-1.5 font-semibold text-neutral-900">
              <ShieldAlert className="w-4 h-4 text-neutral-800" />
              <span>Google OAuth Configuration</span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              To enable real Google Sign-In, add your client ID from Google Cloud Console to <code className="bg-neutral-200 px-1 py-0.5 rounded font-mono text-[10px]">frontend/.env</code> as <code className="bg-neutral-200 px-1 py-0.5 rounded font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID</code>.
            </p>
          </div>

          {/* Dev/Demo One-Click Login Button (Active ONLY when DEMO_MODE=true) */}
          {isDemoMode && (
            <button
              onClick={handleDevLogin}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Continue with Demo / Developer Account</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
