'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[65vh] px-4">
      <div className="text-center space-y-6 max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Application Error
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
            {error.message || 'An unexpected error occurred.'}
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold shadow-md transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Operation</span>
        </button>
      </div>
    </div>
  );
}
