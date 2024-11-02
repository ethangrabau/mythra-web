// src/components/layout/Header.tsx
import { Mic, Brain, Book, Plus } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-600">Mythra</h1>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Session
            </a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Memory
            </a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
              <Book className="w-4 h-4" />
              Recaps
            </a>
          </nav>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm hover:shadow transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Session
        </button>
      </div>
    </header>
  )
}