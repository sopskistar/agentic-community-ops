"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function GmailSyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  async function syncGmail() {
    setStatus("Syncing Gmail...");
    const response = await fetch("/api/integrations/gmail/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ maxResults: 5, q: "newer_than:7d" }),
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus(body.error?.message ?? "Gmail sync failed.");
      return;
    }

    setStatus(
      `Imported ${body.imported}, skipped ${body.skipped}, failed ${body.failed}.`,
    );
    startTransition(() => router.refresh());
  }

  return (
    <div className="mt-5 space-y-3">
      <button
        type="button"
        onClick={syncGmail}
        disabled={isPending || status === "Syncing Gmail..."}
        className="btn btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "Syncing Gmail..." || isPending ? "Syncing..." : "Sync Gmail"}
      </button>
      {status ? (
        <p className="text-sm font-semibold text-slate-700">{status}</p>
      ) : null}
    </div>
  );
}
