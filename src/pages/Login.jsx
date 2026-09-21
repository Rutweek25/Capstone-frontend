import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { Shield, ArrowLeft } from 'lucide-react'

export default function Login() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="p-6 md:p-8 flex items-center justify-between border-b border-neutral-900">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-neutral-400 hover:text-white text-xs font-mono tracking-wider transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO EDITORIAL</span>
        </Link>
        <div className="text-xs font-mono tracking-widest text-neutral-500 uppercase">
          SDSCC // SEC-AUTH-01
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 p-8 md:p-10 rounded-2xl shadow-2xl space-y-8">
          {/* Brand Mark */}
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black mb-2 shadow-sm">
              <Shield className="w-5 h-5 fill-black stroke-black" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-white">
              Welcome Back.
            </h1>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
              Sign in to continue to your software security and compliance workspace.
            </p>
          </div>

          {/* Auth Action */}
          <div className="pt-2">
            <GoogleAuthButton isSignup={false} />
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-800 w-full" />
            <span className="bg-neutral-950 px-3 text-[10px] uppercase font-mono tracking-widest text-neutral-500">
              Zero Trust Verification
            </span>
          </div>

          {/* Switch to Signup */}
          <div className="text-center text-xs text-neutral-400">
            <span>Don't have an account? </span>
            <Link 
              to="/signup" 
              className="text-white font-medium underline underline-offset-4 hover:text-neutral-300 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Colophon */}
      <footer className="p-6 text-center text-[10px] font-mono text-neutral-600 border-t border-neutral-900 tracking-wider">
        SDSCC PLATFORM // CRYPTOGRAPHICALLY VERIFIED GOOGLE OPENID CONNECT
      </footer>
    </div>
  )
}
