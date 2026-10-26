const API_BASE = '/api';

export async function fetchPresets() {
  const res = await fetch(`${API_BASE}/presets`);
  if (!res.ok) throw new Error('Failed to fetch presets');
  return res.json();
}

export async function fetchPresetDetails(presetId) {
  const res = await fetch(`${API_BASE}/presets/${presetId}`);
  if (!res.ok) throw new Error(`Failed to fetch preset ${presetId}`);
  return res.json();
}

export async function parseGraph(rawData, dataFormat = 'csv') {
  const res = await fetch(`${API_BASE}/graph/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_data: rawData, data_format: dataFormat })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to parse graph data');
  }
  return res.json();
}

export async function uploadGraphFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/graph/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload graph file');
  }
  return res.json();
}

export async function predictPair(edges, nodeA, nodeB, nodes = null) {
  const res = await fetch(`${API_BASE}/predict/pair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      edges,
      node_a: nodeA,
      node_b: nodeB,
      nodes: nodes ? nodes.map(n => typeof n === 'string' ? n : n.id) : null
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to predict pair metrics');
  }
  return res.json();
}

export async function predictTopLinks(edges, heuristic = 'adamic_adar', topK = 10, nodes = null) {
  const res = await fetch(`${API_BASE}/predict/top-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      edges,
      heuristic,
      top_k: topK,
      nodes: nodes ? nodes.map(n => typeof n === 'string' ? n : n.id) : null
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to rank top links');
  }
  return res.json();
}
