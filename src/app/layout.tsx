// src/app/layout.tsx
import './globals.css';
import LayoutClient from '@/components/layout/LayoutClient';
import type { ReactNode } from 'react';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}