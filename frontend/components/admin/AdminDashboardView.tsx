'use client';

import React from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  CloudUpload,
  Upload,
  ArrowRight,
  TrendingUp,
  Activity,
  Database,
  Eye,
  Edit3,
} from 'lucide-react';
import { useAdmin } from '../../features/admin/context/AdminContext';

export function AdminDashboardView() {
  const {
    metrics,
    documents,
    logs,
    setActiveTab,
    setSelectedDocForPreview,
    setSelectedDocForEditMetadata,
  } = useAdmin();

  const activeDocs = documents.filter((d) => d.is_active);
  const recentDocs = activeDocs.slice(0, 4);
  const recentLogs = logs.slice(0, 5);

  const storageLimitBytes = 1073741824; // 1 GB allocation
  const storagePercent = Math.min(100, Math.round((metrics.storageUsedBytes / storageLimitBytes) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Phase 1 — Enterprise Knowledge Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Storage-first Knowledge Control Center: Upload, organize, preview, manage, and store enterprise knowledge on Cloudinary.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('upload')}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-cyan-600 hover:bg-cyan-700 text-white shadow-md transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Knowledge</span>
        </button>
      </div>

      {/* 6 Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Documents */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold text-zinc-400">Total</span>
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{metrics.totalUploadedFiles}</div>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">Total Ingested Files</p>
        </div>

        {/* Uploaded Documents */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold text-emerald-500">Uploaded</span>
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{metrics.readyFilesCount}</div>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">Cloudinary Stored</p>
        </div>

        {/* Uploading Queue */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-cyan-500/20 shadow-xs">
          <div className="flex items-center justify-between text-cyan-500 mb-2">
            <CloudUpload className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold text-cyan-500">Queue</span>
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{metrics.pendingFilesCount}</div>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">Payload In-Progress</p>
        </div>

        {/* Failed */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-500/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-500 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold text-rose-500">Failed</span>
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{metrics.failedFilesCount}</div>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">Validation Rejections</p>
        </div>

        {/* Storage Used */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-purple-500 mb-2">
            <HardDrive className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold text-purple-500">Storage</span>
          </div>
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {(metrics.storageUsedBytes / 1024 / 1024).toFixed(1)} MB
          </div>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">{storagePercent}% of 1 GB Vault</p>
        </div>

        {/* Formats */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-blue-500 mb-2">
            <Database className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold text-blue-500">Formats</span>
          </div>
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{metrics.supportedFileTypesCount}</div>
          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">Supported Types</p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
          <Activity className="w-4 h-4 text-cyan-500" />
          <span>Quick Administrative Actions</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-cyan-500 hover:text-white text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Upload Center
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-500 hover:text-white text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Knowledge Library
          </button>
          <button
            onClick={() => setActiveTab('processing')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-white text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Storage Monitor
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-white text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>

      {/* 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Knowledge Documents (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Recent Enterprise Documents
            </h2>
            <button
              onClick={() => setActiveTab('library')}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center space-x-1"
            >
              <span>View All ({activeDocs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
            {recentDocs.map((doc) => (
              <div key={doc.document_id} className="p-4 flex items-center justify-between hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-cyan-500 flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                      {doc.title}
                    </span>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5 space-x-2">
                      <span>{doc.department}</span>
                      <span>•</span>
                      <span>{doc.version}</span>
                      <span>•</span>
                      <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      doc.status === 'Uploaded'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {doc.status}
                  </span>

                  <button
                    onClick={() => setSelectedDocForPreview(doc)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-cyan-600 hover:bg-cyan-500/10 transition-colors"
                    title="Preview Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSelectedDocForEditMetadata(doc)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-purple-600 hover:bg-purple-500/10 transition-colors"
                    title="Edit Metadata"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs">
            <button
              onClick={() => setActiveTab('library')}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
            >
              Open Complete Knowledge Library $\to$
            </button>
          </div>
        </div>

        {/* Right Column: Storage Progress & Logs */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Cloudinary Vault Storage</span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{storagePercent}%</span>
            </div>

            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${storagePercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>Used: {(metrics.storageUsedBytes / 1024 / 1024).toFixed(1)} MB</span>
              <span>Capacity: 1.00 GB</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Upload Audit Stream</span>
              <button
                onClick={() => setActiveTab('logs')}
                className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Logs
              </button>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs p-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{log.user}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="text-zinc-700 dark:text-zinc-300 text-[11px] leading-tight truncate">
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
