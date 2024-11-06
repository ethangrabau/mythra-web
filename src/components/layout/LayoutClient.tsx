// src/components/layout/LayoutClient.tsx
'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { ReactNode } from 'react';

interface LayoutClientProps {
  children: ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex flex-col overflow-auto">
        {children}
        <Footer />
      </div>
    </div>
  );
}