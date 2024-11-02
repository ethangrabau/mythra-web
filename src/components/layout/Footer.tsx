export default function Footer() {
    return (
      // Added bg-white/50 and backdrop-blur-sm
      <footer className="border-t bg-white/50 backdrop-blur-sm">
        <div className="px-8 py-4 flex justify-between items-center"> {/* Increased px-6 to px-8 */}
          <div className="text-sm text-gray-500">
            Status: Ready
          </div>
          <div className="text-sm text-gray-500">
            Mythra v0.1
          </div>
        </div>
      </footer>
    )
  }