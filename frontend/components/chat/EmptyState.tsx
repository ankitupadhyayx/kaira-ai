'use client';

import React from 'react';
import { Sparkles, Zap, Shield, Globe } from 'lucide-react';
import { SuggestionChips } from './SuggestionChips';
import { PromptSuggestion } from '../../features/chat/types/chat';

interface EmptyStateProps {
  onSelectSuggestion: (suggestion: PromptSuggestion) => void;
}

export function EmptyState({ onSelectSuggestion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[52vh] px-4 py-6 space-y-7 animate-fade-in">

      {/* ── KAIRA orb ── */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--k-accent), #00b3ff)',
              opacity: 0.2,
              filter: 'blur(16px)',
              transform: 'scale(1.5)',
            }}
          />
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--k-accent) 0%, #00b3ff 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            <Sparkles className="w-7 h-7" style={{ color: 'var(--k-bg)' }} />
          </div>
        </div>

        <div className="text-center space-y-2 max-w-sm">
          <h2 className="text-xl font-bold" style={{ color: 'var(--k-text)' }}>
            Hello! I&apos;m{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--k-accent) 0%, #00b3ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Kaira
            </span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--k-text-3)' }}>
            Your Mobiloitte enterprise assistant. Ask me about our AI solutions, blockchain engineering, careers, or global offices.
          </p>
        </div>

        {/* Capability pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: Zap,    label: 'AI & Engineering' },
            { icon: Shield, label: 'Blockchain & Web3' },
            { icon: Globe,  label: 'Global Offices' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
              style={{
                background: 'var(--k-accent-soft)',
                border: '1px solid var(--k-accent-border)',
                color: 'var(--k-accent-text)',
              }}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="w-full">
        <p
          className="text-[10px] font-mono text-center uppercase tracking-widest mb-3"
          style={{ color: 'var(--k-text-4)' }}
        >
          Try asking
        </p>
        <SuggestionChips onSelectSuggestion={onSelectSuggestion} layout="grid" />
      </div>
    </div>
  );
}
