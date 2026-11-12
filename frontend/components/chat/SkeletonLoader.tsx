'use client';

import React from 'react';

export function SkeletonLoader() {
  return (
    <div className="flex flex-col space-y-4 p-4 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl flex-shrink-0" style={{ background: 'var(--k-surface-2)' }} />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 rounded-lg w-24" style={{ background: 'var(--k-surface-2)' }} />
          <div className="h-2 rounded-lg w-16" style={{ background: 'var(--k-surface-2)' }} />
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-2/3 h-12 rounded-2xl rounded-tr-sm" style={{ background: 'var(--k-surface-2)' }} />
      </div>

      <div className="flex justify-start space-x-3">
        <div className="w-8 h-8 rounded-xl flex-shrink-0" style={{ background: 'var(--k-surface-2)' }} />
        <div className="w-3/4 space-y-2">
          {[100, 83, 67].map((w) => (
            <div key={w} className={`h-4 rounded-lg`} style={{ background: 'var(--k-surface-2)', width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
