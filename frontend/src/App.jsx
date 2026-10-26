import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import KpiCards from './components/KpiCards';
import DistributionChart from './components/DistributionChart';
import BoxPlotChart from './components/BoxPlotChart';
import TimeSeriesChart from './components/TimeSeriesChart';
import SkewnessDiagnostic from './components/SkewnessDiagnostic';
import DataExplorerTable from './components/DataExplorerTable';
import UploadModal from './components/UploadModal';
import { api } from './services/api';
import { AlertCircle, BookOpen, Layers, Sparkles } from 'lucide-react';

export default function App() {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [presets, setPresets] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    configuration: 'All',
    device_model: 'All',
    os_version: 'All',
    network_type: 'All',
  });
  const [selectedMetric, setSelectedMetric] = useState('Response_Time_ms');
  const [metricsSummary, setMetricsSummary] = useState([]);
  const [distributionData, setDistributionData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [timeSeriesWindow, setTimeSeriesWindow] = useState(15);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load initial environment metadata
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [health, presetList, filters] = await Promise.all([
        api.getHealth(),
        api.getPresets(),
        api.getFilterOptions(),
      ]);

      setDatasetInfo(health);
      setPresets(presetList);
      setFilterOptions(filters);

      if (filters.metrics && filters.metrics.length > 0) {
        if (!filters.metrics.includes(selectedMetric)) {
          setSelectedMetric(filters.metrics[0]);
        }
      }
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Could not connect to the backend analytics API. Please ensure the backend is running on http://127.0.0.1:8000.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytical data whenever filters or target metric changes
  const refreshAnalytics = useCallback(async () => {
    if (!selectedMetric) return;
    try {
      setLoading(true);
      const [summaries, dist, series, recs] = await Promise.all([
        api.getMetricsSummary(selectedFilters),
        api.getMetricDistribution(selectedMetric, selectedFilters.configuration, 24),
        api.getTimeSeries(selectedMetric, selectedFilters.configuration, timeSeriesWindow),
        api.getRecommendations(),
      ]);

      setMetricsSummary(summaries);
      setDistributionData(dist);
      setTimeSeriesData(series);
      setRecommendations(recs);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to update analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedFilters, selectedMetric, timeSeriesWindow]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filterOptions) {
      refreshAnalytics();
    }
  }, [refreshAnalytics, filterOptions]);

  const handleFilterChange = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      configuration: 'All',
      device_model: 'All',
      os_version: 'All',
      network_type: 'All',
    });
  };

  const handleSelectPreset = async (presetId) => {
    try {
      setLoading(true);
      await api.loadPreset(presetId);
      await loadInitialData();
      await refreshAnalytics();
    } catch (err) {
      setError(`Failed to load preset: ${err.message}`);
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (res) => {
    await loadInitialData();
    await refreshAnalytics();
  };

  const currentMetricSummary = metricsSummary.find(
    (s) => s.metric_name === selectedMetric
  ) || metricsSummary[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Navbar */}
      <Navbar
        datasetInfo={datasetInfo}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onRefresh={refreshAnalytics}
        presets={presets}
        onSelectPreset={handleSelectPreset}
        exportUrl={api.getExportUrl('csv')}
        loading={loading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-glass">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                setError(null);
                refreshAnalytics();
              }}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-white font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dimension & Metric Selector Bar */}
        <FilterBar
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
          onChangeFilter={handleFilterChange}
          onResetFilters={handleResetFilters}
          selectedMetric={selectedMetric}
          onChangeMetric={setSelectedMetric}
        />

        {/* Row 1: Key Statistical KPI Cards */}
        <KpiCards
          summary={currentMetricSummary}
          metricName={selectedMetric}
        />

        {/* Row 2: Distribution & Boxplot Visual Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DistributionChart
            distributionData={distributionData}
            metricName={selectedMetric}
          />
          <BoxPlotChart
            boxplotData={distributionData?.boxplot}
            metricName={selectedMetric}
          />
        </div>

        {/* Row 3: Time Series Stream Performance with Confidence Bands */}
        <div className="mb-6">
          <TimeSeriesChart
            timeSeriesData={timeSeriesData}
            metricName={selectedMetric}
            currentWindow={timeSeriesWindow}
            onWindowChange={setTimeSeriesWindow}
          />
        </div>

        {/* Row 4: Automated Engineering Decisions & Diagnostic Report */}
        <SkewnessDiagnostic
          recommendations={recommendations}
          summary={currentMetricSummary}
        />

        {/* Row 5: Frosted Glass Raw Telemetry Data Explorer Table */}
        <DataExplorerTable
          selectedFilters={selectedFilters}
          selectedMetric={selectedMetric}
        />

        {/* Reference & Mathematical Formulations Drawer */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-glass mb-8">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10 text-cyan-400">
            <BookOpen className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Statistical Reference & Mathematical Formulations
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="font-semibold text-cyan-300 block mb-1">
                Central Tendency & Trimmed Mean
              </span>
              <p className="font-mono text-[11px] text-slate-300 mb-1">
                μ = (Σ xᵢ) / N &nbsp;|&nbsp; μ₅% = trim_mean(x, 0.05)
              </p>
              <p className="text-[11px]">
                Trimmed mean drops extreme outlier tails (top/bottom 5%) to counteract severe positive skewness in telemetry.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="font-semibold text-violet-300 block mb-1">
                Dispersion & Interquartile Range
              </span>
              <p className="font-mono text-[11px] text-slate-300 mb-1">
                IQR = Q₃ - Q₁ &nbsp;|&nbsp; σ = √[ Σ(xᵢ - μ)² / (N - 1) ]
              </p>
              <p className="text-[11px]">
                IQR captures the middle 50% core distribution, immune to one-off network timeout anomalies.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="font-semibold text-emerald-300 block mb-1">
                Tukey's Outlier Boundaries & Skewness
              </span>
              <p className="font-mono text-[11px] text-slate-300 mb-1">
                Fences: [Q₁ - 1.5·IQR, Q₃ + 1.5·IQR] &nbsp;|&nbsp; Skew = (μ - Median)
              </p>
              <p className="text-[11px]">
                Values beyond fences flag anomalous stalls. A large positive delta (μ &gt;&gt; Median) warns that SLA contracts should rely on P95/P99 rather than Mean.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Upload File Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
