"use client";

import { useMemo, useState } from "react";

import { analyseBusinessCommunication } from "../../lib/business/analyse-business-communication";
import { businessProfiles } from "../../lib/business/profiles";
import {
  businessAnalysisPurposes,
  type BusinessAnalysisPurpose,
  type BusinessAnalysisResult,
} from "../../lib/business/types";

const uploadFormats = [
  {
    label: "Paste text",
    detail: "Use the text area below.",
    status: "Implemented",
  },
  {
    label: "TXT",
    detail: "Plain-text files are loaded in the browser.",
    status: "Implemented",
  },
  {
    label: "PDF",
    detail: "Extraction is not implemented yet.",
    status: "Coming Soon",
  },
  {
    label: "DOCX",
    detail: "Word document parsing is not implemented yet.",
    status: "Coming Soon",
  },
  {
    label: "CSV",
    detail: "Structured row analysis is planned.",
    status: "Coming Soon",
  },
  {
    label: "Excel",
    detail: "Spreadsheet parsing is planned.",
    status: "Coming Soon",
  },
] as const;

const futureFeatures = [
  "Automatic CRM sync",
  "Email integrations",
  "Slack integration",
  "Microsoft Teams",
  "Google Workspace",
  "Ticket creation",
  "Salesforce",
  "HubSpot",
];

const pipeline = [
  ["Incoming Message", "Implemented"],
  ["Normalize", "Implemented"],
  ["Identify Context", "Implemented"],
  ["Business Rules", "Implemented"],
  ["AI Analysis", "Demo Logic"],
  ["Recommendations", "Implemented"],
] as const;

const sampleMessages = [
  {
    label: "Support issue",
    content:
      "Hi Support Center, our invoice payment failed and the account is blocked. Can you help today and confirm the next step?",
  },
  {
    label: "Sales lead",
    content:
      "Hello Demo SaaS, we are interested in pricing for 40 seats. Could you send a quote and schedule a product demo next week?",
  },
  {
    label: "Internal update",
    content:
      "Team, the launch checklist is almost complete. Please confirm the support owner and send final release notes by tomorrow.",
  },
];

export function BusinessClient() {
  const [content, setContent] = useState(sampleMessages[0].content);
  const [purpose, setPurpose] =
    useState<BusinessAnalysisPurpose>("Customer Support");
  const [profileId, setProfileId] = useState("support-center");
  const [analysis, setAnalysis] = useState<BusinessAnalysisResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selectedProfile = useMemo(
    () =>
      businessProfiles.find((profile) => profile.id === profileId) ??
      businessProfiles[0],
    [profileId],
  );

  function runAnalysis() {
    setAnalysis(
      analyseBusinessCommunication({
        content,
        purpose,
        profile: selectedProfile,
      }),
    );
  }

  function loadSample(nextContent: string) {
    setContent(nextContent);
    setAnalysis(null);
    setUploadError(null);
  }

  async function handleTxtUpload(file: File | undefined) {
    setUploadError(null);
    setAnalysis(null);

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".txt") && file.type !== "text/plain") {
      setUploadError("Only TXT upload is implemented in this MVP.");
      return;
    }

    const text = await file.text();
    setContent(text.slice(0, 6000));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[0.92fr_0.72fr]">
        <div className="section-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="kicker">Communication Input</p>
              <h2 className="mt-3 text-2xl font-semibold">
                Paste or load a business message.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Paste text directly or upload a TXT file. Other document and
                spreadsheet formats are shown as roadmap placeholders and are
                not parsed by this MVP.
              </p>
            </div>
            <span className="badge border-emerald-200 bg-emerald-50 text-emerald-800">
              Second context MVP
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadFormats.map((format) => (
              <FormatCard key={format.label} format={format} />
            ))}
          </div>

          <div className="mt-6 grid gap-5">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">
                Business communication
              </span>
              <textarea
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);
                  setAnalysis(null);
                }}
                rows={9}
                maxLength={6000}
                className="field leading-6"
                placeholder="Paste a business email, support note, sales message or team update."
              />
              <span className="block text-xs text-slate-500">
                {content.length}/6000 characters
              </span>
            </label>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">
                  Sample messages
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleMessages.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => loadSample(sample.content)}
                      className="btn btn-secondary min-h-9 px-3 py-2 text-xs"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">
                  Upload TXT
                </span>
                <input
                  type="file"
                  accept=".txt,text/plain"
                  onChange={(event) => handleTxtUpload(event.target.files?.[0])}
                  className="field text-sm"
                />
              </label>
            </div>

            {uploadError ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                {uploadError}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="section-card p-5 md:p-6">
            <p className="kicker">Business Knowledge Base</p>
            <label className="mt-4 block space-y-2">
              <span className="text-sm font-semibold text-slate-800">
                Business profile
              </span>
              <select
                value={profileId}
                onChange={(event) => {
                  setProfileId(event.target.value);
                  setAnalysis(null);
                }}
                className="field"
              >
                {businessProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {selectedProfile.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {selectedProfile.context}
              </p>
              <dl className="mt-4 grid gap-3 text-sm">
                <ProfileDetail label="Industry" value={selectedProfile.industry} />
                <ProfileDetail
                  label="Response style"
                  value={selectedProfile.responseStyle}
                />
              </dl>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Profile selection currently changes display metadata only. Durable
              business knowledge-base persistence is planned.
            </p>
          </section>

          <section className="section-card p-5 md:p-6">
            <fieldset>
              <legend className="kicker">Analysis Options</legend>
              <div className="mt-4 grid gap-2">
                {businessAnalysisPurposes.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 transition-colors hover:border-teal-200 hover:bg-teal-50"
                  >
                    <input
                      type="radio"
                      name="purpose"
                      value={item}
                      checked={purpose === item}
                      onChange={() => {
                        setPurpose(item);
                        setAnalysis(null);
                      }}
                      className="size-4 accent-teal-700"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              onClick={runAnalysis}
              disabled={content.trim().length === 0}
              className="btn btn-primary mt-5 w-full disabled:cursor-not-allowed"
            >
              Analyze Communication
            </button>
          </section>
        </aside>
      </section>

      <ResultsPanel analysis={analysis} />

      <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <div className="section-card bg-slate-950 p-5 text-white md:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Shared Architecture
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Same pipeline, business-specific rules.
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {pipeline.map(([step, status], index) => (
              <div key={step} className="relative">
                <div className="h-full rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 text-base font-semibold">{step}</h3>
                  <span
                    className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase ${
                      status === "Demo Logic"
                        ? "border-amber-300/40 bg-amber-400/15 text-amber-100"
                        : "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="section-card p-5 md:p-6">
          <p className="kicker">Future Features</p>
          <h2 className="mt-3 text-2xl font-semibold">
            Planned integrations are not connected.
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {futureFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3"
              >
                <span className="text-sm font-semibold text-slate-700">
                  {feature}
                </span>
                <span className="badge border-amber-200 bg-amber-50 text-amber-800">
                  Planned
                </span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function FormatCard({ format }: { format: (typeof uploadFormats)[number] }) {
  const isImplemented = format.status === "Implemented";

  return (
    <div
      className={`rounded-lg border p-4 ${
        isImplemented
          ? "border-emerald-200 bg-emerald-50"
          : "border-dashed border-slate-300 bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{format.label}</p>
        <span
          className={`badge shrink-0 ${
            isImplemented
              ? "border-emerald-200 bg-white text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {format.status}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{format.detail}</p>
    </div>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-slate-700">{value}</dd>
    </div>
  );
}

function ResultsPanel({
  analysis,
}: {
  analysis: BusinessAnalysisResult | null;
}) {
  if (!analysis) {
    return (
      <section className="section-card border-dashed p-8 text-center md:p-10">
        <h2 className="text-2xl font-semibold">No business analysis yet</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Add a message, choose a purpose and click Analyze Communication. The
          first result will show local demonstration intelligence with explicit
          reasons for each recommendation.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6" aria-label="Business analysis results">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Intent" value={analysis.intent} />
        <MetricCard label="Priority" value={analysis.priority} />
        <MetricCard label="Sentiment" value={analysis.sentiment} />
        <MetricCard label="Risk" value={analysis.riskLevel} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr]">
        <section className="section-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="kicker">Results Panel</p>
              <h2 className="mt-3 text-2xl font-semibold">
                Communication Summary
              </h2>
            </div>
            <span className="badge border-amber-200 bg-amber-50 text-amber-800">
              {analysis.analysisMode}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            {analysis.summary}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ResultList title="Key Topics" items={analysis.keyTopics} />
            <ResultList
              title="Requested Actions"
              items={analysis.requestedActions}
            />
            <ResultList
              title="Important Entities"
              items={analysis.importantEntities}
            />
            <ResultList
              title="Suggested Actions"
              items={analysis.suggestedActions}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="section-card p-5 md:p-6">
            <h2 className="text-xl font-semibold">Recommended Next Step</h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {analysis.recommendedNextStep}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900">
              Confidence: {Math.round(analysis.confidence * 100)}%
            </p>
          </section>

          <section className="section-card p-5 md:p-6">
            <h2 className="text-xl font-semibold">
              Recommended Reply Outline
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {analysis.recommendedReplyOutline.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <section className="section-card border-emerald-200 bg-emerald-50 p-5 md:p-6">
        <h2 className="text-xl font-semibold text-emerald-950">
          Why this recommendation was produced
        </h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-emerald-950 md:grid-cols-2">
          {analysis.explanation.map((item) => (
            <li key={item} className="rounded-lg bg-white/70 p-3">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
