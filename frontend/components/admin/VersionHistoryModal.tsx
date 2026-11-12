'use client';

import React from 'react';
import { History, X, CheckCircle2, RotateCcw } from 'lucide-react';
import { EnterpriseDocumentMetadata } from '../../types/admin';

interface VersionHistoryModalProps {
  document: EnterpriseDocumentMetadata | null;
  onRestore: (versionId: string) => void;
  onClose: () => void;
}

export function VersionHistoryModal({ document, onRestore, onClose }: VersionHistoryModalProps) {
  if (!document) return null;

  const currentVersion = document.version;
  const history = document.version_history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-md">
                Version History: {document.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Active Version: <strong className="text-emerald-500">{currentVersion}</strong> | Historical Snapshots: {history.length}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Active Version Card */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Active {currentVersion}
              </span>
              <span className="font-mono text-zinc-400">{document.created_at}</span>
            </div>

            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{document.original_filename}</div>
            <div className="text-zinc-500 flex items-center space-x-3">
              <span>Author: {document.author}</span>
              <span>•</span>
              <span>Size: {(document.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>

          {/* Historical Versions List */}
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block pt-2">
            Historical Version Snapshots
          </label>

          {history.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-800">
              No previous version snapshots available. Replace document to create Version 2.
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((ver) => (
                <div
                  key={ver.version_id}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs space-y-2 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{ver.version_string}</span>
                      <span className="text-zinc-400">•</span>
                      <span className="font-mono text-zinc-500">{ver.created_at}</span>
                    </div>
                    <div className="text-zinc-700 dark:text-zinc-300 font-medium">{ver.original_filename}</div>
                    <div className="text-[11px] text-zinc-400">{ver.changelog || 'No changelog note'}</div>
                  </div>

                  <button
                    onClick={() => {
                      onRestore(ver.version_id);
                      onClose();
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-cyan-500 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
          >
            Close Version History
          </button>
        </div>
      </div>
    </div>
  );
}
