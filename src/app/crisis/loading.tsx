export default function CrisisLoading() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6 text-center">
        <div className="h-10 w-48 bg-muted animate-pulse rounded mx-auto" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="space-y-3">
          <div className="h-14 bg-muted animate-pulse rounded-lg" />
          <div className="h-14 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    </main>
  );
}
