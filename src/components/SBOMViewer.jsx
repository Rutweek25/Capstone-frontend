import React, { useState } from 'react'
import { Search, Code2, Box, FileText, ChevronDown } from 'lucide-react'

export default function SBOMViewer({ sbomJson }) {
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState('table')

  const components = sbomJson?.components || []
  const filtered = components.filter(c => 
    !query || (c.name && c.name.toLowerCase().includes(query.toLowerCase())) ||
    (c.purl && c.purl.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter components or purl..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
              viewMode === 'table' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Components ({filtered.length})</span>
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
              viewMode === 'json' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw CycloneDX JSON</span>
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="glass-panel overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Component</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">License</th>
                  <th className="p-4">PURL Identifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filtered.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center space-x-2">
                      <Box className="w-4 h-4 text-teal-400 flex-shrink-0" />
                      <span>{c.name || 'Unknown'}</span>
                    </td>
                    <td className="p-4 text-cyan-400">{c.version || 'v1.0.0'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-sans font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {c.type || 'library'}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-400">
                      {Array.isArray(c.licenses)
                        ? c.licenses.map(l => l.license?.name || l.license?.id || 'MIT').join(', ')
                        : 'MIT'}
                    </td>
                    <td className="p-4 text-slate-400 text-[11px] truncate max-w-xs">{c.purl || `pkg:npm/${c.name}@${c.version}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-4 border border-slate-800 rounded-2xl">
          <pre className="text-xs text-cyan-300 font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-96 overflow-auto">
            {JSON.stringify(sbomJson, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
