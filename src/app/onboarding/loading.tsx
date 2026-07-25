export default function OnboardingLoading() {
  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-11 w-32 bg-muted animate-pulse rounded-lg mx-auto" />
      </div>
    </main>
  );
}
