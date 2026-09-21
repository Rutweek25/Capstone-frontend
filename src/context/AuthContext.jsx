import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Verify active session on load via server-side HttpOnly cookie check
  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const [meRes, healthRes] = await Promise.allSettled([
        api.get('/auth/me'),
        api.get('/health')
      ])

      if (healthRes.status === 'fulfilled' && healthRes.value?.data) {
        setIsDemoMode(Boolean(healthRes.value.data.demoMode))
      }

      if (meRes.status === 'fulfilled' && meRes.value?.data?.authenticated) {
        setUser(meRes.value.data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (err) {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  /**
   * Google Identity Services login/signup handler
   * Sends verified credential (ID token) to backend
   */
  const loginWithGoogle = async (credential) => {
    setAuthError(null)
    setIsLoading(true)
    try {
      const res = await api.post('/auth/google', { credential })
      if (res.data?.authenticated && res.data?.user) {
        setUser(res.data.user)
        setIsAuthenticated(true)
        return { success: true, user: res.data.user }
      } else {
        const msg = res.data?.message || 'Authentication failed. Please try again.'
        setAuthError(msg)
        return { success: false, message: msg }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to authenticate with Google. Please verify server connection.'
      setAuthError(msg)
      return { success: false, message: msg }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Developer login (active only when backend DEMO_MODE=true)
   */
  const devLogin = async () => {
    setAuthError(null)
    setIsLoading(true)
    try {
      const res = await api.post('/auth/dev-login')
      if (res.data?.authenticated && res.data?.user) {
        setUser(res.data.user)
        setIsAuthenticated(true)
        return { success: true, user: res.data.user }
      } else {
        const msg = res.data?.message || 'Demo login is disabled.'
        setAuthError(msg)
        return { success: false, message: msg }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Developer login failed.'
      setAuthError(msg)
      return { success: false, message: msg }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Log out: revokes session in DB and clears HttpOnly cookie
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.warn('Logout server request failed:', err.message)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setAuthError(null)
    }
  }

  const clearError = () => setAuthError(null)

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      authError,
      isDemoMode,
      loginWithGoogle,
      devLogin,
      logout,
      clearError,
      refreshAuth: checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
