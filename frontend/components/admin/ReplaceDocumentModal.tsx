'use client';

import React, { useState } from 'react';
import { UploadCloud, X, CheckCircle2 } from 'lucide-react';
import { EnterpriseDocumentMetadata } from '../../types/admin';

interface ReplaceDocumentModalProps {
  document: EnterpriseDocumentMetadata | null;
  onReplace: (file: File, changelog?: string) => void;
  onClose: () => void;
}

export function ReplaceDocumentModal({ document, onReplace, onClose }: ReplaceDocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changelog, setChangelog] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!document) return null;

  const nextVersionStr = `Version ${(document.version_number || 1) + 1}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    onReplace(selectedFile, changelog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Upload New Document Version</h3>
              <p className="text-xs text-zinc-500">
                Current: <strong className="text-purple-600 dark:text-purple-400">{document.version}</strong> $\to$ Next: <strong className="text-emerald-500">{nextVersionStr}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              dragActive
                ? 'border-purple-500 bg-purple-500/5'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40'
            }`}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center space-x-3 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
                <div className="text-left">
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block truncate max-w-xs">{selectedFile.name}</span>
                  <span className="text-[10px] text-zinc-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Drag & drop replacement file here, or{' '}
                  <label className="text-purple-600 dark:text-purple-400 font-semibold underline cursor-pointer">
                    browse
                    <input type="file" onChange={handleFileChange} className="hidden" />
                  </label>
                </p>
                <p className="text-[10px] text-zinc-400 mt-1">Uploads next version to Cloudinary without overwriting existing files</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
              Version Changelog Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Updated 2026 Q3 policy figures and legal compliance terms"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white shadow-md transition-colors"
            >
              Upload & Advance to {nextVersionStr}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
