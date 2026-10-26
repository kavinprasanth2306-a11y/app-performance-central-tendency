import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Send, 
  Code2, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';

export default function ApiInspector({
  isOpen,
  onClose,
  edges,
  selectedNodeA,
  selectedNodeB,
  currentHeuristic,
  topK
}) {
  const [activeEndpoint, setActiveEndpoint] = useState('predict-pair');
  const [copied, setCopied] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const pairPayload = {
    edges: edges.slice(0, 15).map(e => [
      typeof e === 'object' ? (e.source || e[0]) : e[0],
      typeof e === 'object' ? (e.target || e[1]) : e[1]
    ]),
    node_a: selectedNodeA || "Node_A",
    node_b: selectedNodeB || "Node_B"
  };

  const topLinksPayload = {
    edges: edges.slice(0, 15).map(e => [
      typeof e === 'object' ? (e.source || e[0]) : e[0],
      typeof e === 'object' ? (e.target || e[1]) : e[1]
    ]),
    heuristic: currentHeuristic || "adamic_adar",
    top_k: topK || 10
  };

  const currentPayload = activeEndpoint === 'predict-pair' ? pairPayload : topLinksPayload;
  const endpointUrl = activeEndpoint === 'predict-pair' ? '/api/predict/pair' : '/api/predict/top-links';

  const curlCommand = `curl -X POST "http://localhost:8000${endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(currentPayload)}'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunLiveTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    const start = performance.now();
    try {
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPayload)
      });
      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);
      setTestResponse({
        status: res.status,
        latencyMs: elapsed,
        data: data
      });
    } catch (err) {
      setTestResponse({
        status: 'Error',
        error: err.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">REST API Inspector & Testing Tab</h2>
              <p className="text-xs text-slate-400">Inspect backend endpoint schemas, live payload buffers, and cURL commands</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-white/10 text-xs">
          <button
            onClick={() => { setActiveEndpoint('predict-pair'); setTestResponse(null); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeEndpoint === 'predict-pair'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            POST /api/predict/pair
          </button>
          <button
            onClick={() => { setActiveEndpoint('top-links'); setTestResponse(null); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeEndpoint === 'top-links'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            POST /api/predict/top-links
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          
          {/* Endpoint Information */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400">
                POST
              </span>
              <span className="font-mono text-slate-300">{endpointUrl}</span>
            </div>
            <button
              onClick={handleRunLiveTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTesting ? 'Sending...' : 'Test Endpoint'}</span>
            </button>
          </div>

          {/* cURL Snippet */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>cURL Command</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
              {curlCommand}
            </pre>
          </div>

          {/* Request Payload JSON */}
          <div>
            <span className="text-xs text-slate-400 block mb-1.5">Current Request Payload JSON</span>
            <pre className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
              {JSON.stringify(currentPayload, null, 2)}
            </pre>
          </div>

          {/* Live Response Panel */}
          {testResponse && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Live Server Response</span>
                <span className="text-emerald-400 font-mono">
                  HTTP {testResponse.status} • {testResponse.latencyMs}ms
                </span>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 font-mono text-[11px] text-emerald-200 overflow-x-auto max-h-60 leading-relaxed">
                {JSON.stringify(testResponse.data, null, 2)}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
