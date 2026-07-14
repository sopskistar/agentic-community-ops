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
        <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-5 py-10 text-slate-950">
          <div className="max-w-xl rounded-lg border border-red-200 bg-white p-6 shadow-sm">
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
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
