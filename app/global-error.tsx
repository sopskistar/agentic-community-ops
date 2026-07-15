"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="app-bg flex min-h-screen items-center justify-center px-5 py-10 text-slate-950">
          <div className="section-card max-w-xl border-red-200 p-6">
            <p className="text-sm font-semibold uppercase text-red-700">
              Application error
            </p>
            <h1 className="mt-3 text-3xl font-semibold">
              Something went wrong.
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              The application could not complete this request. Sensitive
              diagnostic details are not shown in the browser.
            </p>
            <button
              type="button"
              onClick={reset}
              className="btn mt-6 bg-red-600 text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
