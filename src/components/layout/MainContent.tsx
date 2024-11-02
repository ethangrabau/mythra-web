export default function MainContent({ children }: { children: React.ReactNode }) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    )
  }