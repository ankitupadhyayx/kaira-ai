'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileType,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useAdmin } from '../../features/admin/context/AdminContext';
import { SupportedFileType } from '../../types/admin';

export function AdminUploadView() {
  const { uploadQueue, queueFiles, removeQueueItem, startUploadAll, retryUploadItem } = useAdmin();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SUPPORTED_EXTENSIONS: SupportedFileType[] = [
    'PDF',
    'DOCX',
    'DOC',
    'TXT',
    'MD',
    'CSV',
    'XLSX',
    'PPTX',
    'JSON',
  ];

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      queueFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      queueFiles(selectedFiles);
      e.target.value = '';
    }
  };

  const hasReadyFiles = uploadQueue.some((item) => item.status === 'Ready');
  const hasFailedFiles = uploadQueue.some((item) => item.status === 'Failed' && item.type !== 'UNSUPPORTED');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Upload Enterprise Knowledge</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Drag and drop business documents, spreadsheets, or code files to automatically chunk, embed, and index for RAG.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
          isDragging
            ? 'border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10'
            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-cyan-500 dark:hover:border-cyan-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md,.csv,.xlsx,.pptx,.json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Drag & Drop files here, or <span className="text-cyan-600 dark:text-cyan-400 underline">Browse Files</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
          Upload up to 50MB per file. Automatic text extraction, semantic chunking, and dense vector embedding.
        </p>

        {/* Supported File Types Badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-1.5 max-w-xl">
          {SUPPORTED_EXTENSIONS.map((ext) => (
            <span
              key={ext}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
            >
              .{ext.toLowerCase()}
            </span>
          ))}
        </div>
      </div>

      {/* File Queue & Upload Progress Section */}
      {uploadQueue.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Upload Queue ({uploadQueue.length} files)
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Review files before starting automated ingestion.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {hasFailedFiles && (
                <button
                  onClick={() => {
                    const firstFailed = uploadQueue.find((i) => i.status === 'Failed' && i.type !== 'UNSUPPORTED');
                    if (firstFailed) retryUploadItem(firstFailed.id);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Failed</span>
                </button>
              )}

              {hasReadyFiles && (
                <button
                  onClick={startUploadAll}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-sm flex items-center space-x-1.5"
                >
                  <span>Upload All Files</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {uploadQueue.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                {/* File Details */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                        {item.type}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        ({(item.sizeBytes / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>

                    {/* Progress bar */}
                    {item.status === 'Uploading' && (
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}

                    {item.errorMessage && (
                      <p className="text-[11px] text-rose-500 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> {item.errorMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Indicator & Action */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  {item.status === 'Ready' && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      Ready to Upload
                    </span>
                  )}

                  {item.status === 'Uploading' && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center">
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> {item.progress}% Uploading
                    </span>
                  )}

                  {item.status === 'Completed' && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Completed & Queued
                    </span>
                  )}

                  {item.status === 'Failed' && (
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        Failed
                      </span>
                      {item.type !== 'UNSUPPORTED' && (
                        <button
                          onClick={() => retryUploadItem(item.id)}
                          className="p-1 rounded text-amber-600 hover:bg-amber-500/10"
                          title="Retry Upload"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Remove File Button */}
                  <button
                    onClick={() => removeQueueItem(item.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
