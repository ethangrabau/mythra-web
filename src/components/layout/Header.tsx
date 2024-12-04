// src/components/layout/Header.tsx
'use client';
import { Mic, Brain, Book, Plus, StopCircle } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';

interface HeaderProps {
  isRecording?: boolean;
  onNewSession?: () => void;
  onStopRecording?: () => void;
}

export default function Header({ isRecording, onNewSession, onStopRecording }: HeaderProps) {
  return (
    <header className='border-b bg-background backdrop-blur-sm sticky top-0 z-10'>
      <div className='flex items-center justify-between h-16 px-8'>
        <div className='flex items-center space-x-4'>
          <h1 className='text-xl font-bold text-blue-600'>Mythra</h1>
          <nav className='hidden md:flex space-x-6'>
            <a
              href='#'
              className='text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors flex items-center gap-2'>
              <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
              Session
            </a>
            <a
              href='#'
              className='text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors flex items-center gap-2'>
              <Brain className='w-4 h-4' />
              Memory
            </a>
            <a
              href='#'
              className='text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors flex items-center gap-2'>
              <Book className='w-4 h-4' />
              Recaps
            </a>
            <a
              href='/campaigns'
              className='text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors flex items-center gap-2'>
              <Book className='w-4 h-4' />
              Campaigns
            </a>
            <ThemeToggle />
          </nav>
        </div>

        {isRecording ? (
          <button
            onClick={onStopRecording}
            className='px-4 py-2 text-sm font-medium text-foreground bg-red-600 rounded-md hover:bg-red-700 shadow-sm hover:shadow transition-all flex items-center gap-2'>
            <StopCircle className='w-4 h-4' />
            Stop Recording
          </button>
        ) : (
          <button
            onClick={onNewSession}
            className='px-4 py-2 text-sm font-medium text-foreground bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm hover:shadow transition-all flex items-center gap-2'>
            <Plus className='w-4 h-4' />
            New Session
          </button>
        )}
      </div>
    </header>
  );
}
