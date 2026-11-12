'use client';

import React, { useState } from 'react';
import { Terminal, Search, Filter, Trash2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAdmin } from '../../features/admin/context/AdminContext';

export function AdminLogsView() {
  const { logs, clearLogs } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      log.message.toLowerCase().includes(q) ||
      log.user.toLowerCase().includes(q) ||
      (log.document_id && log.document_id.toLowerCase().includes(q)) ||
      log.timestamp.includes(q);

    const matchesStatus = selectedStatus === 'ALL' || log.status === selectedStatus;
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

    return matchesSearch && matchesStatus && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Upload & Knowledge Audit Logs</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time audit stream recording Upload Started, Upload Completed, Upload Failed, Deleted, Restored, and Viewed actions.
          </p>
        </div>

        <button
          onClick={clearLogs}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Logs</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Filter logs by user, action, message, doc ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center">
          <div className="flex items-center space-x-1.5 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Action:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="Upload Started">Upload Started</option>
              <option value="Upload Completed">Upload Completed</option>
              <option value="Upload Failed">Upload Failed</option>
              <option value="Deleted">Deleted</option>
              <option value="Restored">Restored</option>
              <option value="Viewed">Viewed</option>
              <option value="Metadata Update">Metadata Update</option>
              <option value="Version Uploaded">Version Uploaded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Document ID</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Message / Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 font-sans">
                    No upload log records matching current search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-3.5 text-zinc-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-6 py-3.5 font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                      {log.user || 'System Admin'}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-xs">
                      {log.document_id || '—'}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : log.status === 'WARN'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : log.status === 'ERROR'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {log.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
