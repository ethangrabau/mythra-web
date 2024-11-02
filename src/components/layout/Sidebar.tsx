import { Mic, ImagePlus } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-64 border-r h-screen bg-white shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Controls</h2>
        <div className="space-y-6">
          <div className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-medium mb-3 text-gray-700">Recording Status</h3>
            <button className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 group">
              <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Start Recording
            </button>
          </div>
          <div className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-medium mb-3 text-gray-700">Image Generation</h3>
            <button className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 group">
              <ImagePlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Enable Images
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
