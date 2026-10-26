import React, { useState } from 'react';
import { 
  GitFork, 
  Percent, 
  Scale, 
  TrendingUp, 
  Zap, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';

export default function MetricDashboard({ 
  predictionData, 
  isLoading, 
  nodeA, 
  nodeB,
  onOpenFormulas 
}) {
  const [showDetailBreakdown, setShowDetailBreakdown] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full glass-panel rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] border border-white/10 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Computing topological heuristic link metrics...</p>
        <p className="text-xs text-slate-500 mt-1">Evaluating Adamic-Adar, Jaccard, and neighbor intersections</p>
      </div>
    );
  }

  if (!nodeA || !nodeB || !predictionData) {
    return (
      <div className="w-full glass-panel rounded-2xl p-8 flex flex-col items-center justify-center min-h-[280px] border border-white/10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
          <GitFork className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Select a Pair to Predict Link Formation</h3>
        <p className="text-sm text-slate-400 max-w-md mb-4">
          Click any two nodes in the interactive network graph or click <span className="text-cyan-300 font-medium">Select</span> on any candidate in the Top Predicted Links table.
        </p>
        <button
          onClick={onOpenFormulas}
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-1.5 rounded-lg border border-cyan-500/30 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Learn how Link Prediction heuristics work</span>
        </button>
      </div>
    );
  }

  const {
    degree_a,
    degree_b,
    is_existing_edge,
    shortest_path_distance,
    common_neighbors_count,
    common_neighbors_list,
    common_neighbors_details,
    union_neighbors_count,
    jaccard_coefficient,
    adamic_adar_index,
    preferential_attachment,
    resource_allocation_index
  } = predictionData;

  return (
    <div className="w-full flex flex-col gap-5">
      
      {/* Pair Status Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-semibold text-sm">
              {nodeA}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono font-semibold text-sm">
              {nodeB}
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Existing vs Non-existing Edge status */}
          <div>
            {is_existing_edge ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Existing Edge (Connected)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                Prospective Link Candidate
              </span>
            )}
          </div>
        </div>

        {/* Degrees and Shortest Path */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-400">Node Degrees:</span>
            <span className="text-slate-200 font-medium">
              d({nodeA}) = <b className="text-cyan-300">{degree_a}</b>, d({nodeB}) = <b className="text-purple-300">{degree_b}</b>
            </span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-slate-400">Geodesic Distance:</span>
            <span className="text-slate-200 font-medium">
              {shortest_path_distance !== null ? (
                <span className="text-emerald-400 font-semibold">{shortest_path_distance} hops</span>
              ) : (
                <span className="text-rose-400 font-semibold">Disconnected (∞)</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 5 Glassmorphic Heuristic Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. Common Neighbors (CN) */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-cyan-500/20">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-cyan-400">Common Neighbors</span>
              <GitFork className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight my-1">
              {common_neighbors_count}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Shared adjacent vertices: |N(u) ∩ N(v)|
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
            {common_neighbors_count > 0 ? (
              <span className="text-cyan-300 font-medium">{common_neighbors_count} bridge nodes</span>
            ) : (
              <span className="text-slate-500">No direct common neighbors</span>
            )}
          </div>
        </div>

        {/* 2. Jaccard Coefficient (JC) */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-blue-500/20">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-blue-400">Jaccard Coeff</span>
              <Percent className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight my-1">
              {jaccard_coefficient.toFixed(3)}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Normalized intersection over union
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(jaccard_coefficient * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.0</span>
              <span className="text-blue-300 font-mono">{(jaccard_coefficient * 100).toFixed(1)}%</span>
              <span>1.0</span>
            </div>
          </div>
        </div>

        {/* 3. Adamic-Adar Index (AA) */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-purple-500/20 shadow-lg shadow-purple-500/5">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-purple-400">Adamic-Adar</span>
              <Scale className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight my-1">
              {adamic_adar_index.toFixed(3)}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Degree-penalized bridge index: Σ 1/ln(d(w))
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">High selectivity</span>
            <span className="text-purple-300 font-mono font-medium">{adamic_adar_index > 0 ? 'Active' : '0.00'}</span>
          </div>
        </div>

        {/* 4. Preferential Attachment (PA) */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-amber-500/20">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-amber-400">Pref. Attachment</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight my-1">
              {preferential_attachment}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Degree product: d(u) × d(v)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
            <span>{degree_a} × {degree_b}</span>
          </div>
        </div>

        {/* 5. Resource Allocation (RA) */}
        <div className="glass-card rounded-2xl p-4 flex flex-col justify-between border-emerald-500/20">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-emerald-400">Resource Alloc</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight my-1">
              {resource_allocation_index.toFixed(3)}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Transmission flow: Σ 1/d(w)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
            <span className="text-emerald-300 font-medium">Flow index</span>
          </div>
        </div>

      </div>

      {/* Shared Neighbors Pill Section & Formula Breakdown Toggle */}
      {common_neighbors_list && common_neighbors_list.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Shared Common Neighbors ({common_neighbors_list.length})
              </span>
              <span className="text-xs text-slate-500">
                Highlighted with emerald halo in the graph canvas
              </span>
            </div>

            <button
              onClick={() => setShowDetailBreakdown(!showDetailBreakdown)}
              className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>{showDetailBreakdown ? 'Hide Component Contributions' : 'Show Component Contributions'}</span>
              {showDetailBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Clickable pill badges of common neighbors */}
          <div className="flex flex-wrap gap-2">
            {common_neighbors_list.map((nbr) => (
              <span
                key={nbr}
                className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium flex items-center gap-1.5 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{nbr}</span>
              </span>
            ))}
          </div>

          {/* Detailed tabular contribution for each common neighbor */}
          {showDetailBreakdown && common_neighbors_details && (
            <div className="mt-4 pt-4 border-t border-white/10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10">
                    <th className="pb-2 font-semibold">Common Neighbor (w)</th>
                    <th className="pb-2 font-semibold">Degree d(w)</th>
                    <th className="pb-2 font-semibold">AA Contribution (1/ln(d(w)))</th>
                    <th className="pb-2 font-semibold">RA Contribution (1/d(w))</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {common_neighbors_details.map((item) => (
                    <tr key={item.node} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 text-cyan-300 font-sans font-medium">{item.node}</td>
                      <td className="py-2.5 text-slate-300">{item.degree}</td>
                      <td className="py-2.5 text-purple-300">+{item.aa_contribution.toFixed(4)}</td>
                      <td className="py-2.5 text-emerald-300">+{item.ra_contribution.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
