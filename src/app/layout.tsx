// src/app/layout.tsx
import './globals.css';
import LayoutClient from '@/components/layout/LayoutClient';
import type { ReactNode } from 'react';
import { obraLetra, geist, geistMono } from './fonts';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${obraLetra.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="bg-gray-900 font-obra">
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}