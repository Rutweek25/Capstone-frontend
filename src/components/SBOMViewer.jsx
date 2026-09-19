import React, { useState } from 'react'
import { Search, Code2, Box, FileText, ChevronDown, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react'

export default function SBOMViewer({ sbomJson }) {
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [copied, setCopied] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState(null)

  const components = sbomJson?.components || []
  const filtered = components.filter(c => 
    !query || 
    (c.name && c.name.toLowerCase().includes(query.toLowerCase())) ||
    (c.purl && c.purl.toLowerCase().includes(query.toLowerCase())) ||
    (c.version && c.version.toLowerCase().includes(query.toLowerCase()))
  )

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(sbomJson, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Search & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search components or PURL..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-[#E7E9EE] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111318] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-slate-900 text-white shadow-saas-xs'
                : 'bg-white border border-[#E7E9EE] text-[#69707D] hover:text-[#111318] hover:bg-slate-50'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Component Inventory ({filtered.length})</span>
          </button>

          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'json'
                ? 'bg-slate-900 text-white shadow-saas-xs'
                : 'bg-white border border-[#E7E9EE] text-[#69707D] hover:text-[#111318] hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw CycloneDX JSON</span>
          </button>
        </div>
      </div>

      {/* Table Mode */}
      {viewMode === 'table' ? (
        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Component Name</th>
                  <th>Version</th>
                  <th>Type</th>
                  <th>License Expression</th>
                  <th>PURL Identifier</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const licenseName = Array.isArray(c.licenses)
                    ? c.licenses.map(l => l.license?.name || l.license?.id || 'MIT').join(', ')
                    : 'MIT'

                  return (
                    <React.Fragment key={i}>
                      <tr 
                        onClick={() => setSelectedComponent(selectedComponent === i ? null : i)}
                        className="cursor-pointer"
                      >
                        <td>
                          <div className="flex items-center space-x-2">
                            <Box className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="font-bold text-[#111318] font-mono text-xs hover:text-blue-600">
                              {c.name || 'Unknown'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="font-mono text-xs text-slate-600">
                            {c.version || '1.0.0'}
                          </span>
                        </td>

                        <td>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {c.type || 'library'}
                          </span>
                        </td>

                        <td>
                          <span className="text-xs font-mono font-medium text-emerald-700">
                            {licenseName}
                          </span>
                        </td>

                        <td>
                          <span className="text-[11px] font-mono text-slate-400 truncate max-w-xs block" title={c.purl}>
                            {c.purl || `pkg:npm/${c.name}@${c.version}`}
                          </span>
                        </td>

                        <td className="text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedComponent(selectedComponent === i ? null : i); }}
                            className="p-1 rounded text-slate-400 hover:text-[#111318]"
                          >
                            {selectedComponent === i ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Component Detail Panel */}
                      {selectedComponent === i && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={6} className="p-4 border-b border-slate-200">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Package URL (PURL)</span>
                                <code className="font-mono text-[11px] text-[#111318] bg-white p-2 rounded-lg border border-slate-200 block mt-1 break-all">
                                  {c.purl || `pkg:npm/${c.name}@${c.version}`}
                                </code>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Component Specification</span>
                                <div className="mt-1 space-y-1 text-[#69707D]">
                                  <p>Scope: <strong className="text-[#111318]">{c.scope || 'required'}</strong></p>
                                  <p>Type: <strong className="text-[#111318]">{c.type || 'library'}</strong></p>
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Declared Licenses</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold saas-badge-pass font-mono">
                                    {licenseName}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Raw CycloneDX JSON View */
        <div className="saas-card p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#69707D]">
            <span>CycloneDX 1.4 JSON Specification Content</span>
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg border border-[#E7E9EE] hover:bg-slate-50 text-[#111318] font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="text-xs font-mono p-4 rounded-xl bg-slate-900 text-slate-200 max-h-96 overflow-auto leading-relaxed border border-slate-800">
            {JSON.stringify(sbomJson, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
