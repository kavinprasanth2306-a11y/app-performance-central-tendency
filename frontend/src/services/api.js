const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch API status');
    return res.json();
  },

  async getFilterOptions() {
    const res = await fetch(`${API_BASE}/filters`);
    if (!res.ok) throw new Error('Failed to fetch filter options');
    return res.json();
  },

  async getPresets() {
    const res = await fetch(`${API_BASE}/presets`);
    if (!res.ok) throw new Error('Failed to fetch presets');
    return res.json();
  },

  async loadPreset(presetId) {
    const res = await fetch(`${API_BASE}/presets/load/${presetId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to load preset');
    return res.json();
  },

  async uploadDataset(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload dataset');
    }
    return res.json();
  },

  async getMetricsSummary(filters = {}) {
    const params = new URLSearchParams();
    if (filters.configuration && filters.configuration !== 'All') {
      params.append('configuration', filters.configuration);
    }
    if (filters.device_model && filters.device_model !== 'All') {
      params.append('device_model', filters.device_model);
    }
    if (filters.os_version && filters.os_version !== 'All') {
      params.append('os_version', filters.os_version);
    }
    if (filters.network_type && filters.network_type !== 'All') {
      params.append('network_type', filters.network_type);
    }

    const res = await fetch(`${API_BASE}/metrics/summary?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch metrics summary');
    return res.json();
  },

  async getMetricDistribution(metric, group = 'All', bins = 25) {
    const params = new URLSearchParams({
      metric,
      group: group || 'All',
      bins: bins.toString(),
    });
    const res = await fetch(`${API_BASE}/metrics/distribution?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch distribution data');
    return res.json();
  },

  async getTimeSeries(metric, group = 'All', window = 15) {
    const params = new URLSearchParams({
      metric,
      group: group || 'All',
      window: window.toString(),
    });
    const res = await fetch(`${API_BASE}/time-series?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch time series');
    return res.json();
  },

  async analyzeCustom(payload) {
    const res = await fetch(`${API_BASE}/analyze/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to compute custom analysis');
    return res.json();
  },

  async getRecommendations() {
    const res = await fetch(`${API_BASE}/recommendations`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async getRawData(params = {}) {
    const query = new URLSearchParams();
    query.append('page', (params.page || 1).toString());
    query.append('page_size', (params.page_size || 20).toString());
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_dir) query.append('sort_dir', params.sort_dir);
    if (params.search) query.append('search', params.search);
    if (params.configuration && params.configuration !== 'All') query.append('configuration', params.configuration);
    if (params.device_model && params.device_model !== 'All') query.append('device_model', params.device_model);
    if (params.network_type && params.network_type !== 'All') query.append('network_type', params.network_type);

    const res = await fetch(`${API_BASE}/data?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch raw telemetry data');
    return res.json();
  },

  getExportUrl(format = 'csv') {
    return `${API_BASE}/export?format=${format}`;
  },
};
