'use client';

import React, { useState, useEffect } from 'react';
import { Eye, X, Copy, Check, FileText, RefreshCw, Layers } from 'lucide-react';
import { EnterpriseDocumentMetadata } from '../../types/admin';

interface DocumentPreviewModalProps {
  document: EnterpriseDocumentMetadata | null;
  onClose: () => void;
}

export function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!document) return;

    setLoading(true);
    fetch(`http://localhost:5000/admin/documents/${document.document_id}/preview`)
      .then((res) => res.json())
      .then((data) => {
        if (data.preview) {
          setPreviewPayload(data.preview);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load preview:', err);
        setLoading(false);
      });
  }, [document]);

  if (!document) return null;

  const ext = document.extension.toUpperCase();
  const rawText = previewPayload?.extractedText || previewPayload?.rawText || document.description || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText || document.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-lg">
                Extracted Text & Document Preview: {document.title}
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Document ID: {document.document_id} • Status: {document.status}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Copy Extracted Content"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Content Container */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {loading ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-500" />
              <p>Extracting text preview from Cloudinary / backend storage...</p>
            </div>
          ) : (
            <>
              {/* Cloudinary Asset Link */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-xl">
                  Asset Location: <code className="text-cyan-500 font-mono">{document.cloudinary_url}</code>
                </span>
                <a
                  href={document.cloudinary_url.startsWith('/') ? `http://localhost:5000${document.cloudinary_url}` : document.cloudinary_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg font-semibold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors flex-shrink-0"
                >
                  Open Original Document
                </a>
              </div>

              {/* Extracted Text Payload */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-500" />
                  <span>Pipeline Text Payload</span>
                </h4>
                <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {rawText || `[No raw text extracted yet. Run pipeline stage or upload document.]`}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
