import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-4">
        <div>
          © {new Date().getFullYear()} Mobiloitte Technologies. All rights reserved. Enterprise AI & Digital Transformation.
        </div>
        <div className="flex flex-wrap items-center space-x-6 font-mono text-[11px]">
          <span>Headquarters: New Delhi, India</span>
          <span>USA: Boston</span>
          <span>UK: London</span>
          <span>Singapore</span>
        </div>
      </div>
    </footer>
  );
}
