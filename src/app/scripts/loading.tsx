export default function ScriptsLoading() {
  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded mx-auto" />
        <div className="flex gap-2 flex-wrap justify-center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-28 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    </main>
  );
}
