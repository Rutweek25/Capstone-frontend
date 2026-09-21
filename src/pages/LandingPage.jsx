import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  ArrowRight, 
  Shield, 
  Terminal, 
  GitFork, 
  FileCode2, 
  FileCheck2, 
  Binary, 
  Layers, 
  Activity, 
  Sliders, 
  Check, 
  ChevronRight,
  ExternalLink
} from 'lucide-react'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans selection:bg-white selection:text-black">
      {/* 1. Masthead Navigation */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-neutral-900 px-6 lg:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold font-mono text-sm tracking-tighter">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-widest text-white uppercase group-hover:text-neutral-300 transition-colors">
                SDSCC
              </span>
              <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest -mt-1 hidden sm:inline">
                Security Core
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-1 pl-4 border-l border-neutral-800 text-[11px] font-mono tracking-wider text-neutral-500">
            <span>ISSUE // 2026.04</span>
            <span className="text-neutral-700">|</span>
            <span>EDITION: ZERO-TRUST</span>
          </div>
        </div>

        {/* Center Editorial Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-xs font-mono uppercase tracking-widest text-neutral-400">
          <a href="#platform" className="hover:text-white transition-colors">Platform</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-5 py-2.5 rounded bg-white text-black text-xs font-mono font-semibold tracking-wider hover:bg-neutral-200 transition-all uppercase"
            >
              <span>Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded bg-white text-black text-xs font-mono font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-28 px-6 lg:px-12 border-b border-neutral-900 overflow-hidden">
        {/* Architectural Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-16">
          {/* Top Micro-Label */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded border border-neutral-800 bg-neutral-950 font-mono text-[11px] text-neutral-400 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="uppercase">Supply Chain Security Engine // v2.4</span>
          </div>

          {/* Hero Headlines */}
          <div className="space-y-8 max-w-5xl">
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-white">
              SOFTWARE <br />
              SUPPLY CHAIN <br />
              <span className="italic font-normal text-neutral-300">SECURITY.</span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl font-light leading-relaxed">
              Analyze dependencies. Detect vulnerabilities. Verify licenses. Generate SBOMs. Enforce security policy. Zero assumptions, mathematical rigor, and uncompromising clarity.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/signup"
                className="px-7 py-3.5 bg-white text-black text-xs font-mono font-bold tracking-widest uppercase hover:bg-neutral-200 transition-all flex items-center space-x-2"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-7 py-3.5 border border-neutral-800 bg-neutral-950 text-white text-xs font-mono tracking-widest uppercase hover:border-neutral-500 transition-all"
              >
                SIGN IN
              </Link>
            </div>
          </div>

          {/* Architectural Vector Pipeline Diagram */}
          <div className="border border-neutral-800 bg-neutral-950/80 p-6 md:p-8 rounded-xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-neutral-900 font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
              <span>FIG 1.0 // PIPELINE ARCHITECTURE SPECIFICATION</span>
              <span className="hidden sm:inline">CYCLE: DIRECT & TRANSITIVE</span>
            </div>

            {/* Pipeline Flow Diagram */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-6 text-center">
              {[
                { step: '01', title: 'Application', tag: 'ZIP / Manifest' },
                { step: '02', title: 'Dependencies', tag: 'Direct & Transitive' },
                { step: '03', title: 'SBOM', tag: 'CycloneDX 1.4' },
                { step: '04', title: 'Vulnerabilities', tag: 'OSV Screening' },
                { step: '05', title: 'Licenses', tag: 'SPDX Matrix' },
                { step: '06', title: 'Risk Score', tag: 'Weighted 0-100' },
                { step: '07', title: 'Compliance', tag: 'Audit Attestation' }
              ].map((node, i) => (
                <div key={node.step} className="relative group">
                  <div className="p-4 rounded border border-neutral-800/80 bg-black/60 hover:border-neutral-500 transition-colors flex flex-col justify-between h-32 text-left">
                    <span className="font-mono text-[10px] text-neutral-500">{node.step}</span>
                    <div className="space-y-1">
                      <span className="block font-mono text-xs font-bold text-white tracking-tight">
                        {node.title}
                      </span>
                      <span className="block font-mono text-[9px] text-neutral-400 truncate">
                        {node.tag}
                      </span>
                    </div>
                  </div>
                  {i < 6 && (
                    <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-neutral-600 font-mono text-xs">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Capability Strip */}
      <section className="border-b border-neutral-900 bg-neutral-950 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-between gap-6 text-[11px] font-mono tracking-widest uppercase text-neutral-400">
          <span className="flex items-center space-x-2">
            <span className="w-1 h-1 bg-white rounded-full" />
            <span>DEPENDENCY INTELLIGENCE</span>
          </span>
          <span className="text-neutral-800 hidden md:inline">/</span>
          <span className="flex items-center space-x-2">
            <span className="w-1 h-1 bg-white rounded-full" />
            <span>VULNERABILITY ANALYSIS</span>
          </span>
          <span className="text-neutral-800 hidden md:inline">/</span>
          <span className="flex items-center space-x-2">
            <span className="w-1 h-1 bg-white rounded-full" />
            <span>SBOM GENERATION</span>
          </span>
          <span className="text-neutral-800 hidden md:inline">/</span>
          <span className="flex items-center space-x-2">
            <span className="w-1 h-1 bg-white rounded-full" />
            <span>LICENSE GOVERNANCE</span>
          </span>
          <span className="text-neutral-800 hidden md:inline">/</span>
          <span className="flex items-center space-x-2">
            <span className="w-1 h-1 bg-white rounded-full" />
            <span>CONTEXTUAL RISK</span>
          </span>
          <span className="text-neutral-800 hidden md:inline">/</span>
          <span className="flex items-center space-x-2">
            <span className="w-1 h-1 bg-white rounded-full" />
            <span>POLICY COMPLIANCE</span>
          </span>
        </div>
      </section>

      {/* 4. Product Story (01 to 05) */}
      <section id="platform" className="py-24 px-6 lg:px-12 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="space-y-4 max-w-xl">
            <div className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
              PRODUCT FOUNDATIONS // 05 PILLARS
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl text-white font-normal">
              Architectural Scrutiny for Modern Software.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 01 Dependency Intelligence */}
            <div className="border border-neutral-800 bg-neutral-950 p-8 rounded-xl flex flex-col justify-between space-y-8 hover:border-neutral-600 transition-colors">
              <div className="space-y-4">
                <span className="font-mono text-3xl font-light text-neutral-600">01</span>
                <h3 className="font-mono text-base font-bold text-white tracking-wide uppercase">
                  Dependency Intelligence
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  Complete manifest extraction across package locks. Recursively discovers direct and transitive dependencies while constructing cycle-free dependency graphs.
                </p>
              </div>
              <div className="border-t border-neutral-900 pt-4 font-mono text-[10px] text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>RESOLUTION:</span>
                  <span className="text-white">DIRECT + TRANSITIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>GRAPH TRAVERSAL:</span>
                  <span className="text-white">CYCLE-FREE</span>
                </div>
              </div>
            </div>

            {/* 02 Vulnerability Analysis */}
            <div className="border border-neutral-800 bg-neutral-950 p-8 rounded-xl flex flex-col justify-between space-y-8 hover:border-neutral-600 transition-colors">
              <div className="space-y-4">
                <span className="font-mono text-3xl font-light text-neutral-600">02</span>
                <h3 className="font-mono text-base font-bold text-white tracking-wide uppercase">
                  Vulnerability Analysis
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  Batch automated querying against the Open Source Vulnerabilities (OSV) database. Real-time correlation with CVE advisories, affected SemVer ranges, and severity scores.
                </p>
              </div>
              <div className="border-t border-neutral-900 pt-4 font-mono text-[10px] text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>ADVISORY SOURCE:</span>
                  <span className="text-white">OSV.DEV DATABASE</span>
                </div>
                <div className="flex justify-between">
                  <span>TAXONOMY:</span>
                  <span className="text-white">CRITICAL / HIGH / MED / LOW</span>
                </div>
              </div>
            </div>

            {/* 03 Software Bill of Materials */}
            <div className="border border-neutral-800 bg-neutral-950 p-8 rounded-xl flex flex-col justify-between space-y-8 hover:border-neutral-600 transition-colors">
              <div className="space-y-4">
                <span className="font-mono text-3xl font-light text-neutral-600">03</span>
                <h3 className="font-mono text-base font-bold text-white tracking-wide uppercase">
                  Software Bill of Materials
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  Automated generation of enterprise-grade CycloneDX 1.4 specification SBOMs. Verifiable cryptographic SHA-256 integrity hash verification and component inventorying.
                </p>
              </div>
              <div className="border-t border-neutral-900 pt-4 font-mono text-[10px] text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>STANDARD:</span>
                  <span className="text-white">CYCLONEDX 1.4 JSON</span>
                </div>
                <div className="flex justify-between">
                  <span>INTEGRITY:</span>
                  <span className="text-white">SHA-256 VERIFIED</span>
                </div>
              </div>
            </div>

            {/* 04 License Compliance */}
            <div className="border border-neutral-800 bg-neutral-950 p-8 rounded-xl flex flex-col justify-between space-y-8 hover:border-neutral-600 transition-colors">
              <div className="space-y-4">
                <span className="font-mono text-3xl font-light text-neutral-600">04</span>
                <h3 className="font-mono text-base font-bold text-white tracking-wide uppercase">
                  License Compliance
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  SPDX license identifier normalization and categorization into Permissive, Copyleft, or Unknown tiers. Mitigates commercial legal risk before deployment.
                </p>
              </div>
              <div className="border-t border-neutral-900 pt-4 font-mono text-[10px] text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>IDENTIFIERS:</span>
                  <span className="text-white">SPDX NORMALIZED</span>
                </div>
                <div className="flex justify-between">
                  <span>GOVERNANCE:</span>
                  <span className="text-white">APPROVED / REVIEW / UNKNOWN</span>
                </div>
              </div>
            </div>

            {/* 05 Contextual Risk & Policy */}
            <div className="border border-neutral-800 bg-neutral-950 p-8 rounded-xl flex flex-col justify-between space-y-8 hover:border-neutral-600 transition-colors md:col-span-2 lg:col-span-2">
              <div className="space-y-4">
                <span className="font-mono text-3xl font-light text-neutral-600">05</span>
                <h3 className="font-mono text-base font-bold text-white tracking-wide uppercase">
                  Contextual Risk & Policy Evaluation
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  Deterministic contextual risk formula factoring severity, dependency depth, freshness, and license risk. Automated pass/fail policy gates generate executive compliance attestations.
                </p>
              </div>
              <div className="border-t border-neutral-900 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[10px] text-neutral-400">
                <div className="p-2 border border-neutral-900 rounded">
                  <span className="block text-neutral-500">SECURITY</span>
                  <span className="text-white font-bold">50% WEIGHT</span>
                </div>
                <div className="p-2 border border-neutral-900 rounded">
                  <span className="block text-neutral-500">CRITICALITY</span>
                  <span className="text-white font-bold">20% WEIGHT</span>
                </div>
                <div className="p-2 border border-neutral-900 rounded">
                  <span className="block text-neutral-500">FRESHNESS</span>
                  <span className="text-white font-bold">15% WEIGHT</span>
                </div>
                <div className="p-2 border border-neutral-900 rounded">
                  <span className="block text-neutral-500">LICENSE</span>
                  <span className="text-white font-bold">15% WEIGHT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works (Process) */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 border-b border-neutral-900 bg-neutral-950">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-900 pb-8">
            <div className="space-y-2">
              <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
                OPERATIONAL SEQUENCE
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl text-white font-normal">
                How It Works.
              </h2>
            </div>
            <p className="text-xs font-mono text-neutral-400 max-w-sm">
              FROM RAW REPOSITORY ARCHIVE TO VERIFIED REGULATORY COMPLIANCE ATTESTATION.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { num: '01', title: 'UPLOAD', desc: 'Secure ZIP staging and archive validation for package manifests.' },
              { num: '02', title: 'DISCOVER', desc: 'Recursive tree expansion uncovering direct and transitive dependencies.' },
              { num: '03', title: 'ANALYZE', desc: 'Parallel OSV advisory screening and SPDX license categorization.' },
              { num: '04', title: 'ASSESS', desc: 'Contextual risk computation with project-specific weighting.' },
              { num: '05', title: 'COMPLY', desc: 'Automated policy rule enforcement and executive audit reporting.' }
            ].map((step) => (
              <div key={step.num} className="border border-neutral-900 p-6 rounded-lg space-y-4 hover:border-neutral-700 transition-colors">
                <span className="font-mono text-4xl font-light text-neutral-600 block">
                  {step.num}
                </span>
                <h4 className="font-mono text-sm font-bold text-white tracking-widest uppercase">
                  {step.title}
                </h4>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Security Statement */}
      <section id="security" className="py-28 px-6 lg:px-12 border-b border-neutral-900 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block font-mono text-xs text-neutral-500 uppercase tracking-widest border border-neutral-800 px-3 py-1 rounded">
            DOCTRINE // SUPPLY CHAIN INTEGRITY
          </div>
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-tight">
            KNOW WHAT YOUR SOFTWARE DEPENDS ON.
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-light max-w-2xl mx-auto leading-relaxed">
            SDSCC empowers engineering leaders and enterprise security architects to achieve radical clarity over software composition, detect unpatched vulnerabilities, audit open-source licenses, produce authoritative SBOMs, and enforce regulatory compliance gates.
          </p>
        </div>
      </section>

      {/* 7. Final Dramatic CTA */}
      <section className="py-28 px-6 lg:px-12 border-b border-neutral-900 bg-neutral-950">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="font-serif text-5xl sm:text-7xl text-white tracking-tight">
            MAKE YOUR DEPENDENCIES VISIBLE.
          </h2>
          <p className="text-xs sm:text-sm font-mono text-neutral-400 uppercase tracking-widest max-w-md mx-auto">
            ZERO TRUST // CONTINUOUS VERIFICATION // PRODUCTION READY
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-black text-xs font-mono font-bold tracking-widest uppercase hover:bg-neutral-200 transition-all flex items-center space-x-2"
            >
              <span>GET STARTED WITH GOOGLE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border border-neutral-800 bg-black text-white text-xs font-mono tracking-widest uppercase hover:border-neutral-500 transition-all"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Minimal Monochrome Footer */}
      <footer className="py-16 px-6 lg:px-12 bg-black text-xs font-mono text-neutral-500 border-t border-neutral-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-white font-bold">
              <span className="w-4 h-4 bg-white text-black rounded-sm flex items-center justify-center text-[10px]">S</span>
              <span>SDSCC</span>
            </div>
            <p className="text-[11px] text-neutral-500 max-w-sm">
              Software Dependency Security & Compliance Checker. An enterprise-grade platform for software provenance and risk governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-[11px] uppercase tracking-wider text-neutral-400">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Get Started</Link>
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <div className="text-[10px] text-neutral-600">
            © 2026 SDSCC CORE // ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  )
}
