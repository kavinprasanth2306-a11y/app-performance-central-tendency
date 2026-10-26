import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import GraphCanvas from './components/GraphCanvas';
import MetricDashboard from './components/MetricDashboard';
import TopLinksTable from './components/TopLinksTable';
import PresetsAndUploadModal from './components/PresetsAndUploadModal';
import ManualNodeEdgeModal from './components/ManualNodeEdgeModal';
import AlgorithmFormulaModal from './components/AlgorithmFormulaModal';
import ApiInspector from './components/ApiInspector';

import { 
  fetchPresets, 
  fetchPresetDetails, 
  uploadGraphFile, 
  parseGraph, 
  predictPair, 
  predictTopLinks 
} from './services/api';

export default function App() {
  // Preset & Graph Topology State
  const [presets, setPresets] = useState([]);
  const [activePresetId, setActivePresetId] = useState('karate_club');
  const [activePresetName, setActivePresetName] = useState("Zachary's Karate Club");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [graphSummary, setGraphSummary] = useState(null);

  // Pair Prediction State
  const [selectedNodeA, setSelectedNodeA] = useState(null);
  const [selectedNodeB, setSelectedNodeB] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [isPairPredicting, setIsPairPredicting] = useState(false);

  // Top Predicted Links State
  const [topLinks, setTopLinks] = useState([]);
  const [isTopLinksLoading, setIsTopLinksLoading] = useState(false);
  const [currentHeuristic, setCurrentHeuristic] = useState('adamic_adar');
  const [topK, setTopK] = useState(10);
  const [totalNonEdges, setTotalNonEdges] = useState(0);

  // Modals Visibility
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isManualEditorOpen, setIsManualEditorOpen] = useState(false);
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);
  const [isApiInspectorOpen, setIsApiInspectorOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Presets Catalog on Mount
  useEffect(() => {
    async function initCatalog() {
      try {
        const list = await fetchPresets();
        setPresets(list);
        await loadPreset('karate_club');
      } catch (err) {
        console.error('Error fetching presets:', err);
        showToast('Failed to load initial dataset from server.', 'error');
      }
    }
    initCatalog();
  }, []);

  // Load a Specific Preset Network
  const loadPreset = async (presetId) => {
    try {
      const data = await fetchPresetDetails(presetId);
      setActivePresetId(presetId);
      setActivePresetName(data.name);
      setNodes(data.nodes);
      setEdges(data.edges);
      setGraphSummary(data.summary);

      // Select an interesting initial pair (e.g. first two nodes if available)
      if (data.nodes.length >= 2) {
        const a = data.nodes[0].id;
        const b = data.nodes[data.nodes.length > 5 ? 5 : 1].id;
        setSelectedNodeA(a);
        setSelectedNodeB(b);
      } else {
        setSelectedNodeA(null);
        setSelectedNodeB(null);
      }

      showToast(`Loaded "${data.name}" (${data.nodes.length} nodes, ${data.edges.length} edges)`, 'success');
    } catch (err) {
      console.error('Error loading preset:', err);
      showToast(err.message || 'Error loading preset', 'error');
    }
  };

  // Trigger Pair Prediction when selection changes
  useEffect(() => {
    if (!selectedNodeA || !selectedNodeB || selectedNodeA === selectedNodeB) {
      setPredictionData(null);
      return;
    }

    let isSubscribed = true;
    async function runPairPrediction() {
      setIsPairPredicting(true);
      try {
        const result = await predictPair(edges, selectedNodeA, selectedNodeB, nodes);
        if (isSubscribed) {
          setPredictionData(result);
        }
      } catch (err) {
        console.error('Pair prediction error:', err);
        if (isSubscribed) {
          showToast(err.message || 'Failed to compute pair heuristics', 'error');
        }
      } finally {
        if (isSubscribed) {
          setIsPairPredicting(false);
        }
      }
    }

    runPairPrediction();
    return () => { isSubscribed = false; };
  }, [selectedNodeA, selectedNodeB, edges, nodes]);

  // Trigger Top Links Ranking when edges, heuristic or topK changes
  const runTopLinksRanking = useCallback(async () => {
    if (!edges.length) return;
    setIsTopLinksLoading(true);
    try {
      const result = await predictTopLinks(edges, currentHeuristic, topK, nodes);
      setTopLinks(result.top_links);
      setTotalNonEdges(result.total_non_edges_evaluated);
    } catch (err) {
      console.error('Top links ranking error:', err);
      showToast(err.message || 'Failed to rank top links', 'error');
    } finally {
      setIsTopLinksLoading(false);
    }
  }, [edges, currentHeuristic, topK, nodes]);

  useEffect(() => {
    runTopLinksRanking();
  }, [runTopLinksRanking]);

  // Handle File Upload
  const handleUploadFile = async (file) => {
    try {
      const res = await uploadGraphFile(file);
      setActivePresetId(null);
      setActivePresetName(file.name);
      setNodes(res.nodes);
      setEdges(res.edges.map(e => [e.source, e.target]));
      setGraphSummary(res.summary);
      if (res.nodes.length >= 2) {
        setSelectedNodeA(res.nodes[0].id);
        setSelectedNodeB(res.nodes[1].id);
      }
      showToast(`Successfully uploaded ${file.name}`, 'success');
    } catch (err) {
      throw err;
    }
  };

  // Handle Raw Text Parse
  const handleParseRawText = async (rawText, dataFormat) => {
    try {
      const res = await parseGraph(rawText, dataFormat);
      setActivePresetId(null);
      setActivePresetName("Custom Edge List");
      setNodes(res.nodes);
      setEdges(res.edges.map(e => [e.source, e.target]));
      setGraphSummary(res.summary);
      if (res.nodes.length >= 2) {
        setSelectedNodeA(res.nodes[0].id);
        setSelectedNodeB(res.nodes[1].id);
      }
      showToast(`Loaded ${res.nodes.length} nodes and ${res.edges.length} edges`, 'success');
    } catch (err) {
      throw err;
    }
  };

  // Manual Node & Edge Operations
  const handleAddNode = (nodeId) => {
    setNodes(prev => [...prev, { id: nodeId, label: nodeId }]);
    showToast(`Added node "${nodeId}"`, 'success');
  };

  const handleAddEdge = (u, v) => {
    // Add nodes if they don't exist
    setNodes(prev => {
      const existing = new Set(prev.map(n => n.id));
      const next = [...prev];
      if (!existing.has(u)) next.push({ id: u, label: u });
      if (!existing.has(v)) next.push({ id: v, label: v });
      return next;
    });

    setEdges(prev => [...prev, [u, v]]);
    showToast(`Added edge (${u} ⇄ ${v})`, 'success');
  };

  const handleDeleteEdge = (u, v) => {
    setEdges(prev => prev.filter(e => {
      const src = typeof e === 'object' ? (e.source || e[0]) : e[0];
      const tgt = typeof e === 'object' ? (e.target || e[1]) : e[1];
      return !((src === u && tgt === v) || (src === v && tgt === u));
    }));
    showToast(`Removed edge (${u} ⇄ ${v})`, 'info');
  };

  const handleSelectPair = (nodeA, nodeB) => {
    setSelectedNodeA(nodeA);
    setSelectedNodeB(nodeB);
    showToast(`Inspecting candidate link: ${nodeA} ⇄ ${nodeB}`, 'info');
  };

  return (
    <div className="relative min-h-screen bg-obsidian-950 text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Ambient Multi-layered Radial Glow Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/15 filter blur-[120px] pointer-events-none -z-10 animate-glow-pulse" />
      <div className="fixed top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/15 filter blur-[140px] pointer-events-none -z-10 animate-float-slow" />
      <div className="fixed bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-emerald-600/10 filter blur-[130px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <Navbar
        graphSummary={graphSummary}
        activePresetName={activePresetName}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenManualEditor={() => setIsManualEditorOpen(true)}
        onOpenFormulas={() => setIsFormulasOpen(true)}
        onOpenApiInspector={() => setIsApiInspectorOpen(true)}
      />

      {/* Toast Alert Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-xs font-medium border shadow-2xl flex items-center gap-2 transition-all animate-bounce ${
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/40 text-rose-200' :
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' :
          'bg-slate-900/90 border-cyan-500/40 text-cyan-200'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-8">
        
        {/* Section 1: Interactive Graph Canvas */}
        <section className="w-full flex flex-col gap-3">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            selectedNodeA={selectedNodeA}
            selectedNodeB={selectedNodeB}
            commonNeighbors={predictionData?.common_neighbors_list || []}
            onSelectNodeA={setSelectedNodeA}
            onSelectNodeB={setSelectedNodeB}
            onClearSelection={() => {
              setSelectedNodeA(null);
              setSelectedNodeB(null);
            }}
          />
        </section>

        {/* Section 2: Metric Dashboard for Selected Pair */}
        <section className="w-full flex flex-col gap-3">
          <MetricDashboard
            predictionData={predictionData}
            isLoading={isPairPredicting}
            nodeA={selectedNodeA}
            nodeB={selectedNodeB}
            onOpenFormulas={() => setIsFormulasOpen(true)}
          />
        </section>

        {/* Section 3: Ranked Top Links Table */}
        <section className="w-full flex flex-col gap-3">
          <TopLinksTable
            topLinks={topLinks}
            isLoading={isTopLinksLoading}
            currentHeuristic={currentHeuristic}
            onHeuristicChange={setCurrentHeuristic}
            topK={topK}
            onTopKChange={setTopK}
            totalNonEdges={totalNonEdges}
            onSelectPair={handleSelectPair}
            selectedNodeA={selectedNodeA}
            selectedNodeB={selectedNodeB}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 glass-panel py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Heuristic Link Predictor • Production-grade Graph Network Intelligence Engine
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>FastAPI + NetworkX</span>
            <span>•</span>
            <span>React + Tailwind Glassmorphism</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <PresetsAndUploadModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        presets={presets}
        onSelectPreset={loadPreset}
        onUploadFile={handleUploadFile}
        onParseRawText={handleParseRawText}
        isLoading={false}
      />

      <ManualNodeEdgeModal
        isOpen={isManualEditorOpen}
        onClose={() => setIsManualEditorOpen(false)}
        nodes={nodes}
        edges={edges}
        onAddNode={handleAddNode}
        onAddEdge={handleAddEdge}
        onDeleteEdge={handleDeleteEdge}
      />

      <AlgorithmFormulaModal
        isOpen={isFormulasOpen}
        onClose={() => setIsFormulasOpen(false)}
      />

      <ApiInspector
        isOpen={isApiInspectorOpen}
        onClose={() => setIsApiInspectorOpen(false)}
        edges={edges}
        selectedNodeA={selectedNodeA}
        selectedNodeB={selectedNodeB}
        currentHeuristic={currentHeuristic}
        topK={topK}
      />

    </div>
  );
}
