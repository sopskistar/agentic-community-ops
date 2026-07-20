"use client";

import { useState } from "react";

type GmailMessage = {
  id: string;
  threadId: string;
  subject?: string;
  sender?: string;
  receivedAt: string;
  snippet: string;
  labelIds: string[];
};

export function GmailClient() {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [status, setStatus] = useState("Not loaded");
  const [analysis, setAnalysis] = useState<unknown>(null);

  async function loadMessages() {
    setStatus("Loading recent inbox messages...");
    setAnalysis(null);
    const response = await fetch("/api/integrations/gmail/messages");
    const body = await response.json();

    if (!response.ok) {
      setStatus(body.error?.message ?? "Gmail inbox read failed.");
      return;
    }

    setMessages(body.messages);
    setStatus(`Loaded ${body.messages.length} recent messages.`);
  }

  async function analyzeMessage(messageId: string) {
    setStatus("Analyzing selected Gmail message...");
    const response = await fetch("/api/integrations/gmail/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId }),
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus(body.error?.message ?? "Gmail analysis failed.");
      return;
    }

    setAnalysis(body.result);
    setStatus("Analysis complete.");
  }

  return (
    <section className="mt-6 space-y-6">
      <div className="section-card p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Recent inbox messages</h2>
            <p className="mt-2 text-sm text-slate-600">{status}</p>
          </div>
          <button type="button" onClick={loadMessages} className="btn btn-primary">
            Load Recent Gmail
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {messages.map((message) => (
          <article key={message.id} className="interactive-card p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {message.subject ?? "No subject"}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {message.sender ?? "Unknown sender"} ·{" "}
                  {new Date(message.receivedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => analyzeMessage(message.id)}
                className="btn btn-secondary"
              >
                Analyze
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {message.snippet}
            </p>
          </article>
        ))}
      </div>

      {analysis ? (
        <section className="section-card p-5 md:p-6">
          <h2 className="text-2xl font-semibold">Analysis result</h2>
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </section>
      ) : null}
    </section>
  );
}
