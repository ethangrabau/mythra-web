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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 flex flex-col overflow-auto bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  );
}