export default function DashboardLoading() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl animate-pulse space-y-6">
        <div className="h-8 w-64 rounded-lg bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 rounded-lg bg-slate-200" />
          <div className="h-40 rounded-lg bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
