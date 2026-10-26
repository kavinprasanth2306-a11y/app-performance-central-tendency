import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      const res = await api.uploadDataset(file);
      onUploadSuccess(res);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-space-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative glass-modal rounded-2xl w-full max-w-lg p-6 border border-white/15 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Telemetry Dataset</h2>
              <p className="text-xs text-slate-400">Upload CSV, TSV, or JSON application performance logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`mt-5 border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? 'border-cyan-400 bg-cyan-500/10'
              : file
              ? 'border-emerald-400/50 bg-emerald-500/5'
              : 'border-white/15 hover:border-cyan-500/40 bg-white/5'
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={() => setFile(null)}
                className="mt-3 text-xs text-rose-400 hover:underline"
              >
                Choose a different file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-cyan-400 mb-3 animate-bounce" />
              <p className="text-sm font-medium text-slate-200">
                Drag and drop your telemetry file here, or{' '}
                <label className="text-cyan-400 hover:underline cursor-pointer">
                  browse
                  <input
                    type="file"
                    accept=".csv,.tsv,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Supports .CSV, .TSV, .JSON containing metrics like Response_Time_ms, CPU, Memory.
              </p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl glass-card text-xs text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {uploading ? 'Analyzing Telemetry...' : 'Parse & Analyze Dataset'}
          </button>
        </div>
      </div>
    </div>
  );
}
