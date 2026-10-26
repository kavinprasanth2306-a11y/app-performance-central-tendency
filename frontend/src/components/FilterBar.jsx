import React from 'react';
import { Filter, Layers, Smartphone, Wifi, Cpu, RotateCcw } from 'lucide-react';

export default function FilterBar({
  filterOptions,
  selectedFilters,
  onChangeFilter,
  onResetFilters,
  selectedMetric,
  onChangeMetric,
}) {
  const metricLabels = {
    Response_Time_ms: 'Latency (ms)',
    CPU_Utilization_pct: 'CPU Utilization (%)',
    Memory_Usage_MB: 'RAM Usage (MB)',
    Throughput_RPS: 'Throughput (RPS)',
    App_Launch_Time_ms: 'Cold Launch (ms)',
    FPS_Drop_Rate: 'FPS Drop Rate (%)',
    Network_Payload_KB: 'Payload (KB)',
  };

  const hasActiveFilters = 
    (selectedFilters.configuration && selectedFilters.configuration !== 'All') ||
    (selectedFilters.device_model && selectedFilters.device_model !== 'All') ||
    (selectedFilters.os_version && selectedFilters.os_version !== 'All') ||
    (selectedFilters.network_type && selectedFilters.network_type !== 'All');

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10 shadow-glass mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Metric Selector Buttons */}
        <div className="w-full lg:w-auto">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Analytical Metric</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filterOptions?.metrics?.map((m) => {
              const isActive = selectedMetric === m;
              return (
                <button
                  key={m}
                  onClick={() => onChangeMetric(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan border border-cyan-400/50'
                      : 'glass-card text-slate-300 hover:text-white border-white/5 hover:border-white/20'
                  }`}
                >
                  {metricLabels[m] || m.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimension Filters */}
        <div className="w-full lg:w-auto flex flex-wrap items-center gap-2.5">
          {/* Architecture Configuration Filter */}
          {filterOptions?.configurations?.length > 1 && (
            <div className="flex-1 sm:flex-initial">
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-violet-400" /> Architecture
              </label>
              <select
                value={selectedFilters.configuration || 'All'}
                onChange={(e) => onChangeFilter('configuration', e.target.value)}
                className="w-full sm:w-44 glass-input rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-violet-400"
              >
                {filterOptions.configurations.map((c) => (
                  <option key={c} value={c} className="bg-space-900 text-slate-200">
                    {c === 'All' ? 'All Architectures' : c.replace('Config_', '').replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Device Model Filter */}
          {filterOptions?.device_models?.length > 1 && (
            <div className="flex-1 sm:flex-initial">
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-cyan-400" /> Device Model
              </label>
              <select
                value={selectedFilters.device_model || 'All'}
                onChange={(e) => onChangeFilter('device_model', e.target.value)}
                className="w-full sm:w-36 glass-input rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-cyan-400"
              >
                {filterOptions.device_models.map((d) => (
                  <option key={d} value={d} className="bg-space-900 text-slate-200">
                    {d === 'All' ? 'All Devices' : d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Network Tier Filter */}
          {filterOptions?.network_types?.length > 1 && (
            <div className="flex-1 sm:flex-initial">
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-400" /> Network Tier
              </label>
              <select
                value={selectedFilters.network_type || 'All'}
                onChange={(e) => onChangeFilter('network_type', e.target.value)}
                className="w-full sm:w-32 glass-input rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-400"
              >
                {filterOptions.network_types.map((n) => (
                  <option key={n} value={n} className="bg-space-900 text-slate-200">
                    {n === 'All' ? 'All Networks' : n.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <div className="self-end pb-0.5">
              <button
                onClick={onResetFilters}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs transition"
                title="Reset all dimension filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
