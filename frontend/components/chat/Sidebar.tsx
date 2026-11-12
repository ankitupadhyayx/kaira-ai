'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Conversation } from '../../features/chat/types/chat';
import {
  Plus, MessageSquare, Briefcase, Cpu, Phone, Layers,
  X, ChevronRight, Sparkles, Search, Pin, PinOff,
  Trash2, Edit3, Check, Eraser
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation?: (id: string) => void;
  onRenameConversation?: (id: string, title: string) => void;
  onPinConversation?: (id: string) => void;
  onClearConversation?: (id: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onPinConversation,
  onClearConversation,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editRef = useRef<HTMLInputElement>(null);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const pinned   = filtered.filter((c) => c.isPinned);
  const recent   = filtered.filter((c) => !c.isPinned);

  const startEdit = useCallback((conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setTimeout(() => editRef.current?.select(), 40);
  }, []);

  const commitEdit = useCallback((id: string) => {
    if (editTitle.trim() && onRenameConversation) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  }, [editTitle, onRenameConversation]);

  const sidebarContent = (
    <div
      className="w-64 h-full flex flex-col"
      style={{
        background: 'var(--k-sidebar-bg)',
        borderRight: '1px solid var(--k-sidebar-border)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--k-border-2)' }}
      >
        <Logo showSubtitle={true} />
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg k-transition md:hidden"
            style={{ color: 'var(--k-text-3)' }}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 pt-3 space-y-3 flex flex-col flex-1 min-h-0">

          {/* New Chat */}
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-medium k-transition flex-shrink-0"
            style={{
              background: 'var(--k-accent-soft)',
              border: '1px solid var(--k-accent-border)',
              color: 'var(--k-accent-text)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          {/* Search */}
          <div
            className="flex items-center space-x-2 px-3 py-2 rounded-xl flex-shrink-0"
            style={{ background: 'var(--k-surface-2)', border: '1px solid var(--k-border)' }}
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--k-text-4)' }} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="flex-1 bg-transparent text-xs focus:outline-none"
              style={{ color: 'var(--k-text)', fontFamily: 'Inter, sans-serif' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="flex-shrink-0">
                <X className="w-3 h-3" style={{ color: 'var(--k-text-4)' }} />
              </button>
            )}
          </div>

          {/* Conversation lists */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-2">

            {/* Pinned */}
            {pinned.length > 0 && (
              <ConvGroup
                label="Pinned"
                conversations={pinned}
                activeId={activeConversationId}
                editingId={editingId}
                editTitle={editTitle}
                editRef={editRef}
                onSelect={onSelectConversation}
                onEdit={startEdit}
                onCommitEdit={commitEdit}
                setEditTitle={setEditTitle}
                onPin={onPinConversation}
                onDelete={onDeleteConversation}
                onClear={onClearConversation}
              />
            )}

            {/* Recent */}
            <ConvGroup
              label={pinned.length > 0 ? 'Recent' : 'Conversations'}
              conversations={recent}
              activeId={activeConversationId}
              editingId={editingId}
              editTitle={editTitle}
              editRef={editRef}
              onSelect={onSelectConversation}
              onEdit={startEdit}
              onCommitEdit={commitEdit}
              setEditTitle={setEditTitle}
              onPin={onPinConversation}
              onDelete={onDeleteConversation}
              onClear={onClearConversation}
            />

            {/* Empty search result */}
            {search && filtered.length === 0 && (
              <p className="text-xs text-center py-6" style={{ color: 'var(--k-text-4)' }}>
                No conversations found
              </p>
            )}
          </div>

          {/* Explore topics */}
          <div
            className="pt-3 space-y-1 flex-shrink-0"
            style={{ borderTop: '1px solid var(--k-border-2)' }}
          >
            <p className="text-[10px] font-mono uppercase tracking-widest px-1 pb-1" style={{ color: 'var(--k-text-4)' }}>
              Explore
            </p>
            {[
              { icon: Layers,    label: 'AI & Engineering' },
              { icon: Cpu,       label: 'Blockchain & Web3' },
              { icon: Briefcase, label: 'Careers & Hiring' },
              { icon: Phone,     label: 'Global Offices' },
            ].map(({ icon: Icon, label }) => (
              <ExploreItem key={label} icon={<Icon className="w-3.5 h-3.5" />} label={label} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ borderTop: '1px solid var(--k-border-2)' }}
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3 h-3" style={{ color: 'var(--k-accent-text)' }} />
          <span className="text-[10px] font-mono" style={{ color: 'var(--k-text-4)' }}>KAIRA v2.4</span>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--k-online)', animation: 'pulseAurora 2.5s ease-in-out infinite' }}
          />
        </div>
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block h-full flex-shrink-0">{sidebarContent}</aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div
            className="fixed inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-slide-up">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

/* ── Conversation group ──────────────────────────────── */
function ConvGroup({
  label, conversations, activeId, editingId, editTitle, editRef,
  onSelect, onEdit, onCommitEdit, setEditTitle, onPin, onDelete, onClear
}: {
  label: string;
  conversations: Conversation[];
  activeId: string;
  editingId: string | null;
  editTitle: string;
  editRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (id: string) => void;
  onEdit: (conv: Conversation) => void;
  onCommitEdit: (id: string) => void;
  setEditTitle: (v: string) => void;
  onPin?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClear?: (id: string) => void;
}) {
  if (conversations.length === 0) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-mono uppercase tracking-widest px-1 py-1" style={{ color: 'var(--k-text-4)' }}>
        {label}
      </p>
      {conversations.map((conv) => {
        const isActive  = conv.id === activeId;
        const isEditing = editingId === conv.id;
        return (
          <div
            key={conv.id}
            className="conv-item relative flex items-center rounded-lg group"
            style={isActive ? {
              background: 'var(--k-accent-soft)',
              border: '1px solid var(--k-accent-border)',
            } : {
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'var(--k-surface-2)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
            }}
          >
            {isEditing ? (
              /* ── Inline rename ── */
              <div className="flex items-center w-full px-2.5 py-1.5 space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--k-accent-text)' }} />
                <input
                  ref={editRef as React.RefObject<HTMLInputElement>}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onCommitEdit(conv.id);
                    if (e.key === 'Escape') { setEditTitle(''); /* cancel */ }
                  }}
                  onBlur={() => onCommitEdit(conv.id)}
                  className="flex-1 text-xs bg-transparent focus:outline-none"
                  style={{ color: 'var(--k-text)', fontFamily: 'Inter, sans-serif' }}
                  maxLength={60}
                />
                <button onClick={() => onCommitEdit(conv.id)} aria-label="Save rename">
                  <Check className="w-3.5 h-3.5" style={{ color: 'var(--k-accent-text)' }} />
                </button>
              </div>
            ) : (
              <>
                {/* ── Conversation row ── */}
                <button
                  onClick={() => onSelect(conv.id)}
                  className="flex items-center space-x-2.5 px-2.5 py-2 text-xs text-left flex-1 min-w-0 rounded-lg"
                  style={{ color: isActive ? 'var(--k-accent-text)' : 'var(--k-text-3)' }}
                >
                  {conv.isPinned
                    ? <Pin className="w-3 h-3 flex-shrink-0" />
                    : <MessageSquare className="w-3 h-3 flex-shrink-0" />
                  }
                  <span className="truncate font-medium">{conv.title}</span>
                </button>

                {/* ── Hover action buttons ── */}
                <div className="conv-actions flex items-center space-x-0.5 pr-1.5 flex-shrink-0">
                  {onPin && (
                    <SidebarMicroBtn
                      onClick={(e) => { e.stopPropagation(); onPin(conv.id); }}
                      title={conv.isPinned ? 'Unpin' : 'Pin conversation'}
                      aria-label={conv.isPinned ? 'Unpin' : 'Pin'}
                    >
                      {conv.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                    </SidebarMicroBtn>
                  )}
                  <SidebarMicroBtn
                    onClick={(e) => { e.stopPropagation(); onEdit(conv); }}
                    title="Rename"
                    aria-label="Rename conversation"
                  >
                    <Edit3 className="w-3 h-3" />
                  </SidebarMicroBtn>
                  {onClear && (
                    <SidebarMicroBtn
                      onClick={(e) => { e.stopPropagation(); onClear(conv.id); }}
                      title="Clear chat history"
                      aria-label="Clear chat"
                    >
                      <Eraser className="w-3 h-3" />
                    </SidebarMicroBtn>
                  )}
                  {onDelete && (
                    <SidebarMicroBtn
                      onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                      title="Delete conversation"
                      aria-label="Delete conversation"
                      danger
                    >
                      <Trash2 className="w-3 h-3" />
                    </SidebarMicroBtn>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SidebarMicroBtn({
  onClick, title, children, danger = false, 'aria-label': ariaLabel
}: {
  onClick: (e: React.MouseEvent) => void;
  title?: string;
  children: React.ReactNode;
  danger?: boolean;
  'aria-label'?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className="p-1 rounded k-transition"
      style={{ color: 'var(--k-text-4)', background: 'transparent' }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.color = danger ? 'var(--k-error)' : 'var(--k-text-2)';
        btn.style.background = danger ? 'rgba(239,68,68,0.1)' : 'var(--k-surface-3)';
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.color = 'var(--k-text-4)';
        btn.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function ExploreItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer k-transition"
      style={{ color: 'var(--k-text-3)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.color = 'var(--k-text)';
        (e.currentTarget as HTMLDivElement).style.background = 'var(--k-surface-2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.color = 'var(--k-text-3)';
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <span className="flex items-center space-x-2">
        {icon}
        <span>{label}</span>
      </span>
      <ChevronRight className="w-3 h-3 opacity-40" />
    </div>
  );
}
