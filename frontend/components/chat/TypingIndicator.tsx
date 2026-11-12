'use client';

import React from 'react';
import { Avatar } from '../common/Avatar';

export function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3 px-4 py-2 animate-fade-in">
      <Avatar role="assistant" size="md" />
      <div className="flex flex-col space-y-1">
        <span
          className="text-[11px] font-semibold tracking-tight"
          style={{ color: 'var(--k-accent-text)' }}
        >
          Kaira
        </span>
        <div
          className="inline-flex items-center space-x-2 px-4 py-3 rounded-2xl rounded-tl-none"
          style={{
            background: 'var(--k-ai-bg)',
            border: '1px solid var(--k-ai-border)',
            boxShadow: 'var(--k-ai-shadow)',
          }}
        >
          {[0, 200, 400].map((delay) => (
            <span
              key={delay}
              className="block w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--k-accent)',
                animation: `typingDot 1.4s ease-in-out infinite`,
                animationDelay: `${delay}ms`,
              }}
            />
          ))}
          <span
            className="text-[11px] font-mono ml-1"
            style={{ color: 'var(--k-text-3)' }}
          >
            Kaira is thinking…
          </span>
        </div>
      </div>
    </div>
  );
}
