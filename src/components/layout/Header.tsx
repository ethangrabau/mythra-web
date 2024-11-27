// src/components/layout/Header.tsx
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Mic, Brain, Book } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex items-center space-x-4">
          <h1 
            onClick={() => router.push('/')} 
            className="text-xl font-obra text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
          >
            Mythra
          </h1>
          <nav className="hidden md:flex space-x-6">
            <button 
              onClick={() => router.push('/session')}
              className={`text-sm font-obra transition-colors flex items-center gap-2 
                ${pathname === '/session' ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
            >
              <Mic className="w-4 h-4" />
              Session
            </button>
            <button 
              onClick={() => router.push('/memory')}
              className={`text-sm font-obra transition-colors flex items-center gap-2 
                ${pathname === '/memory' ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
            >
              <Brain className="w-4 h-4" />
              Memory
            </button>
            <button 
              onClick={() => router.push('/recaps')}
              className={`text-sm font-obra transition-colors flex items-center gap-2 
                ${pathname === '/recaps' ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
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