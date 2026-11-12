'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Trash2,
  Download,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  UploadCloud,
  History,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { useAdmin } from '../../features/admin/context/AdminContext';

export function AdminLibraryView() {
  const {
    documents,
    setSelectedDocForMetadata,
    setSelectedDocForEditMetadata,
    setSelectedDocForPreview,
    setSelectedDocForChunks,
    setSelectedDocForDelete,
    setSelectedDocForReplace,
    setSelectedDocForVersions,
    restoreDocument,
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedLang, setSelectedLang] = useState<string>('ALL');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('ALL');
  const [showTrash, setShowTrash] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'name' | 'size'>('latest');

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    // Soft delete status matching
    if (showTrash) {
      if (doc.is_active) return false;
    } else {
      if (!doc.is_active || doc.deleted_at !== null) return false;
    }

    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.original_filename.toLowerCase().includes(q) ||
      doc.department.toLowerCase().includes(q) ||
      doc.tags.some((t) => t.toLowerCase().includes(q));

    const matchesType = selectedType === 'ALL' || doc.extension === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || doc.status === selectedStatus;
    const matchesDept = selectedDept === 'ALL' || doc.department === selectedDept;
    const matchesLang = selectedLang === 'ALL' || doc.language === selectedLang;
    const matchesVis = selectedVisibility === 'ALL' || doc.visibility === selectedVisibility;

    return matchesSearch && matchesType && matchesStatus && matchesDept && matchesLang && matchesVis;
  });

  // Sorting
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === 'latest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === 'size') return b.size - a.size;
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0;
  });

  const handleDownload = (filename: string, url: string) => {
    let targetUrl = url;
    if (url && url.startsWith('/')) {
      targetUrl = `http://localhost:5000${url}`;
    } else if (!url) {
      targetUrl = `http://localhost:5000/data/uploads/${encodeURIComponent(filename)}`;
    }
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Enterprise Knowledge Library</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Search, filter, preview, edit metadata, manage versions, and soft-delete/restore enterprise files.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showTrash
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
            }`}
          >
            {showTrash ? 'Viewing Trash (Soft-Deleted)' : 'View Soft-Deleted Trash'}
          </button>

          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <span>Showing: <strong className="text-cyan-600 dark:text-cyan-400">{sortedDocs.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Toolbar & Multi-Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search title, filename, department, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
            {/* Format */}
            <div className="flex items-center space-x-1 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="DOC">DOC</option>
                <option value="TXT">TXT</option>
                <option value="MD">MD</option>
                <option value="CSV">CSV</option>
                <option value="XLSX">XLSX</option>
                <option value="PPTX">PPTX</option>
                <option value="JSON">JSON</option>
              </select>
            </div>

            {/* Department */}
            <div className="flex items-center space-x-1 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="text-zinc-400">Dept:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Depts</option>
                <option value="Executive Leadership">Executive</option>
                <option value="Artificial Intelligence Practice">AI Practice</option>
                <option value="Blockchain Engineering">Blockchain</option>
                <option value="DevOps & Infrastructure">DevOps</option>
                <option value="Human Resources">HR</option>
                <option value="General Operations">General</option>
              </select>
            </div>

            {/* Visibility */}
            <div className="flex items-center space-x-1 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="text-zinc-400">Scope:</span>
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Scopes</option>
                <option value="Public">Public</option>
                <option value="Internal">Internal</option>
                <option value="Confidential">Confidential</option>
                <option value="Restricted">Restricted</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-1 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Document</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Version</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Language</th>
                <th className="px-5 py-3.5">Visibility</th>
                <th className="px-5 py-3.5">Size</th>
                <th className="px-5 py-3.5">Uploaded By</th>
                <th className="px-5 py-3.5">Uploaded Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {sortedDocs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-zinc-400">
                    {showTrash
                      ? 'No soft-deleted documents found in trash.'
                      : 'No documents found matching search & filter criteria.'}
                  </td>
                </tr>
              ) : (
                sortedDocs.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    {/* Document */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span
                            onClick={() => setSelectedDocForMetadata(doc)}
                            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer truncate block max-w-xs"
                            title={doc.title}
                          >
                            {doc.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono block truncate max-w-xs">
                            {doc.original_filename}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {doc.department}
                      </span>
                    </td>

                    {/* Version */}
                    <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-purple-600 dark:text-purple-400">
                      <button
                        onClick={() => setSelectedDocForVersions(doc)}
                        className="hover:underline flex items-center space-x-1"
                        title="View version history"
                      >
                        <History className="w-3 h-3" />
                        <span>{doc.version}</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          doc.status === 'Uploaded'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {doc.status === 'Uploaded' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                        {doc.status}
                      </span>
                    </td>

                    {/* Language */}
                    <td className="px-5 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {doc.language}
                    </td>

                    {/* Visibility */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {doc.visibility}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-zinc-500">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </td>

                    {/* Uploaded By */}
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-zinc-700 dark:text-zinc-300">
                      {doc.uploaded_by}
                    </td>

                    {/* Uploaded Date */}
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-zinc-400 text-[11px]">
                      {doc.created_at}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                      {showTrash ? (
                        <button
                          onClick={() => restoreDocument(doc.document_id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                          title="Restore Soft-Deleted File"
                        >
                          <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedDocForPreview(doc)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-600 hover:bg-cyan-500/10 transition-colors"
                            title="Preview Document Content"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedDocForChunks(doc)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
                            title="View Generated Recursive Text Chunks"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedDocForEditMetadata(doc)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-600 hover:bg-purple-500/10 transition-colors"
                            title="Edit Metadata"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedDocForReplace(doc)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                            title="Upload New Version"
                          >
                            <UploadCloud className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedDocForMetadata(doc)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                            title="Inspect Enterprise Metadata"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.original_filename, doc.cloudinary_url)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                            title="Download Original File"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedDocForDelete(doc)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                            title="Soft Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
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
