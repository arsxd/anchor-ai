export default function CaregiverLoading() {
  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-56 bg-muted animate-pulse rounded mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    </main>
  );
}
