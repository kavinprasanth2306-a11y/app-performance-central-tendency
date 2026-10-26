import React from 'react';
import { 
  Network, 
  Layers, 
  PlusCircle, 
  BookOpen, 
  Terminal, 
  Share2, 
  Activity, 
  Boxes 
} from 'lucide-react';

export default function Navbar({
  graphSummary,
  activePresetName,
  onOpenPresets,
  onOpenManualEditor,
  onOpenFormulas,
  onOpenApiInspector,
  activeTab,
  setActiveTab
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Active Dataset Name */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 border border-cyan-300/30">
            <Network className="w-6 h-6 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-obsidian-950 animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Heuristic Link Predictor
              </h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 tracking-wider">
                v1.0 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Active Network:</span>
              <span className="text-cyan-300 font-medium truncate max-w-[200px]">
                {activePresetName || "Custom Topology"}
              </span>
            </p>
          </div>
        </div>

        {/* Graph Meta Statistics Ribbon */}
        {graphSummary && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl glass-pill text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Nodes:</span>
              <span className="font-semibold text-white">{graphSummary.node_count}</span>
            </div>
            <div className="h-3 w-px bg-white/15" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Edges:</span>
              <span className="font-semibold text-white">{graphSummary.edge_count}</span>
            </div>
            <div className="h-3 w-px bg-white/15" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-400">Density:</span>
              <span className="font-semibold text-white">{graphSummary.density}</span>
            </div>
            <div className="h-3 w-px bg-white/15" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">Avg Deg:</span>
              <span className="font-semibold text-emerald-400">{graphSummary.average_degree}</span>
            </div>
          </div>
        )}

        {/* Global Action Navigation Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg glass-pill hover:bg-white/10 hover:border-cyan-400/40 text-slate-200 transition-all duration-200 shadow-sm"
            title="Load Presets or Upload Dataset"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Presets & Upload</span>
          </button>

          <button
            onClick={onOpenManualEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg glass-pill hover:bg-white/10 hover:border-blue-400/40 text-slate-200 transition-all duration-200 shadow-sm"
            title="Add or remove nodes and edges manually"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Edit Graph</span>
          </button>

          <button
            onClick={onOpenFormulas}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg glass-pill hover:bg-white/10 hover:border-purple-400/40 text-slate-200 transition-all duration-200 shadow-sm"
            title="View mathematical definitions of link prediction heuristics"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Formulas</span>
          </button>

          <button
            onClick={onOpenApiInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg glass-pill hover:bg-white/10 hover:border-emerald-400/40 text-slate-200 transition-all duration-200 shadow-sm"
            title="API payload explorer and testing console"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>API Docs</span>
          </button>
        </div>

      </div>
    </header>
  );
}
