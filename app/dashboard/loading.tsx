export default function DashboardLoading() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl space-y-6" aria-live="polite">
        <div className="skeleton h-8 w-64 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="skeleton h-40 rounded-lg" />
          <div className="skeleton h-40 rounded-lg" />
        </div>
      </div>
    </main>
  );
}
