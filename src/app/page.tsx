import MainContent from '@/components/layout/MainContent'
import { PlayCircle, Images } from 'lucide-react'

export default function Home() {
  return (
    <MainContent>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome to Mythra</h2>
          <p className="text-gray-600 mt-2">Start a new session or view past recordings.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button className="p-8 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-left group">
            <div className="flex items-center gap-3 mb-2">
              <PlayCircle className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-800">Start New Session</h3>
            </div>
            <p className="text-sm text-gray-600">Begin recording a new D&D session with AI-powered visualizations.</p>
          </button>
          <button className="p-8 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-left group">
            <div className="flex items-center gap-3 mb-2">
              <Images className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-800">View Recaps</h3>
            </div>
            <p className="text-sm text-gray-600">Browse through past session recaps and generated imagery.</p>
          </button>
        </div>
      </div>
    </MainContent>
  )
}