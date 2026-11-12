'use client';

import * as React from 'react';
import { ThemeProvider } from '../components/ThemeProvider';
import { ToastProvider } from '../components/common/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
