import React from 'react';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export function Logo({ className = '', showSubtitle = true }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* KAIRA gradient ring mark */}
      <div
        className="relative w-8 h-8 flex-shrink-0 rounded-xl p-[1.5px]"
        style={{
          background: 'conic-gradient(from 180deg, var(--k-accent), #00b3ff, #7c3aed, var(--k-accent))',
        }}
      >
        <div
          className="w-full h-full rounded-[10px] flex items-center justify-center"
          style={{ background: 'var(--k-bg)' }}
        >
          <span
            className="font-black text-sm tracking-tighter select-none"
            style={{ color: 'var(--k-accent-text)' }}
          >
            K
          </span>
        </div>
      </div>

      <div className="flex flex-col leading-none">
        <span
          className="font-semibold text-sm tracking-tight"
          style={{ color: 'var(--k-text)' }}
        >
          Mobiloitte
        </span>
        {showSubtitle && (
          <span
            className="text-[9px] uppercase font-mono tracking-[0.12em] mt-0.5"
            style={{ color: 'var(--k-accent-text)' }}
          >
            KAIRA AI
          </span>
        )}
      </div>
    </div>
  );
}
