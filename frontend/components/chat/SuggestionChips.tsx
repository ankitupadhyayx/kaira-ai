'use client';

import React, { useState } from 'react';
import { PromptSuggestion } from '../../features/chat/types/chat';
import { PROMPT_SUGGESTIONS } from '../../features/chat/mock/conversations';
import { Loader2 } from 'lucide-react';

interface SuggestionChipsProps {
  suggestions?: PromptSuggestion[];
  onSelectSuggestion: (suggestion: PromptSuggestion) => void;
  isDisabled?: boolean;
  layout?: 'wrap' | 'grid';
}

export function SuggestionChips({
  suggestions,
  onSelectSuggestion,
  isDisabled = false,
  layout = 'wrap',
}: SuggestionChipsProps) {
  const [clickedId, setClickedId] = useState<string | null>(null);
  const items = suggestions && suggestions.length > 0 ? suggestions : PROMPT_SUGGESTIONS;

  const handleClick = (sug: PromptSuggestion) => {
    if (isDisabled || clickedId) return;
    setClickedId(sug.id);
    onSelectSuggestion(sug);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, sug: PromptSuggestion) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(sug);
    }
  };

  if (layout === 'grid' && (!suggestions || suggestions.length === 0)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto w-full">
        {PROMPT_SUGGESTIONS.map((sug) => (
          <button
            key={sug.id}
            onClick={() => handleClick(sug)}
            onKeyDown={(e) => handleKeyDown(e, sug)}
            disabled={isDisabled || clickedId === sug.id}
            aria-label={`Ask: ${sug.label}`}
            className="flex items-start space-x-3 p-3.5 rounded-xl text-left k-transition group disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            style={{
              background: 'var(--k-surface)',
              border: '1px solid var(--k-border)',
              boxShadow: 'var(--k-shadow-sm)',
            }}
            onMouseEnter={(e) => {
              if (!isDisabled && !clickedId) {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.background = 'var(--k-accent-soft)';
                btn.style.borderColor = 'var(--k-accent-border)';
                btn.style.boxShadow = 'var(--k-shadow-md)';
                btn.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.background = 'var(--k-surface)';
              btn.style.borderColor = 'var(--k-border)';
              btn.style.boxShadow = 'var(--k-shadow-sm)';
              btn.style.transform = 'translateY(0)';
            }}
          >
            <div
              className="p-2 rounded-lg flex-shrink-0 mt-0.5 text-base"
              style={{ background: 'var(--k-accent-soft)' }}
            >
              {sug.icon || '🚀'}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-semibold leading-tight mb-0.5" style={{ color: 'var(--k-text)' }}>
                {sug.label}
              </span>
              <span className="block text-[11px] leading-relaxed line-clamp-1" style={{ color: 'var(--k-text-3)' }}>
                {sug.prompt || sug.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap gap-2 pt-2.5 pb-1 max-w-full animate-fade-in"
      role="group"
      aria-label="Suggested quick replies"
    >
      {items.map((sug, idx) => {
        const isClicked = clickedId === sug.id;
        const iconDisplay = sug.icon || '🚀';

        return (
          <button
            key={sug.id || `sug-${idx}`}
            onClick={() => handleClick(sug)}
            onKeyDown={(e) => handleKeyDown(e, sug)}
            disabled={isDisabled || clickedId !== null}
            aria-label={`Suggested follow-up: ${sug.label}`}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-medium border k-transition cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: isClicked ? 'var(--k-accent-soft)' : 'var(--k-surface-2)',
              borderColor: isClicked ? 'var(--k-accent-border)' : 'var(--k-border)',
              color: 'var(--k-text-2)',
              boxShadow: 'var(--k-shadow-sm)',
              animationDelay: `${idx * 60}ms`,
            }}
            onMouseEnter={(e) => {
              if (!isDisabled && !clickedId) {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.background = 'var(--k-accent-soft)';
                btn.style.borderColor = 'var(--k-accent-border)';
                btn.style.color = 'var(--k-text)';
                btn.style.transform = 'translateY(-1.5px)';
                btn.style.boxShadow = 'var(--k-shadow-md)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isClicked) {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.background = 'var(--k-surface-2)';
                btn.style.borderColor = 'var(--k-border)';
                btn.style.color = 'var(--k-text-2)';
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'var(--k-shadow-sm)';
              }
            }}
          >
            {isClicked ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 flex-shrink-0" />
            ) : (
              <span className="text-sm leading-none flex-shrink-0">{iconDisplay}</span>
            )}
            <span className="leading-tight text-left">{sug.label}</span>
          </button>
        );
      })}
    </div>
  );
}
