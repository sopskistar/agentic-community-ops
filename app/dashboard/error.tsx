"use client";

export default function DashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-3xl">
      <div className="section-card border-red-200 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-700">
          Dashboard error
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          Project data could not be loaded.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          The dashboard hit an unexpected issue. No sensitive diagnostic details
          are shown in the browser.
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn mt-6 bg-red-600 text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
      </div>
    </main>
  );
}
