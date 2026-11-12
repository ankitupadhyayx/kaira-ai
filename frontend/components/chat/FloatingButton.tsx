'use client';

import React from 'react';
import { Sparkles, X } from 'lucide-react';

interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function FloatingButton({ isOpen, onClick }: FloatingButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3">
      {/* Hint badge */}
      {!isOpen && (
        <div
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-medium animate-slide-up"
          style={{
            background: 'var(--k-surface)',
            border: '1px solid var(--k-accent-border)',
            color: 'var(--k-text-2)',
            boxShadow: 'var(--k-shadow-md)',
          }}
        >
          <Sparkles
            className="w-3.5 h-3.5"
            style={{ color: 'var(--k-accent-text)', animation: 'pulseAurora 2.5s ease-in-out infinite' }}
          />
          <span>Ask Kaira</span>
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={onClick}
        aria-label={isOpen ? 'Close Kaira' : 'Open Kaira AI Assistant'}
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center k-transition group hover:scale-105 active:scale-95"
        style={isOpen ? {
          background: 'var(--k-surface-2)',
          border: '1px solid var(--k-border)',
          boxShadow: 'var(--k-shadow-md)',
        } : {
          background: 'linear-gradient(135deg, var(--k-accent) 0%, #00b3ff 70%, #7c3aed 100%)',
          border: 'none',
          boxShadow: '0 0 20px rgba(0,150,130,0.2), 0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        {isOpen ? (
          <X
            className="w-5 h-5 k-transition group-hover:rotate-90"
            style={{ color: 'var(--k-text-3)' }}
          />
        ) : (
          <>
            <Sparkles className="w-6 h-6" style={{ color: 'var(--k-bg)' }} />
            {/* Online pulse dot */}
            <span
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
              style={{
                background: 'var(--k-online)',
                borderColor: 'var(--k-bg)',
                animation: 'pulseAurora 2.5s ease-in-out infinite',
              }}
            />
          </>
        )}
      </button>
    </div>
  );
}
