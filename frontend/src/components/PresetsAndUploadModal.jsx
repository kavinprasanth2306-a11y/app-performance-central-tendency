import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Layers, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function PresetsAndUploadModal({
  isOpen,
  onClose,
  presets,
  onSelectPreset,
  onUploadFile,
  onParseRawText,
  isLoading
}) {
  const [activeSubTab, setActiveSubTab] = useState('presets'); // 'presets' | 'upload' | 'raw'
  const [rawText, setRawText] = useState(`Alice,Bob
Alice,Charlie
Bob,Charlie
Charlie,Diana
Diana,Evan
Evan,Fiona
Diana,Fiona`);
  const [dataFormat, setDataFormat] = useState('csv');
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setErrorMessage(null);
      await onUploadFile(file);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload graph file.');
    }
  };

  const handleRawSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      await onParseRawText(rawText, dataFormat);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to parse text edge list.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Graph Network Import & Presets</h2>
              <p className="text-xs text-slate-400">Choose a benchmark topology or ingest your custom network</p>
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
            onClick={() => setActiveSubTab('presets')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSubTab === 'presets'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Benchmark Presets ({presets?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('upload')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSubTab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            File Upload (CSV / TXT / JSON)
          </button>
          <button
            onClick={() => setActiveSubTab('raw')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSubTab === 'raw'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Edge-List Text Input
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4">
          
          {/* Subtab 1: Presets */}
          {activeSubTab === 'presets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(presets || []).map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPreset(p.id);
                    onClose();
                  }}
                  className="glass-card rounded-xl p-4 cursor-pointer hover:border-cyan-400/50 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-white/5 text-cyan-400 border border-white/10">
                        {p.category}
                      </span>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span><b>{p.node_count}</b> nodes</span>
                        <span>•</span>
                        <span><b>{p.edge_count}</b> edges</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-cyan-400">
                    <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Load Dataset <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtab 2: File Upload */}
          {activeSubTab === 'upload' && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/15 rounded-2xl hover:border-cyan-400/50 transition-colors text-center relative bg-slate-900/40">
              <input
                type="file"
                accept=".csv,.txt,.json"
                onChange={handleFileChange}
                disabled={isLoading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">
                Drag & Drop or Click to Select File
              </p>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Supported formats: <b>.CSV</b> (u,v or source,target), <b>.TXT</b> (whitespace delimited pairs), or <b>.JSON</b> (node-link format).
              </p>
              <span className="px-3.5 py-1.5 rounded-lg glass-pill text-xs text-cyan-300 font-medium pointer-events-none">
                Browse Files
              </span>
            </div>
          )}

          {/* Subtab 3: Raw Text Input */}
          {activeSubTab === 'raw' && (
            <form onSubmit={handleRawSubmit} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Edge List (one pair per line)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Format:</span>
                  <select
                    value={dataFormat}
                    onChange={(e) => setDataFormat(e.target.value)}
                    className="bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="csv">Comma Separated (CSV)</option>
                    <option value="tsv">Tab / Whitespace</option>
                    <option value="json">JSON format</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="u,v or u,v,weight"
                className="w-full bg-slate-900/90 border border-white/15 rounded-xl p-3 font-mono text-xs text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
              />

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all"
                >
                  {isLoading ? 'Parsing Graph...' : 'Parse & Load Topology'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
