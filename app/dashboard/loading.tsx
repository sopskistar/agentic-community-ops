export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-8 w-64 rounded-lg bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 rounded-lg bg-slate-200" />
          <div className="h-40 rounded-lg bg-slate-200" />
        </div>
      </div>
    </main>
  );
}
