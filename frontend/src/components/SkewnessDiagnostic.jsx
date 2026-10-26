import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  CheckCircle, 
  HelpCircle, 
  Lightbulb, 
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';

export default function SkewnessDiagnostic({ recommendations, summary }) {
  if (!recommendations || recommendations.length === 0) return null;

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400" />
            <span>CRITICAL</span>
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>WARNING</span>
          </span>
        );
      case 'success':
      default:
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>STABLE / OPTIMAL</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-glass mb-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/30">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Automated Optimization & Central Tendency Diagnostic Report
            </h2>
            <p className="text-xs text-slate-400">
              System engineering decisions derived from skewness delta (Mean - Median) and tail dispersion
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">
            Evaluated Rules: {recommendations.length} Active Checks
          </span>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="glass-card rounded-xl p-4 border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                  {rec.category}
                </span>
                {getSeverityBadge(rec.severity)}
              </div>

              <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                {rec.title}
              </h3>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                  <span className="font-semibold text-slate-200 block mb-0.5 text-[11px] text-amber-300/90">
                    Analytical Diagnosis:
                  </span>
                  <p className="leading-relaxed text-slate-300">{rec.diagnosis}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
                  <span className="font-semibold text-cyan-300 block mb-0.5 text-[11px]">
                    Engineering Recommendation:
                  </span>
                  <p className="leading-relaxed text-slate-200">{rec.recommendation}</p>
                </div>
              </div>
            </div>

            {/* Formula Justification Footer */}
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="truncate" title={rec.formula_justification}>
                Rule: {rec.formula_justification}
              </span>
              <span className="text-cyan-400 font-semibold">{rec.target_group}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
