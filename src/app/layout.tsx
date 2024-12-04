// src/app/layout.tsx
import './globals.css';
import LayoutClient from '@/components/layout/LayoutClient';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      {/* <body className='bg-secondary/50'> */}
      <body suppressHydrationWarning>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <LayoutClient>{children}</LayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
