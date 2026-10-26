import React, { useState } from 'react';
import { 
  Trophy, 
  Download, 
  Search, 
  ArrowRight, 
  Layers, 
  Check, 
  Filter, 
  FileSpreadsheet, 
  FileCode 
} from 'lucide-react';

export default function TopLinksTable({
  topLinks,
  isLoading,
  currentHeuristic,
  onHeuristicChange,
  topK,
  onTopKChange,
  totalNonEdges,
  onSelectPair,
  selectedNodeA,
  selectedNodeB
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  const heuristicOptions = [
    { id: 'adamic_adar', label: 'Adamic-Adar Index (AA)', color: 'text-purple-400' },
    { id: 'common_neighbors', label: 'Common Neighbors (CN)', color: 'text-cyan-400' },
    { id: 'jaccard', label: 'Jaccard Coefficient (JC)', color: 'text-blue-400' },
    { id: 'preferential_attachment', label: 'Preferential Attachment (PA)', color: 'text-amber-400' },
    { id: 'resource_allocation', label: 'Resource Allocation (RA)', color: 'text-emerald-400' },
  ];

  const filteredLinks = (topLinks || []).filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return item.node_a.toLowerCase().includes(term) || item.node_b.toLowerCase().includes(term);
  });

  const exportAsCSV = () => {
    if (!topLinks || topLinks.length === 0) return;
    const headers = ['Rank', 'Node_A', 'Node_B', 'Primary_Score', 'Common_Neighbors', 'Jaccard', 'Adamic_Adar', 'Preferential_Attachment', 'Resource_Allocation'];
    const rows = topLinks.map(l => [
      l.rank,
      `"${l.node_a}"`,
      `"${l.node_b}"`,
      l.score,
      l.common_neighbors,
      l.jaccard,
      l.adamic_adar,
      l.preferential_attachment,
      l.resource_allocation
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `predicted_top_links_${currentHeuristic}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsJSON = () => {
    if (!topLinks || topLinks.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(topLinks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `predicted_top_links_${currentHeuristic}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col gap-5">
      
      {/* Table Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Top Ranked Link Candidates
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
              Non-Existing Edges
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluated <span className="text-slate-200 font-semibold">{totalNonEdges || 0}</span> prospective non-existing node pairs in graph topology.
          </p>
        </div>

        {/* Action buttons & Exporters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportAsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-pill text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Download CSV report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportAsJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-pill text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Download JSON report"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Heuristic Switcher Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        
        {/* Heuristic selection dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Ranking Heuristic
          </label>
          <div className="relative">
            <select
              value={currentHeuristic}
              onChange={(e) => onHeuristicChange(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors appearance-none cursor-pointer"
            >
              {heuristicOptions.map(opt => (
                <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Top K selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Top K Results Limit
          </label>
          <select
            value={topK}
            onChange={(e) => onTopKChange(Number(e.target.value))}
            className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
          >
            <option value={5}>Top 5 Candidates</option>
            <option value={10}>Top 10 Candidates</option>
            <option value={20}>Top 20 Candidates</option>
            <option value={50}>Top 50 Candidates</option>
          </select>
        </div>

        {/* Quick Search */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Filter Candidate Nodes
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by node name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/15 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Ranked Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-white/10">
              <th className="py-3 px-3.5 font-semibold text-center w-14">Rank</th>
              <th className="py-3 px-4 font-semibold">Candidate Node Pair</th>
              <th className="py-3 px-3.5 font-semibold">Rank Score</th>
              <th className="py-3 px-3.5 font-semibold">Common Nbrs</th>
              <th className="py-3 px-3.5 font-semibold">Jaccard</th>
              <th className="py-3 px-3.5 font-semibold">Adamic-Adar</th>
              <th className="py-3 px-3.5 font-semibold">Pref. Attach</th>
              <th className="py-3 px-3.5 font-semibold">Resource Alloc</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-900/30">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <p>Ranking non-existing edge pairs...</p>
                </td>
              </tr>
            ) : filteredLinks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-500">
                  No candidate links found matching query or graph is already a clique.
                </td>
              </tr>
            ) : (
              filteredLinks.map((item) => {
                const isCurrentSelection = 
                  (item.node_a === selectedNodeA && item.node_b === selectedNodeB) ||
                  (item.node_a === selectedNodeB && item.node_b === selectedNodeA);

                return (
                  <tr 
                    key={`${item.node_a}-${item.node_b}`}
                    className={`transition-colors ${isCurrentSelection ? 'bg-cyan-500/10' : 'hover:bg-white/5'}`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3.5 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                        item.rank === 1 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' :
                        item.rank === 2 ? 'bg-slate-300 text-slate-950' :
                        item.rank === 3 ? 'bg-amber-700/60 text-amber-200' :
                        'text-slate-400'
                      }`}>
                        {item.rank}
                      </span>
                    </td>

                    {/* Pair */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-cyan-300 font-mono text-xs">{item.node_a}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-semibold text-purple-300 font-mono text-xs">{item.node_b}</span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {item.score}
                      </span>
                    </td>

                    {/* CN */}
                    <td className="py-3 px-3.5 font-mono text-slate-300">{item.common_neighbors}</td>

                    {/* JC */}
                    <td className="py-3 px-3.5 font-mono text-slate-300">{item.jaccard.toFixed(3)}</td>

                    {/* AA */}
                    <td className="py-3 px-3.5 font-mono text-purple-300">{item.adamic_adar.toFixed(3)}</td>

                    {/* PA */}
                    <td className="py-3 px-3.5 font-mono text-amber-300">{item.preferential_attachment}</td>

                    {/* RA */}
                    <td className="py-3 px-3.5 font-mono text-emerald-300">{item.resource_allocation.toFixed(3)}</td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectPair(item.node_a, item.node_b)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          isCurrentSelection
                            ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/30'
                            : 'glass-pill text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/40'
                        }`}
                      >
                        {isCurrentSelection ? 'Inspecting' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
