'use client';

import Link from 'next/link';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Maximize2, Minimize2, Plus, X, Menu, Wifi, WifiOff, ShieldCheck } from 'lucide-react';
import { DisplayMode } from '../../features/chat/types/chat';

interface HeaderProps {
  displayMode: DisplayMode;
  onToggleDisplayMode: () => void;
  onClose: () => void;
  onNewChat: () => void;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
  isConnected?: boolean;
}

export function Header({
  displayMode,
  onToggleDisplayMode,
  onClose,
  onNewChat,
  onToggleSidebar,
  showSidebarToggle = false,
  isConnected = true,
}: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-4 py-3 flex-shrink-0"
      style={{
        background: 'var(--k-header-bg)',
        borderBottom: '1px solid var(--k-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Left */}
      <div className="flex items-center space-x-3">
        {showSidebarToggle && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg k-transition md:hidden"
            style={{ color: 'var(--k-text-3)' }}
            aria-label="Toggle sidebar"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--k-text)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--k-surface-2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--k-text-3)';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <Logo />

        {/* Connection status */}
        <div
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono k-transition"
          style={{
            background: isConnected ? 'var(--k-accent-soft)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isConnected ? 'var(--k-accent-border)' : 'rgba(239,68,68,0.2)'}`,
            color: isConnected ? 'var(--k-accent-text)' : 'var(--k-error)',
          }}
          title={isConnected ? 'Kaira is online' : 'Connection lost'}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isConnected ? 'var(--k-online)' : 'var(--k-error)',
              animation: isConnected ? 'pulseAurora 2.5s ease-in-out infinite' : 'none',
            }}
          />
          <span>{isConnected ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-0.5">
        <Link
          href="/admin"
          title="Admin Control Center"
          aria-label="Admin Control Center"
          className="p-1.5 rounded-lg k-transition"
          style={{ color: 'var(--k-text-3)', background: 'transparent', border: '1px solid transparent' }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLAnchorElement;
            btn.style.color = 'var(--k-accent-text)';
            btn.style.background = 'var(--k-surface-2)';
            btn.style.borderColor = 'var(--k-border)';
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLAnchorElement;
            btn.style.color = 'var(--k-text-3)';
            btn.style.background = 'transparent';
            btn.style.borderColor = 'transparent';
          }}
        >
          <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </Link>

        <HeaderIconBtn onClick={onNewChat} title="New conversation" aria-label="New conversation">
          <Plus className="w-4 h-4" />
        </HeaderIconBtn>

        <ThemeToggle />

        <HeaderIconBtn
          onClick={onToggleDisplayMode}
          title={displayMode === 'widget' ? 'Expand to fullscreen' : 'Minimize to widget'}
          aria-label={displayMode === 'widget' ? 'Expand' : 'Minimize'}
        >
          {displayMode === 'widget' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </HeaderIconBtn>

        <HeaderIconBtn
          onClick={onClose}
          title="Close Kaira"
          aria-label="Close Kaira"
          danger
        >
          <X className="w-4 h-4" />
        </HeaderIconBtn>
      </div>
    </header>
  );
}

function HeaderIconBtn({
  onClick, title, children, danger = false, 'aria-label': ariaLabel
}: {
  onClick: () => void;
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
      className="p-1.5 rounded-lg k-transition"
      style={{ color: 'var(--k-text-3)', background: 'transparent', border: '1px solid transparent' }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.color = danger ? 'var(--k-error)' : 'var(--k-text)';
        btn.style.background = danger ? 'rgba(239,68,68,0.08)' : 'var(--k-surface-2)';
        btn.style.borderColor = danger ? 'rgba(239,68,68,0.15)' : 'var(--k-border)';
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.color = 'var(--k-text-3)';
        btn.style.background = 'transparent';
        btn.style.borderColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
}
