'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  content: string;
  label?: string;
}

export function CopyButton({ content, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silently fail */
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy response'}
      aria-label={copied ? 'Copied!' : 'Copy response'}
      className={`inline-flex items-center space-x-1.5 text-[11px] font-medium transition-all duration-200 px-2 py-1 rounded-md
        ${copied
          ? 'text-aurora-400 bg-aurora-500/10 border border-aurora-500/20'
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/8'
        }`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          {label && <span>{label || 'Copied'}</span>}
          {!label && <span>Copied</span>}
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          {label && <span>{label}</span>}
          {!label && <span>Copy</span>}
        </>
      )}
    </button>
  );
}
