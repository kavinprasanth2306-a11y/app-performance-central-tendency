import React from 'react';
import { 
  TrendingUp, 
  Target, 
  Hash, 
  Activity, 
  ShieldAlert, 
  Maximize2,
  HelpCircle
} from 'lucide-react';

function Sparkline({ data, color = '#06b6d4' }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 110;
  const height = 28;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function KpiCards({ summary, metricName }) {
  if (!summary) return null;

  const { central_tendency: ct, dispersion: disp, outliers: outl, sparkline } = summary;

  // Formatting helpers
  const fmt = (n) => (n !== undefined && n !== null ? Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 }) : '--');

  const unit = metricName?.includes('ms') 
    ? 'ms' 
    : metricName?.includes('pct') || metricName?.includes('Rate') 
    ? '%' 
    : metricName?.includes('MB') 
    ? 'MB' 
    : metricName?.includes('RPS') 
    ? 'RPS' 
    : '';

  const isPositiveSkew = ct.mean_median_diff > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {/* 1. Arithmetic Mean */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 text-cyan-300">
            <TrendingUp className="w-3.5 h-3.5" /> Arithmetic Mean
          </span>
          <span className="text-[10px] font-mono text-slate-400">μ</span>
        </div>
        
        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            {fmt(ct.mean)}
          </span>
          <span className="text-xs text-slate-400 font-mono">{unit}</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="text-[10px] text-slate-400" title="5% trimmed mean removes top & bottom 5% outliers">
            Trimmed (5%): <span className="font-semibold text-slate-200">{fmt(ct.trimmed_mean_5)}</span>
          </div>
          <Sparkline data={sparkline} color="#06b6d4" />
        </div>
      </div>

      {/* 2. Median (P50) */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 text-violet-300">
            <Target className="w-3.5 h-3.5" /> Median (P50)
          </span>
          <span className="text-[10px] font-mono text-slate-400">50th %ile</span>
        </div>

        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors">
            {fmt(ct.median)}
          </span>
          <span className="text-xs text-slate-400 font-mono">{unit}</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div 
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              Math.abs(ct.mean_median_diff) > 10 
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}
            title="Mean - Median Delta indicates outlier skewness"
          >
            Δ {isPositiveSkew ? '+' : ''}{fmt(ct.mean_median_diff)} {unit}
          </div>
          <Sparkline data={sparkline} color="#8b5cf6" />
        </div>
      </div>

      {/* 3. Mode (Peak Frequency) */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 text-emerald-300">
            <Hash className="w-3.5 h-3.5" /> Empirical Mode
          </span>
          <span className="text-[10px] font-mono text-slate-400">Peak</span>
        </div>

        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
            {fmt(ct.mode)}
          </span>
          <span className="text-xs text-slate-400 font-mono">{unit}</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="text-[10px] text-slate-400">
            Frequency: <span className="font-semibold text-emerald-400">{ct.mode_frequency} reqs</span>
          </div>
          <Sparkline data={sparkline} color="#10b981" />
        </div>
      </div>

      {/* 4. Variance & Standard Deviation */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 text-amber-300">
            <Activity className="w-3.5 h-3.5" /> Std Dev (σ)
          </span>
          <span className="text-[10px] font-mono text-slate-400">Dispersion</span>
        </div>

        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
            {fmt(disp.std_dev)}
          </span>
          <span className="text-xs text-slate-400 font-mono">σ</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="text-[10px] text-slate-400" title="Coefficient of Variation = (StdDev / Mean) * 100">
            CV: <span className="font-semibold text-amber-300">{fmt(disp.coeff_of_variation_pct)}%</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            σ²: {fmt(disp.variance)}
          </div>
        </div>
      </div>

      {/* 5. P95 / P99 Tail Latency */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5" /> P95 SLA Threshold
          </span>
          <span className="text-[10px] font-mono text-slate-400">95%</span>
        </div>

        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-rose-300 transition-colors">
            {fmt(disp.p95)}
          </span>
          <span className="text-xs text-slate-400 font-mono">{unit}</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="text-[10px] text-slate-400">
            P99: <span className="font-semibold text-rose-400">{fmt(disp.p99)} {unit}</span>
          </div>
          <span className="text-[9px] uppercase px-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
            Tail Risk
          </span>
        </div>
      </div>

      {/* 6. Interquartile Range (IQR) & Outliers */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 text-blue-300">
            <Maximize2 className="w-3.5 h-3.5" /> Spread (IQR)
          </span>
          <span className="text-[10px] font-mono text-slate-400">Q3 - Q1</span>
        </div>

        <div className="flex items-baseline space-x-1.5 my-1">
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
            {fmt(disp.iqr)}
          </span>
          <span className="text-xs text-slate-400 font-mono">{unit}</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="text-[10px] text-slate-400">
            Outliers: <span className="font-semibold text-cyan-300">{outl.outlier_count}</span> ({fmt(outl.outlier_percentage)}%)
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Z &gt; 3: {outl.zscore_outlier_count}
          </span>
        </div>
      </div>
    </div>
  );
}
