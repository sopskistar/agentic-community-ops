export default function AppLoading() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-7xl space-y-6" aria-live="polite">
        <div className="section-card p-6 md:p-8">
          <div className="skeleton h-4 w-40 rounded" />
          <div className="skeleton mt-4 h-10 max-w-xl rounded" />
          <div className="skeleton mt-4 h-4 max-w-3xl rounded" />
          <div className="skeleton mt-2 h-4 max-w-2xl rounded" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div className="skeleton h-40 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
