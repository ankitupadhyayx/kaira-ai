'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Upload,
  Library,
  RefreshCw,
  Sliders,
  Terminal,
  MessageSquare,
  ShieldCheck,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useAdmin } from '../../features/admin/context/AdminContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { Logo } from '../common/Logo';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminUploadView } from './AdminUploadView';
import { AdminLibraryView } from './AdminLibraryView';
import { AdminProcessingView } from './AdminProcessingView';
import { AdminSettingsView } from './AdminSettingsView';
import { AdminLogsView } from './AdminLogsView';
import { MetadataModal } from './MetadataModal';
import { EditMetadataModal } from './EditMetadataModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { ChunkPreviewModal } from './ChunkPreviewModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ReplaceDocumentModal } from './ReplaceDocumentModal';
import { VersionHistoryModal } from './VersionHistoryModal';

export function AdminLayout() {
  const {
    activeTab,
    setActiveTab,
    metrics,
    toasts,
    selectedDocForMetadata,
    setSelectedDocForMetadata,
    selectedDocForEditMetadata,
    setSelectedDocForEditMetadata,
    selectedDocForPreview,
    setSelectedDocForPreview,
    selectedDocForChunks,
    setSelectedDocForChunks,
    selectedDocForDelete,
    setSelectedDocForDelete,
    selectedDocForReplace,
    setSelectedDocForReplace,
    selectedDocForVersions,
    setSelectedDocForVersions,
    softDeleteDocument,
    replaceDocument,
    updateDocumentMetadata,
    restoreDocumentVersion,
  } = useAdmin();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Center', icon: Upload },
    { id: 'library', label: 'Knowledge Library', icon: Library },
    { id: 'processing', label: 'Storage Monitor', icon: RefreshCw },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'logs', label: 'Audit Logs', icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/chat" className="flex items-center space-x-2 group">
              <Logo className="w-8 h-8 transition-transform group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="font-bold text-sm bg-gradient-to-r from-cyan-600 via-purple-600 to-indigo-600 dark:from-cyan-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Mobiloitte AI
                </span>
                <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase -mt-1">
                  Knowledge Control Center
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Phase 1 — Storage Vault Active</span>
            </div>
          </div>

          {/* Desktop Tab Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            <Link
              href="/chat"
              className="hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Return to Chatbot</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <AdminDashboardView />}
        {activeTab === 'upload' && <AdminUploadView />}
        {activeTab === 'library' && <AdminLibraryView />}
        {activeTab === 'processing' && <AdminProcessingView />}
        {activeTab === 'settings' && <AdminSettingsView />}
        {activeTab === 'logs' && <AdminLogsView />}
      </main>

      {/* Metadata Slide-over Modal */}
      <MetadataModal
        document={selectedDocForMetadata}
        onClose={() => setSelectedDocForMetadata(null)}
      />

      {/* Edit Metadata Modal */}
      <EditMetadataModal
        document={selectedDocForEditMetadata}
        onSave={(updates) => selectedDocForEditMetadata && updateDocumentMetadata(selectedDocForEditMetadata.document_id, updates)}
        onClose={() => setSelectedDocForEditMetadata(null)}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={selectedDocForPreview}
        onClose={() => setSelectedDocForPreview(null)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        document={selectedDocForDelete}
        onConfirm={() => selectedDocForDelete && softDeleteDocument(selectedDocForDelete.document_id)}
        onClose={() => setSelectedDocForDelete(null)}
      />

      {/* Replace Document Modal */}
      <ChunkPreviewModal
        document={selectedDocForChunks}
        onClose={() => setSelectedDocForChunks(null)}
      />

      <ReplaceDocumentModal
        document={selectedDocForReplace}
        onReplace={(file, changelog) => selectedDocForReplace && replaceDocument(selectedDocForReplace.document_id, file, changelog)}
        onClose={() => setSelectedDocForReplace(null)}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        document={selectedDocForVersions}
        onRestore={(versionStr) => selectedDocForVersions && restoreDocumentVersion(selectedDocForVersions.document_id, versionStr)}
        onClose={() => setSelectedDocForVersions(null)}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-semibold shadow-xl border animate-fade-in ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-800'
                : 'bg-zinc-900 text-zinc-100 border-zinc-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
