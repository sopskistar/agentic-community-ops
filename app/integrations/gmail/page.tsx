import { GmailClient } from "./gmail-client";

export const metadata = {
  title: "Gmail Connection | Agentic Ops",
  description: "Read recent Gmail inbox messages in analyze-only mode.",
};

export default function GmailIntegrationPage() {
  return (
    <main className="app-bg min-h-screen text-slate-950">
      <div className="page-shell max-w-6xl">
        <section className="section-card p-6 md:p-8">
          <p className="kicker">Gmail Connection</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Gmail inbox analysis
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Gmail uses the readonly scope only. This page lists a small recent
            inbox window and lets a human trigger analysis. It does not send,
            modify, archive, label or delete email.
          </p>
        </section>
        <GmailClient />
      </div>
    </main>
  );
}
