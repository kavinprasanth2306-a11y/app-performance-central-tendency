import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LineChart as LineChartIcon, Activity, AlertOctagon, Sliders } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TimeSeriesChart({ timeSeriesData, metricName, onWindowChange, currentWindow = 15 }) {
  if (!timeSeriesData || !timeSeriesData.points || timeSeriesData.points.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex items-center justify-center h-80">
        <p className="text-sm text-slate-400">Loading time-series stream data...</p>
      </div>
    );
  }

  const { points } = timeSeriesData;

  const chartData = useMemo(() => {
    // Show up to 100 points for crisp visual stream
    const sampled = points.length > 120 
      ? points.filter((_, idx) => idx % Math.ceil(points.length / 100) === 0)
      : points;

    const labels = sampled.map((p) => p.timestamp || `#${p.index}`);
    const actualValues = sampled.map((p) => p.value);
    const rollingMeans = sampled.map((p) => p.rolling_mean);
    const upperBands = sampled.map((p) => p.upper_band);
    const lowerBands = sampled.map((p) => p.lower_band);

    const pointBackgroundColors = sampled.map((p) =>
      p.is_outlier ? '#f43f5e' : 'rgba(6, 182, 212, 0.6)'
    );
    const pointRadii = sampled.map((p) => (p.is_outlier ? 5 : 1.5));

    return {
      labels,
      datasets: [
        {
          label: 'Upper 95% Band (μ + 1.96σ)',
          data: upperBands,
          borderColor: 'rgba(139, 92, 246, 0.4)',
          borderDash: [3, 3],
          borderWidth: 1,
          pointRadius: 0,
          fill: '+1', // Fill down to lower band
          backgroundColor: 'rgba(139, 92, 246, 0.08)',
        },
        {
          label: 'Lower 95% Band (μ - 1.96σ)',
          data: lowerBands,
          borderColor: 'rgba(139, 92, 246, 0.4)',
          borderDash: [3, 3],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Rolling Mean Moving Average',
          data: rollingMeans,
          borderColor: '#a855f7',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Raw Telemetry Signal',
          data: actualValues,
          borderColor: '#06b6d4',
          borderWidth: 1.5,
          pointBackgroundColor: pointBackgroundColors,
          pointBorderColor: '#ffffff',
          pointRadius: pointRadii,
          tension: 0.1,
          fill: false,
        },
      ],
    };
  }, [points]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#cbd5e1',
          font: { size: 10 },
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(11, 17, 32, 0.95)',
        titleColor: '#22d3ee',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 9, family: 'JetBrains Mono' },
          maxTicksLimit: 10,
        },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 10, family: 'JetBrains Mono' },
        },
        title: {
          display: true,
          text: metricName || 'Metric Value',
          color: '#64748b',
          font: { size: 11 },
        },
      },
    },
  };

  const outlierCount = points.filter((p) => p.is_outlier).length;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-glass flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <LineChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Stream Telemetry & Dynamic Confidence Bands
            </h2>
            <p className="text-xs text-slate-400">
              Moving average with empirical 95% confidence intervals (μ ± 1.96σ)
            </p>
          </div>
        </div>

        {/* Window Selector & Outlier Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{outlierCount} Band Breaches</span>
          </div>

          {onWindowChange && (
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-mono">Window:</span>
              {[10, 15, 25].map((w) => (
                <button
                  key={w}
                  onClick={() => onWindowChange(w)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    currentWindow === w
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'glass-card text-slate-400 hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full mt-3">
        <Line data={chartData} options={options} />
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Signal Samples: {points.length} events</span>
        <span>Confidence Model: Rolling Gaussian CI (95%)</span>
      </div>
    </div>
  );
}
