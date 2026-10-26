import React from 'react';
import { X, BookOpen, GitFork, Percent, Scale, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';

export default function AlgorithmFormulaModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const algorithms = [
    {
      title: "Common Neighbors (CN)",
      formula: "CN(u, v) = |N(u) ∩ N(v)|",
      icon: GitFork,
      color: "text-cyan-400",
      border: "border-cyan-500/30",
      bg: "bg-cyan-500/10",
      description: "The simplest and most intuitive topological metric. Posits that two nodes sharing many mutual acquaintances are significantly more likely to form an edge in the future (triadic closure).",
      bestFor: "Dense, clustered social networks where triadic closure drives relationship formation."
    },
    {
      title: "Jaccard Coefficient (JC)",
      formula: "JC(u, v) = |N(u) ∩ N(v)| / |N(u) ∪ N(v)|",
      icon: Percent,
      color: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-500/10",
      description: "Normalizes the Common Neighbors score by the total neighborhood union size, preventing high-degree hub nodes from dominating simply due to their sheer degree.",
      bestFor: "Heterogeneous networks with large degree variance where proportion of shared interest matters."
    },
    {
      title: "Adamic-Adar Index (AA)",
      formula: "AA(u, v) = Σ [ 1 / ln(d(w)) ] for w ∈ N(u) ∩ N(v)",
      icon: Scale,
      color: "text-purple-400",
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
      description: "Refines Common Neighbors by penalizing shared neighbors with very high degrees. A rare mutual friend (low degree) is much stronger evidence of a link than a universal celebrity (high degree).",
      bestFor: "Web graphs, recommendation engines, and citation networks where hub nodes introduce noise."
    },
    {
      title: "Preferential Attachment (PA)",
      formula: "PA(u, v) = d(u) × d(v)",
      icon: TrendingUp,
      color: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      description: "Based on the scale-free network principle of 'rich get richer'. Probability of a link forming is proportional to the product of degrees, requiring no common neighbor.",
      bestFor: "Growing networks, internet topology, and citation networks characterized by power-law degree distributions."
    },
    {
      title: "Resource Allocation Index (RA)",
      formula: "RA(u, v) = Σ [ 1 / d(w) ] for w ∈ N(u) ∩ N(v)",
      icon: Zap,
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      description: "Models resource transmission from u to v via common neighbors. Because 1/d(w) decreases much steeper than 1/ln(d(w)), RA punishes high-degree hubs even more aggressively than Adamic-Adar.",
      bestFor: "Transportation graphs, communication routers, and biological reaction networks."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Heuristic Link Prediction Theoretical Reference</h2>
              <p className="text-xs text-slate-400">Mathematical formulations, topological intuition, and heuristic properties</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Algorithm cards */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
          {algorithms.map((algo) => {
            const Icon = algo.icon;
            return (
              <div
                key={algo.title}
                className="glass-card rounded-xl p-4 border border-white/10 flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`p-1.5 rounded-lg ${algo.bg} border ${algo.border} ${algo.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{algo.title}</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {algo.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="text-slate-500 font-medium">Optimal Domain:</span>
                    <span>{algo.bestFor}</span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end justify-center min-w-[220px]">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 mb-1">
                    Mathematical Expression
                  </span>
                  <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/15 font-mono text-xs text-cyan-300 shadow-inner">
                    {algo.formula}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Comparative Summary Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900/60 border border-white/10 text-xs text-slate-300 space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Key Distinction: Adamic-Adar vs Resource Allocation</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              While both metrics weight common neighbors inversely to their degrees, <b>Resource Allocation</b> employs a linear reciprocal ($1/k$) compared to Adamic-Adar's logarithmic reciprocal ($1/\ln(k)$). Consequently, RA penalizes high-degree intermediate nodes much more severely when $k \gg 1$.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
