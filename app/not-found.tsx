import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell flex min-h-[60vh] max-w-3xl items-center">
        <section className="section-card w-full p-6 md:p-8">
          <p className="kicker">404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The requested AgenticOps AI page does not exist or has moved. Use
            the navigation to return to a working workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary">
              Home
            </Link>
            <Link href="/integrations" className="btn btn-secondary">
              Integrations
            </Link>
            <Link href="/business" className="btn btn-secondary">
              Business Intelligence
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
