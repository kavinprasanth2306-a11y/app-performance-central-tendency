import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DistributionChart({ distributionData, metricName }) {
  if (!distributionData || !distributionData.bins || distributionData.bins.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-center justify-center h-80">
        <p className="text-sm text-slate-400">Loading distribution data...</p>
      </div>
    );
  }

  const { bins, reference_lines: refs, skewness_summary: skew } = distributionData;

  const chartData = useMemo(() => {
    const labels = bins.map((b) => `${b.bin_start} - ${b.bin_end}`);
    const counts = bins.map((b) => b.count);

    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Request Frequency',
          data: counts,
          backgroundColor: 'rgba(6, 182, 212, 0.35)',
          borderColor: 'rgba(6, 182, 212, 0.85)',
          borderWidth: 1.5,
          borderRadius: 4,
          hoverBackgroundColor: 'rgba(6, 182, 212, 0.65)',
        },
      ],
    };
  }, [bins]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(11, 17, 32, 0.95)',
        titleColor: '#22d3ee',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `Frequency: ${context.raw} requests`,
          afterLabel: (context) => {
            const b = bins[context.dataIndex];
            return b ? `Range: [${b.bin_start}, ${b.bin_end}]` : '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10, family: 'JetBrains Mono' },
          maxRotation: 45,
          minRotation: 25,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10, family: 'JetBrains Mono' },
        },
        title: {
          display: true,
          text: 'Frequency (Sample Count)',
          color: '#64748b',
          font: { size: 11 },
        },
      },
    },
  };

  const isSevereSkew = skew?.mean_median_diff > 15;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-glass flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Distribution & Skewness Analysis
            </h2>
            <p className="text-xs text-slate-400">
              Histogram frequency density overlaid with Mean vs. Median vs. Mode central lines
            </p>
          </div>
        </div>

        {/* Skewness Diagnostic Badge */}
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isSevereSkew
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {isSevereSkew ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{skew?.direction || 'Symmetric'}</span>
          </div>
        </div>
      </div>

      {/* Central Tendency Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          {/* Mean */}
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-red-400 rounded-sm inline-block" />
            <span className="text-slate-400">Mean (μ):</span>
            <span className="font-bold text-red-300">{refs?.mean}</span>
          </div>

          {/* Median */}
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-cyan-400 rounded-sm inline-block" />
            <span className="text-slate-400">Median (P50):</span>
            <span className="font-bold text-cyan-300">{refs?.median}</span>
          </div>

          {/* Mode */}
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-emerald-400 rounded-sm inline-block" />
            <span className="text-slate-400">Mode:</span>
            <span className="font-bold text-emerald-300">{refs?.mode}</span>
          </div>
        </div>

        {/* Delta */}
        <div className="flex items-center space-x-2 text-slate-300">
          <span>Mean - Median:</span>
          <span className={`font-bold ${skew?.mean_median_diff > 0 ? 'text-amber-300' : 'text-slate-200'}`}>
            {skew?.mean_median_diff > 0 ? '+' : ''}{skew?.mean_median_diff}
          </span>
          <span className="text-[10px] text-slate-400">(Skew score: {skew?.score})</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full mt-2">
        <Bar data={chartData} options={options} />
      </div>

      {/* Analytical Footnote */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-start space-x-2 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p>
          <strong className="text-slate-200">Central Tendency Insight:</strong>{' '}
          {skew?.mean_median_diff > 12 ? (
            <>
              Positive skewness detected. Outliers pull the <strong className="text-red-300">Mean ({refs?.mean})</strong> significantly above the{' '}
              <strong className="text-cyan-300">Median ({refs?.median})</strong>. The median is far more representative of typical user experience.
            </>
          ) : (
            <>
              Distribution exhibits high symmetry. Arithmetic mean and median are closely synchronized, signifying homogeneous request execution.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
