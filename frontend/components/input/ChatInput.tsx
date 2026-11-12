'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  maxLength?: number;
  placeholder?: string;
  autoFocus?: boolean;
}

export function ChatInput({
  onSendMessage,
  isTyping,
  maxLength = 1000,
  placeholder = 'Message Kaira…',
  autoFocus = true,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wasTypingRef = useRef(false);

  /* ── Auto-resize textarea ──────────────────────────── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, [input]);

  /* ── Auto-focus on mount ───────────────────────────── */
  useEffect(() => {
    if (autoFocus) {
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [autoFocus]);

  /* ── Restore focus after Kaira finishes responding ── */
  useEffect(() => {
    if (wasTypingRef.current && !isTyping) {
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
    wasTypingRef.current = isTyping;
  }, [isTyping]);

  /* ── Send ─────────────────────────────────────────── */
  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [input, isTyping, onSendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const canSend = input.trim().length > 0 && !isTyping;
  const remaining = maxLength - input.length;
  const isNearLimit = remaining < maxLength * 0.15;
  const charPercent = Math.min((input.length / maxLength) * 100, 100);

  return (
    <div className="px-3 pb-3 pt-1 flex-shrink-0">
      {/* ── Single-row input wrapper ── */}
      <div
        className="relative flex items-end rounded-2xl k-transition"
        style={{
          background: isFocused ? 'var(--k-surface)' : 'var(--k-input-bg)',
          border: `1.5px solid ${isFocused ? 'var(--k-border-focus)' : 'var(--k-border)'}`,
          boxShadow: isFocused ? 'var(--k-input-focus)' : 'var(--k-shadow-sm)',
        }}
      >
        {/* Textarea — grows up, not down */}
        <textarea
          ref={textareaRef}
          id="kaira-input"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isTyping ? 'Kaira is responding…' : placeholder}
          disabled={isTyping}
          rows={1}
          maxLength={maxLength}
          aria-label="Message Kaira"
          aria-multiline="true"
          className="flex-1 bg-transparent text-sm focus:outline-none resize-none leading-relaxed max-h-36"
          style={{
            color: 'var(--k-text)',
            caretColor: 'var(--k-accent)',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '11px 0 11px 14px',
          }}
        />

        {/* Right-side controls — always inline */}
        <div className="flex items-center space-x-1.5 flex-shrink-0 pr-2 pb-1.5">
          {/* Char counter ring (only when near limit) */}
          {input.length > 0 && (
            <svg
              width="16" height="16"
              viewBox="0 0 18 18"
              style={{ transform: 'rotate(-90deg)', opacity: isNearLimit ? 1 : 0.5 }}
            >
              <title>{`${remaining} characters remaining`}</title>
              <circle cx="9" cy="9" r="7" fill="none" stroke="var(--k-border)" strokeWidth="2" />
              <circle
                cx="9" cy="9" r="7"
                fill="none"
                stroke={isNearLimit ? 'var(--k-error)' : 'var(--k-accent)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 7}`}
                strokeDashoffset={`${2 * Math.PI * 7 * (1 - charPercent / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.2s ease, stroke 0.2s ease' }}
              />
            </svg>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label={isTyping ? 'Kaira is responding' : 'Send message'}
            title="Send (Enter)"
            className="flex items-center justify-center w-7 h-7 rounded-xl k-transition select-none flex-shrink-0"
            style={canSend ? {
              background: 'var(--k-accent)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            } : {
              background: 'transparent',
              opacity: 0.35,
              cursor: 'not-allowed',
            }}
          >
            {isTyping ? (
              <Square className="w-3 h-3" style={{ color: 'var(--k-text-inv)', fill: 'var(--k-text-inv)' }} />
            ) : (
              <Send className="w-3 h-3" style={{ color: canSend ? 'var(--k-text-inv)' : 'var(--k-text-3)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[9px] text-center mt-1.5 font-mono" style={{ color: 'var(--k-text-4)' }}>
        Kaira · Mobiloitte AI · Responses may not always be accurate
      </p>
    </div>
  );
}
