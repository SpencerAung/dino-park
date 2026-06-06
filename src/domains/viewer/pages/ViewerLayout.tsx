'use client';
import { Provider as JotaiProvider } from 'jotai';
import type { ReactNode } from 'react';
import { TransitionOverlay } from '../components/TransitionOverlay';

export function ViewerLayout({ children }: { children: ReactNode }) {
  return (
    <JotaiProvider>
      {children}
      <TransitionOverlay />
    </JotaiProvider>
  );
}
