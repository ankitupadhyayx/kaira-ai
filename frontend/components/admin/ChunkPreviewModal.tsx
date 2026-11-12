'use client';

import React, { useState, useEffect } from 'react';
import { X, Layers, Copy, Check, RefreshCw } from 'lucide-react';
import { EnterpriseDocumentMetadata } from '../../types/admin';

interface ChunkRecord {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  page_number: number;
  section: string;
  heading: string;
  content: string;
  metadata: {
    token_count?: number;
    char_count?: number;
    start_offset?: number;
    end_offset?: number;
    title?: string;
    department?: string;
  };
}

interface ChunkPreviewModalProps {
  document: EnterpriseDocumentMetadata | null;
  onClose: () => void;
}

export function ChunkPreviewModal({ document, onClose }: ChunkPreviewModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [chunks, setChunks] = useState<ChunkRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/admin/documents/${document.document_id}/chunks`)
      .then((res) => res.json())
      .then((data) => {
        if (data.chunks && Array.isArray(data.chunks)) {
          setChunks(data.chunks);
        } else {
          setChunks([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch chunks:', err);
        setError('Could not connect to backend server to load chunks.');
        setLoading(false);
      });
  }, [document]);

  if (!document) return null;

  const handleCopyChunk = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-md">
                Generated Chunks Preview: {document.title}
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Document ID: {document.document_id} • Status: {document.status} • Total Chunks: {chunks.length}
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

        {/* Chunks Content Container */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {loading ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-500" />
              <p>Fetching document chunks from PostgreSQL Neon database...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-center font-medium">
              {error}
            </div>
          ) : chunks.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <p className="font-semibold text-sm">No chunks generated for this document yet.</p>
              <p className="text-xs mt-1 text-zinc-500">Document status: {document.status}. Ensure background pipeline completed successfully.</p>
            </div>
          ) : (
            chunks.map((chunk, index) => (
              <div
                key={chunk.chunk_id || index}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 space-y-2.5"
              >
                <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                      Chunk #{chunk.chunk_index !== undefined ? chunk.chunk_index : index + 1}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-300 font-semibold">{chunk.heading || 'General'}</span>
                    <span>•</span>
                    <span>{chunk.metadata?.token_count || Math.ceil(chunk.content.length / 4)} tokens</span>
                    <span>•</span>
                    <span>Page {chunk.page_number || 1}</span>
                  </div>

                  <button
                    onClick={() => handleCopyChunk(chunk.content, index)}
                    className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    title="Copy Chunk Content"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap">
                  {chunk.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
