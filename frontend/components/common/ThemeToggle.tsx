'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-lg" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 rounded-lg flex items-center justify-center k-transition"
      style={{ color: 'var(--k-text-3)', background: 'transparent', border: '1px solid transparent' }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.color = 'var(--k-text)';
        btn.style.background = 'var(--k-surface-2)';
        btn.style.borderColor = 'var(--k-border)';
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.color = 'var(--k-text-3)';
        btn.style.background = 'transparent';
        btn.style.borderColor = 'transparent';
      }}
    >
      {isDark
        ? <Sun  className="w-4 h-4" style={{ transition: 'transform 0.2s' }} />
        : <Moon className="w-4 h-4" style={{ transition: 'transform 0.2s' }} />
      }
    </button>
  );
}
