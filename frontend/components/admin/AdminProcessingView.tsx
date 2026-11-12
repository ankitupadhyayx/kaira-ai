'use client';

import React from 'react';
import {
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  HardDrive,
} from 'lucide-react';
import { useAdmin } from '../../features/admin/context/AdminContext';

export function AdminProcessingView() {
  const { documents } = useAdmin();

  const activeDocs = documents.filter((d) => d.is_active);
  const uploadedCount = activeDocs.filter((d) => d.status === 'Uploaded').length;
  const uploadingCount = activeDocs.filter((d) => d.status === 'Uploading').length;
  const failedCount = activeDocs.filter((d) => d.status === 'Failed').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Phase 1 Storage Status & Cloudinary Monitor</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor document upload progression to Cloudinary storage vault. Phase 1 handles secure document storage and metadata persistence only.
        </p>
      </div>

      {/* Storage Flow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Uploading */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-cyan-500/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <CloudUpload className="w-5 h-5" />
            </div>
            <span className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">{uploadingCount}</span>
          </div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">1. Uploading</h4>
          <p className="text-[11px] text-zinc-500">Multipart payload transfer to Cloudinary</p>
        </div>

        {/* Uploaded */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">{uploadedCount}</span>
          </div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">2. Uploaded</h4>
          <p className="text-[11px] text-zinc-500">Stored on Cloudinary & metadata persisted</p>
        </div>

        {/* Failed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-500/30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="font-mono font-bold text-lg text-zinc-900 dark:text-zinc-100">{failedCount}</span>
          </div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">3. Failed</h4>
          <p className="text-[11px] text-zinc-500">Payload corrupted or size limit exceeded</p>
        </div>
      </div>

      {/* Processing Boundary Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center space-x-3">
        <Lock className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <div>
          <span className="font-bold">Strict Phase 1 Boundaries Enforced:</span> Text extraction, token chunking, vector embeddings, pgvector indexing, and RAG retrieval belong strictly to Phase 2 (Document Processing). Original documents remain untouched.
        </div>
      </div>

      {/* Active Document Storage Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Cloudinary Document Vault Status</span>
          <span className="text-xs font-mono text-emerald-500 font-bold">Cloudinary API: Connected</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3.5">Document Title</th>
                <th className="px-6 py-3.5">Extension</th>
                <th className="px-6 py-3.5">Storage Status</th>
                <th className="px-6 py-3.5">Cloudinary Public ID</th>
                <th className="px-6 py-3.5">Uploaded Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {activeDocs.map((doc) => (
                <tr key={doc.document_id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                    {doc.title}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap font-mono">
                    .{doc.extension.toLowerCase()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        doc.status === 'Uploaded'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {doc.status === 'Uploaded' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                      {doc.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap font-mono text-zinc-500">
                    {doc.cloudinary_public_id}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap font-mono text-zinc-400">
                    {doc.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
