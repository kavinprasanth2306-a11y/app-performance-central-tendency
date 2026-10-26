import React from 'react';
import { BoxSelect, AlertCircle, Info, ChevronRight } from 'lucide-react';

export default function BoxPlotChart({ boxplotData, metricName }) {
  if (!boxplotData) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-center justify-center h-80">
        <p className="text-sm text-slate-400">Loading Box & Whisker analysis...</p>
      </div>
    );
  }

  const {
    min_val,
    q1,
    median,
    q3,
    max_val,
    lower_whisker,
    upper_whisker,
    iqr,
    outliers,
    group_name
  } = boxplotData;

  const totalRange = (max_val - min_val) || 1;
  const getPct = (val) => {
    const p = ((val - min_val) / totalRange) * 100;
    return Math.min(100, Math.max(0, p));
  };

  const q1Pct = getPct(q1);
  const q3Pct = getPct(q3);
  const medPct = getPct(median);
  const lowWhiskPct = getPct(lower_whisker);
  const upWhiskPct = getPct(upper_whisker);
  const boxWidthPct = Math.max(2, q3Pct - q1Pct);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-glass flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <BoxSelect className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Box & Whisker Dispersion Plot
            </h2>
            <p className="text-xs text-slate-400">
              Quartiles, Interquartile Range (IQR), and Tukey's Outlier Boundaries
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30">
          {group_name || 'All Samples'}
        </span>
      </div>

      {/* Boxplot Visual Diagram */}
      <div className="my-8 px-4 sm:px-8 py-6 rounded-2xl bg-slate-900/40 border border-white/5 relative">
        {/* Outlier Boundary Labels */}
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-6">
          <span>Min: <strong className="text-slate-200">{min_val}</strong></span>
          <span>Q1 (25%): <strong className="text-cyan-300">{q1}</strong></span>
          <span>Median (50%): <strong className="text-violet-300">{median}</strong></span>
          <span>Q3 (75%): <strong className="text-cyan-300">{q3}</strong></span>
          <span>Max: <strong className="text-slate-200">{max_val}</strong></span>
        </div>

        {/* The Graphic Bar Container */}
        <div className="relative h-16 w-full flex items-center">
          {/* Base Axis Line */}
          <div className="absolute w-full h-1 bg-white/10 rounded-full" />

          {/* Whisker Line (Between Lower and Upper Whiskers) */}
          <div
            className="absolute h-0.5 bg-violet-400/80 shadow-neon-violet"
            style={{
              left: `${lowWhiskPct}%`,
              width: `${Math.max(1, upWhiskPct - lowWhiskPct)}%`,
            }}
          />

          {/* Lower Whisker Cap */}
          <div
            className="absolute w-1 h-6 bg-violet-400 rounded-sm -translate-x-1/2"
            style={{ left: `${lowWhiskPct}%` }}
            title={`Lower Whisker: ${lower_whisker}`}
          />

          {/* Upper Whisker Cap */}
          <div
            className="absolute w-1 h-6 bg-violet-400 rounded-sm -translate-x-1/2"
            style={{ left: `${upWhiskPct}%` }}
            title={`Upper Whisker: ${upper_whisker}`}
          />

          {/* The Interquartile Range Box (Q1 to Q3) */}
          <div
            className="absolute h-12 rounded-lg bg-gradient-to-r from-violet-600/40 via-cyan-500/30 to-violet-600/40 border-2 border-violet-400/80 shadow-glass backdrop-blur-md transition-all flex items-center justify-center group"
            style={{
              left: `${q1Pct}%`,
              width: `${boxWidthPct}%`,
            }}
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-white bg-black/70 px-1.5 py-0.5 rounded shadow">
              IQR = {iqr}
            </span>
          </div>

          {/* Median Vertical Divider Bar */}
          <div
            className="absolute w-1.5 h-14 bg-cyan-300 rounded-sm shadow-neon-cyan -translate-x-1/2 z-10"
            style={{ left: `${medPct}%` }}
            title={`Median (P50): ${median}`}
          />

          {/* Outlier Points Plotting */}
          {outliers && outliers.length > 0 && outliers.slice(0, 30).map((outVal, idx) => {
            const outPct = getPct(outVal);
            return (
              <div
                key={idx}
                className="absolute w-2.5 h-2.5 rounded-full bg-rose-500 border border-white/60 shadow-lg -translate-x-1/2 cursor-pointer hover:scale-150 transition-transform z-20"
                style={{ left: `${outPct}%` }}
                title={`Outlier Latency: ${outVal} ms`}
              />
            );
          })}
        </div>

        {/* Legend beneath the diagram */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-6 pt-3 border-t border-white/5">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-violet-500/40 border border-violet-400" />
            <span>IQR Box (50% Core Mass)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-neon-cyan" />
            <span>Median Line (P50)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
            <span>Outliers &gt; 1.5×IQR ({outliers?.length || 0} detected)</span>
          </div>
        </div>
      </div>

      {/* Dispersion Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <div className="text-slate-400 text-[10px] uppercase font-mono">IQR (Q3 - Q1)</div>
          <div className="text-sm font-bold text-white mt-0.5">{iqr}</div>
          <div className="text-[10px] text-slate-500">Core Spread</div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <div className="text-slate-400 text-[10px] uppercase font-mono">Tukey Lower Fence</div>
          <div className="text-sm font-bold text-cyan-300 mt-0.5">{lower_whisker}</div>
          <div className="text-[10px] text-slate-500">Q1 - 1.5*IQR</div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <div className="text-slate-400 text-[10px] uppercase font-mono">Tukey Upper Fence</div>
          <div className="text-sm font-bold text-violet-300 mt-0.5">{upper_whisker}</div>
          <div className="text-[10px] text-slate-500">Q3 + 1.5*IQR</div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <div className="text-slate-400 text-[10px] uppercase font-mono">Total Outliers</div>
          <div className="text-sm font-bold text-rose-400 mt-0.5">{outliers?.length || 0}</div>
          <div className="text-[10px] text-slate-500">Tail Anomaly Rate</div>
        </div>
      </div>
    </div>
  );
}
