import React, { useState } from 'react';
import { 
  Activity, 
  UploadCloud, 
  Download, 
  RefreshCw, 
  Database, 
  Sliders, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  datasetInfo, 
  onOpenUpload, 
  onRefresh, 
  presets, 
  onSelectPreset,
  exportUrl,
  loading
}) {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/30 border border-cyan-400/40 shadow-neon-cyan">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                TelemetryFlow
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Central Tendency & Dispersion
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              App Performance Statistical Engine & SLA Diagnostics
            </p>
          </div>
        </div>

        {/* Global Status & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Dataset Pill */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg glass-badge text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[200px]" title={datasetInfo?.dataset_name}>
              {datasetInfo?.dataset_name || 'Loading dataset...'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {datasetInfo?.rows ?? 0} samples
            </span>
          </div>

          {/* Presets Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg glass-card text-xs font-medium text-slate-200 hover:text-white border-white/10 hover:border-violet-400/40"
              title="Load benchmark sample dataset"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Presets</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showPresetsMenu && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowPresetsMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-72 glass-modal rounded-xl border border-white/15 shadow-2xl z-30 py-2 divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Benchmark Preset
                  </div>
                  {presets && presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPreset(p.id);
                        setShowPresetsMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-white/5 transition flex flex-col group"
                    >
                      <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {p.description}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-xs font-medium text-cyan-200 shadow-sm transition active:scale-95"
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload CSV</span>
          </button>

          {/* Export Dropdown / Link */}
          <a
            href={exportUrl}
            download="telemetry_metrics_export.csv"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg glass-card text-xs font-medium text-slate-300 hover:text-white border-white/10 hover:border-emerald-500/40"
            title="Export telemetry dataset to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </a>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg glass-card text-slate-400 hover:text-cyan-300 transition active:scale-90"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
