import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';

export default function DataExplorerTable({ selectedFilters, selectedMetric }) {
  const [data, setData] = useState({ total: 0, records: [], columns: [] });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Response_Time_ms');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getRawData({
        page,
        page_size: pageSize,
        search,
        sort_by: sortBy,
        sort_dir: sortDir,
        configuration: selectedFilters?.configuration,
        device_model: selectedFilters?.device_model,
        network_type: selectedFilters?.network_type,
      });
      setData(res);
    } catch (err) {
      console.error('Error fetching raw data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, sortBy, sortDir, selectedFilters]);

  // Handle Search submit / debounce
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  };

  const totalPages = Math.ceil((data.total || 0) / pageSize) || 1;

  // Filter columns to display nicely
  const displayColumns = data.columns.filter(
    (col) => !col.startsWith('__')
  );

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-glass mb-8">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Raw Telemetry Records Explorer
            </h2>
            <p className="text-xs text-slate-400">
              Frosted-glass tabular viewer with instant sorting, multi-attribute search, and pagination
            </p>
          </div>
        </div>

        {/* Search & Page Size */}
        <div className="flex items-center space-x-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records..."
              className="glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs w-48 sm:w-64"
            />
          </form>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="glass-input rounded-xl px-2.5 py-1.5 text-xs"
          >
            <option value={10} className="bg-space-900">10 / page</option>
            <option value={15} className="bg-space-900">15 / page</option>
            <option value={25} className="bg-space-900">25 / page</option>
            <option value={50} className="bg-space-900">50 / page</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-4 rounded-xl border border-white/5">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-slate-300 font-mono">
              {displayColumns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3 cursor-pointer hover:text-cyan-300 transition-colors select-none"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>{col.replace(/_/g, ' ')}</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === col ? 'text-cyan-400' : 'text-slate-500'}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-sans">
            {loading ? (
              <tr>
                <td colSpan={displayColumns.length} className="px-4 py-12 text-center text-slate-400">
                  Loading records...
                </td>
              </tr>
            ) : data.records.length === 0 ? (
              <tr>
                <td colSpan={displayColumns.length} className="px-4 py-12 text-center text-slate-400">
                  No telemetry records match your criteria.
                </td>
              </tr>
            ) : (
              data.records.map((row, idx) => {
                // Highlight row if response time is high
                const isTailLatency = row.Response_Time_ms && Number(row.Response_Time_ms) > 350;
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-white/5 transition-colors ${
                      isTailLatency ? 'bg-rose-500/5' : ''
                    }`}
                  >
                    {displayColumns.map((col) => {
                      const val = row[col];
                      const isNumeric = typeof val === 'number';
                      const isHighlightMetric = col === selectedMetric;

                      return (
                        <td
                          key={col}
                          className={`px-4 py-2.5 font-mono ${
                            isHighlightMetric
                              ? 'text-cyan-300 font-semibold'
                              : isTailLatency && col === 'Response_Time_ms'
                              ? 'text-rose-400 font-semibold'
                              : 'text-slate-300'
                          }`}
                        >
                          {col === 'Configuration' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-violet-500/15 text-violet-300 border border-violet-500/30">
                              {String(val).replace('Config_', '').replace(/_/g, ' ')}
                            </span>
                          ) : col === 'Network_Type' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {String(val)}
                            </span>
                          ) : isNumeric ? (
                            Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-3 border-t border-white/5 gap-3 text-xs text-slate-400">
        <div>
          Showing{' '}
          <strong className="text-white">
            {data.total > 0 ? (page - 1) * pageSize + 1 : 0}
          </strong>{' '}
          to{' '}
          <strong className="text-white">
            {Math.min(page * pageSize, data.total)}
          </strong>{' '}
          of <strong className="text-cyan-400">{data.total}</strong> records
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg glass-card border-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="px-3 py-1.5 rounded-lg glass-badge text-cyan-300 font-mono">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg glass-card border-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
