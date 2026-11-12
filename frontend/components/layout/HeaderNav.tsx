'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeaderNavProps {
  onOpenAssistant: () => void;
}

export function HeaderNav({ onOpenAssistant }: HeaderNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 w-full k-transition"
      style={{
        background: scrolled ? 'var(--k-widget-bg)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--k-border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium">
            {['Overview', 'Services', 'AI & Tech Stack', 'Careers', 'Global Offices'].map((item, i) => (
              <Link
                key={item}
                href={`#${['overview','services','capabilities','careers','contact'][i]}`}
                className="k-transition"
                style={{ color: 'var(--k-text-3)' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--k-text)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--k-text-3)'}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/admin"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold k-transition"
              style={{
                background: 'var(--k-surface-2)',
                border: '1px solid var(--k-border)',
                color: 'var(--k-text-2)',
              }}
              title="Enterprise Admin Control Center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Admin</span>
            </Link>

            <ThemeToggle />

            <button
              onClick={onOpenAssistant}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold k-transition hover:opacity-85 active:scale-95"
              style={{
                background: 'var(--k-accent-soft)',
                border: '1px solid var(--k-accent-border)',
                color: 'var(--k-accent-text)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Kaira</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
