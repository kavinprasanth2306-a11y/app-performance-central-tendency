import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Share2, 
  CircleDot, 
  AlertCircle 
} from 'lucide-react';

export default function ManualNodeEdgeModal({
  isOpen,
  onClose,
  nodes,
  edges,
  onAddNode,
  onAddEdge,
  onDeleteNode,
  onDeleteEdge
}) {
  const [activeTab, setActiveTab] = useState('edge'); // 'edge' | 'node'
  const [newNodeId, setNewNodeId] = useState('');
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAddNodeSubmit = (e) => {
    e.preventDefault();
    const cleanId = newNodeId.trim();
    if (!cleanId) return;
    if (nodes.some(n => n.id === cleanId)) {
      setError(`Node "${cleanId}" already exists.`);
      return;
    }
    setError(null);
    onAddNode(cleanId);
    setNewNodeId('');
  };

  const handleAddEdgeSubmit = (e) => {
    e.preventDefault();
    const u = sourceNode.trim();
    const v = targetNode.trim();
    if (!u || !v) {
      setError("Please specify both source and target nodes.");
      return;
    }
    if (u === v) {
      setError("Self-loops are not allowed for link prediction.");
      return;
    }
    setError(null);
    onAddEdge(u, v);
    setSourceNode('');
    setTargetNode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Manual Graph Topology Editor</h2>
              <p className="text-xs text-slate-400">Dynamically add or inspect individual vertices and links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-white/10 text-xs">
          <button
            onClick={() => { setActiveTab('edge'); setError(null); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'edge'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Add Edge / Link
          </button>
          <button
            onClick={() => { setActiveTab('node'); setError(null); }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'node'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Add Isolated Node
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="py-4">
          {activeTab === 'edge' ? (
            <form onSubmit={handleAddEdgeSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Source Node</label>
                  <input
                    type="text"
                    list="nodes-datalist"
                    value={sourceNode}
                    onChange={(e) => setSourceNode(e.target.value)}
                    placeholder="e.g. Node A"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Node</label>
                  <input
                    type="text"
                    list="nodes-datalist"
                    value={targetNode}
                    onChange={(e) => setTargetNode(e.target.value)}
                    placeholder="e.g. Node B"
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <datalist id="nodes-datalist">
                {nodes.map(n => <option key={n.id} value={n.id} />)}
              </datalist>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 hover:opacity-95 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                <span>Insert Edge into Graph</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddNodeSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Node Identifier</label>
                <input
                  type="text"
                  value={newNodeId}
                  onChange={(e) => setNewNodeId(e.target.value)}
                  placeholder="e.g. Server_Alpha or Person_X"
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 hover:opacity-95 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                <span>Add Node</span>
              </button>
            </form>
          )}
        </div>

        {/* Existing Edges Quick View with Delete */}
        <div className="pt-3 border-t border-white/10 flex-1 overflow-y-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Current Edges ({edges.length})
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {edges.map((e, idx) => {
              const u = typeof e === 'object' ? (e.source || e[0]) : e[0];
              const v = typeof e === 'object' ? (e.target || e[1]) : e[1];
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300"
                >
                  <span className="font-mono">{u} — {v}</span>
                  <button
                    onClick={() => onDeleteEdge(u, v)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove edge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
