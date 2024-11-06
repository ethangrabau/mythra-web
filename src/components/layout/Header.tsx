// src/components/layout/Header.tsx
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Mic, Brain, Book } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex items-center space-x-4">
          <h1 
            onClick={() => router.push('/')} 
            className="text-xl font-bold text-blue-600 cursor-pointer"
          >
            Mythra
          </h1>
          <nav className="hidden md:flex space-x-6">
            <button 
              onClick={() => router.push('/session')}
              className={`text-sm font-medium transition-colors flex items-center gap-2 
                ${pathname === '/session' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <Mic className="w-4 h-4" />
              Session
            </button>
            <button 
              onClick={() => router.push('/memory')}
              className={`text-sm font-medium transition-colors flex items-center gap-2 
                ${pathname === '/memory' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <Brain className="w-4 h-4" />
              Memory
            </button>
            <button 
              onClick={() => router.push('/recaps')}
              className={`text-sm font-medium transition-colors flex items-center gap-2 
                ${pathname === '/recaps' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <Book className="w-4 h-4" />
              Recaps
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}