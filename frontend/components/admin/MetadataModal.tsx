'use client';

import React from 'react';
import { X, FileText, CheckCircle2, Clock, Shield, Globe, User, Building, Hash } from 'lucide-react';
import { EnterpriseDocumentMetadata } from '../../types/admin';

interface MetadataModalProps {
  document: EnterpriseDocumentMetadata | null;
  onClose: () => void;
}

export function MetadataModal({ document, onClose }: MetadataModalProps) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-md">
                {document.title}
              </h3>
              <p className="text-xs text-zinc-500">Document ID: {document.document_id} | Extension: .{document.extension.toLowerCase()}</p>
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
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-700 dark:text-zinc-300">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Storage Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3 mr-1" /> {document.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Version</span>
              <span className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400">{document.version}</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">File Size</span>
              <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{(document.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Active Record</span>
              <span className="font-mono text-sm font-semibold text-cyan-600 dark:text-cyan-400">{document.is_active ? 'Active' : 'Soft Deleted'}</span>
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
                Description / Abstract
              </label>
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-xs leading-relaxed">
                {document.description}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Enterprise Metadata Attributes
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <Building className="w-4 h-4 text-cyan-500" />
                <div>
                  <span className="text-zinc-400 block text-[10px]">Department</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{document.department}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <Shield className="w-4 h-4 text-emerald-500" />
                <div>
                  <span className="text-zinc-400 block text-[10px]">Visibility Scope</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{document.visibility}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <Globe className="w-4 h-4 text-indigo-500" />
                <div>
                  <span className="text-zinc-400 block text-[10px]">Language</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{document.language}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <User className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="text-zinc-400 block text-[10px]">Author</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{document.author}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <Clock className="w-4 h-4 text-blue-500" />
                <div>
                  <span className="text-zinc-400 block text-[10px]">Created Date</span>
                  <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100 truncate">{document.created_at}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <Hash className="w-4 h-4 text-zinc-500" />
                <div>
                  <span className="text-zinc-400 block text-[10px]">SHA256 Hash</span>
                  <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]" title={document.hash}>
                    {document.hash}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                Document Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {document.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
          >
            Close Metadata
          </button>
        </div>
      </div>
    </div>
  );
}
