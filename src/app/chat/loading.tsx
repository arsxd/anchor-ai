export default function ChatLoading() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-16 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </header>
      <div className="flex-1 p-4 space-y-4 max-w-3xl mx-auto w-full">
        <div className="h-16 bg-muted animate-pulse rounded-lg" />
        <div className="h-12 bg-muted animate-pulse rounded-lg w-3/4 ml-auto" />
        <div className="h-16 bg-muted animate-pulse rounded-lg w-2/3" />
      </div>
      <div className="border-t p-4 max-w-3xl mx-auto w-full">
        <div className="h-11 bg-muted animate-pulse rounded-lg" />
      </div>
    </main>
  );
}
