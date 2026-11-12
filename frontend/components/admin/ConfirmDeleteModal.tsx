'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { EnterpriseDocumentMetadata } from '../../types/admin';

interface ConfirmDeleteModalProps {
  document: EnterpriseDocumentMetadata | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDeleteModal({ document, onConfirm, onClose }: ConfirmDeleteModalProps) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Soft Delete Document?
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Are you sure you want to soft-delete <strong className="text-zinc-900 dark:text-zinc-100">{document.title}</strong>?
            The document will be marked as <code className="text-rose-500 font-mono font-bold">is_active = false</code> and moved to Trash. You can restore it anytime.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-xs font-mono space-y-1">
          <div className="text-zinc-500">Document ID: {document.document_id}</div>
          <div className="text-zinc-500">Department: {document.department}</div>
          <div className="text-zinc-500">Version: {document.version}</div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors"
          >
            Soft Delete Document
          </button>
        </div>
      </div>
    </div>
  );
}
