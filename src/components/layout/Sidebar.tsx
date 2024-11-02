// Sidebar.tsx
"use client";
import { Mic, ImagePlus } from 'lucide-react'
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder'

export default function Sidebar() {
  const { isRecording, startRecording, stopRecording, error } = useAudioRecorder()

  const handleRecordingClick = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  return (
    <aside className="w-64 border-r h-screen bg-white shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-6 text-gray-800">Controls</h2>
        <div className="space-y-6">
          <div className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-sm font-medium mb-3 text-gray-700">Recording Status</h3>
            {error && (
              <p className="text-sm text-red-600 mb-3">{error}</p>
            )}
            <button 
              onClick={handleRecordingClick}
              className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center justify-center gap-2 group
                ${isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              <Mic className={`w-4 h-4 group-hover:scale-110 transition-transform ${isRecording ? 'animate-pulse' : ''}`} />
              {isRecording ? 'Stop Recording' : 'Start Recording'}
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