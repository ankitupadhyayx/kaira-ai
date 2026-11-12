'use client';

import React from 'react';
import { Sparkles, User } from 'lucide-react';

interface AvatarProps {
  role: 'assistant' | 'user' | 'system';
  size?: 'sm' | 'md' | 'lg';
  showOnlineStatus?: boolean;
}

export function Avatar({ role, size = 'md', showOnlineStatus = false }: AvatarProps) {
  const dims = { sm: 24, md: 32, lg: 40 }[size];
  const iconCls = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-5 h-5' }[size];
  const dotCls = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' }[size];
  const br = { sm: 8, md: 10, lg: 12 }[size];

  if (role === 'assistant') {
    return (
      <div className="relative inline-flex flex-shrink-0" style={{ width: dims, height: dims }}>
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--k-accent) 0%, #00b3ff 100%)',
            borderRadius: br,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <Sparkles className={`${iconCls} flex-shrink-0`} style={{ color: 'var(--k-bg)' }} />
        </div>
        {showOnlineStatus && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 ${dotCls} rounded-full border-2`}
            style={{
              background: 'var(--k-online)',
              borderColor: 'var(--k-bg)',
              animation: 'pulseAurora 2.5s ease-in-out infinite',
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-flex flex-shrink-0" style={{ width: dims, height: dims }}>
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          background: 'var(--k-surface-2)',
          border: '1px solid var(--k-border)',
          borderRadius: br,
        }}
      >
        <User className={`${iconCls} flex-shrink-0`} style={{ color: 'var(--k-text-3)' }} />
      </div>
    </div>
  );
}
