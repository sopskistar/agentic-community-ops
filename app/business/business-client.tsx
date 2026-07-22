"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";

import { businessSafetyDisclaimer } from "../../lib/business/audit";
import { calculateBusinessWorkspaceMetrics } from "../../lib/business/metrics";
import { businessProfiles as seededProfiles } from "../../lib/business/profiles";
import {
  auditCategories,
  businessAnalysisPurposes,
  businessReportTypes,
  type AuditCategory,
  type BusinessAnalysisPurpose,
  type BusinessAnalysisRecord,
  type BusinessProfile,
  type BusinessReportRecord,
  type BusinessReportType,
} from "../../lib/business/types";

type WorkspaceTab = "analyze" | "audit" | "budget" | "reports" | "knowledge" | "history";

type BusinessExtraction = {
  filename: string;
  fileTypeLabel: string;
  sizeBytes: number;
  analysisContent: string;
  preview: string;
  extractedCharacterCount: number;
  truncated: boolean;
  pageCount?: number;
  worksheetName?: string;
  availableWorksheets?: string[];
  detectedColumns?: string[];
  importedRowCount?: number;
  truncatedRowCount?: number;
  importedColumnCount?: number;
  extractionSummary: string;
  warnings: string[];
};

const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: "analyze", label: "Analyze" },
  { id: "audit", label: "Audit" },
  { id: "budget", label: "Budget" },
  { id: "reports", label: "Reports" },
  { id: "knowledge", label: "Knowledge Hub" },
  { id: "history", label: "Analysis History" },
];

const sampleMessages = [
  {
    label: "Support issue",
    purpose: "Customer Support" as const,
    content:
      "Hi Support Center, our invoice payment failed and the account is blocked. Can you help today and confirm the next step?",
  },
  {
    label: "Sales lead",
    purpose: "Sales Conversation" as const,
    content:
      "Hello SaaS Company, we are interested in pricing for 40 seats. Could you send a quote and schedule a product demo next week?",
  },
  {
    label: "Audit sample",
    purpose: "Business Audit" as const,
    content:
      "Q2 vendor approvals include missing policy references and two invoices marked TBD. Please review control evidence and confirm who approved the exception.",
  },
  {
    label: "Budget sample",
    purpose: "Budget Review" as const,
    content:
      "Department,Category,Budgeted,Actual\nMarketing,Ads,10000,12400\nOperations,Software,8000,7600\nFinance,Travel,2500,\nMarketing,Ads,10000,12400",
  },
];

export function BusinessClient() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("analyze");
  const [profiles, setProfiles] = useState<BusinessProfile[]>(seededProfiles);
  const [profileId, setProfileId] = useState("support-center");
  const [purpose, setPurpose] = useState<BusinessAnalysisPurpose>("Customer Support");
  const [auditCategory, setAuditCategory] = useState<AuditCategory>("Operational Audit");
  const [content, setContent] = useState(sampleMessages[0].content);
  const [extraction, setExtraction] = useState<BusinessExtraction | null>(null);
  const [analyses, setAnalyses] = useState<BusinessAnalysisRecord[]>([]);
  const [reports, setReports] = useState<BusinessReportRecord[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === profileId) ?? profiles[0],
    [profileId, profiles],
  );
  const selectedAnalysis =
    analyses.find((analysis) => analysis.id === selectedAnalysisId) ?? analyses[0] ?? null;
  const selectedReport =
    reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;
  const metrics = calculateBusinessWorkspaceMetrics({ analyses, reports });

  useEffect(() => {
    void refreshWorkspace();
  }, []);

  async function refreshWorkspace() {
    setErrorMessage(null);
    try {
      const [analysisResponse, reportResponse, profileResponse] = await Promise.all([
        fetch("/api/business/analyses", { cache: "no-store" }),
        fetch("/api/business/reports", { cache: "no-store" }),
        fetch("/api/business/profiles", { cache: "no-store" }),
      ]);
      if (!analysisResponse.ok || !reportResponse.ok || !profileResponse.ok) {
        throw new Error("Workspace data could not be loaded.");
      }
      const analysisPayload = (await analysisResponse.json()) as {
        analyses: BusinessAnalysisRecord[];
      };
      const reportPayload = (await reportResponse.json()) as {
        reports: BusinessReportRecord[];
      };
      const profilePayload = (await profileResponse.json()) as {
        profiles: BusinessProfile[];
      };
      setAnalyses(analysisPayload.analyses);
      setReports(reportPayload.reports);
      setProfiles(profilePayload.profiles);
    } catch {
      setErrorMessage("Storage failure: workspace records could not be loaded.");
    }
  }

  async function handleBusinessUpload(file: File | undefined) {
    setErrorMessage(null);
    setStatusMessage(null);
    setExtraction(null);
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/business/ingest", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as
        | { extraction: BusinessExtraction }
        | { error?: { message?: string } };
      if (!response.ok || !("extraction" in payload)) {
        throw new Error(
          "error" in payload
            ? payload.error?.message ?? "Unsupported file."
            : "Unsupported file.",
        );
      }
      setExtraction(payload.extraction);
      setContent(payload.extraction.analysisContent);
      setStatusMessage("File parsed. Review the extraction preview before analysis.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unsupported file: the upload could not be parsed.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function runAndSaveAnalysis(nextPurpose = purpose) {
    if (!content.trim()) {
      setErrorMessage("Add pasted text or upload a supported file before analysis.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/business/analyses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content,
          purpose: nextPurpose,
          profileId,
          inputType: extraction ? extraction.fileTypeLabel : "Pasted Text",
          auditCategory,
          extraction: extraction
            ? {
                filename: extraction.filename,
                fileTypeLabel: extraction.fileTypeLabel,
                sizeBytes: extraction.sizeBytes,
                extractedCharacterCount: extraction.extractedCharacterCount,
                pageCount: extraction.pageCount,
                worksheetName: extraction.worksheetName,
                importedRowCount: extraction.importedRowCount,
                importedColumnCount: extraction.importedColumnCount,
                truncated: extraction.truncated,
              }
            : undefined,
        }),
      });
      const payload = (await response.json()) as
        | { analysis: BusinessAnalysisRecord }
        | { error?: { message?: string } };
      if (!response.ok || !("analysis" in payload)) {
        throw new Error(
          "error" in payload
            ? payload.error?.message ?? "Analysis could not be saved."
            : "Analysis could not be saved.",
        );
      }
      setSelectedAnalysisId(payload.analysis.id);
      setAnalyses((existing) => [payload.analysis, ...existing]);
      setStatusMessage("Analysis saved. You can generate a report or review findings.");
      setActiveTab(nextPurpose === "Business Audit" ? "audit" : nextPurpose === "Budget Review" ? "budget" : "analyze");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Model unavailable or deterministic fallback failed.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function generateReport(
    reportType: BusinessReportType,
    analysis: BusinessAnalysisRecord | null | undefined = selectedAnalysis,
  ) {
    if (!analysis) {
      setErrorMessage("Save an analysis before generating a report.");
      return;
    }

    setIsGeneratingReport(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/business/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ analysisId: analysis.id, reportType }),
      });
      const payload = (await response.json()) as
        | { report: BusinessReportRecord }
        | { error?: { message?: string } };
      if (!response.ok || !("report" in payload)) {
        throw new Error(
          "error" in payload
            ? payload.error?.message ?? "Report generation failed."
            : "Report generation failed.",
        );
      }
      setReports((existing) => [payload.report, ...existing]);
      setSelectedReportId(payload.report.id);
      setStatusMessage("Report generated from the saved analysis.");
      setActiveTab("reports");
      await refreshWorkspace();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Report generation failed.",
      );
    } finally {
      setIsGeneratingReport(false);
    }
  }

  function loadSample(sample: (typeof sampleMessages)[number]) {
    setContent(sample.content);
    setPurpose(sample.purpose);
    setExtraction(null);
    setErrorMessage(null);
    setStatusMessage("Sample loaded. Review the purpose and run analysis.");
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
      setActiveTab(tabs[nextIndex].id);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <BusinessDisclaimer />

      <ExecutiveOverview
        metrics={metrics}
        analyses={analyses}
        onOpenHistory={() => setActiveTab("history")}
        onOpenReports={() => setActiveTab("reports")}
      />

      <div
        role="tablist"
        aria-label="Business workspace sections"
        onKeyDown={onTabKeyDown}
        className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`business-tab-${tab.id}`}
            id={`business-tab-button-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
              activeTab === tab.id
                ? "bg-teal-50 text-teal-800 ring-1 ring-teal-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {statusMessage ? <StatusNotice tone="success" message={statusMessage} /> : null}
      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
      {isUploading ? <StatusNotice tone="info" message="File parsing in progress..." /> : null}
      {isAnalyzing ? <StatusNotice tone="info" message="Analysis running..." /> : null}
      {isGeneratingReport ? <StatusNotice tone="info" message="Report generation in progress..." /> : null}

      <section
        id={`business-tab-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`business-tab-button-${activeTab}`}
      >
        {activeTab === "analyze" ? (
          <AnalysisWorkspace
            profiles={profiles}
            selectedProfile={selectedProfile}
            profileId={profileId}
            setProfileId={setProfileId}
            purpose={purpose}
            setPurpose={setPurpose}
            content={content}
            setContent={setContent}
            extraction={extraction}
            setExtraction={setExtraction}
            auditCategory={auditCategory}
            setAuditCategory={setAuditCategory}
            handleBusinessUpload={handleBusinessUpload}
            runAndSaveAnalysis={runAndSaveAnalysis}
            loadSample={loadSample}
          />
        ) : null}
        {activeTab === "audit" ? (
          <AuditWorkspace
            analysis={selectedAnalysis}
            analyses={analyses}
            setSelectedAnalysisId={setSelectedAnalysisId}
            onGenerateReport={() => void generateReport("Business Audit Report")}
          />
        ) : null}
        {activeTab === "budget" ? (
          <BudgetWorkspace
            analysis={selectedAnalysis}
            analyses={analyses}
            setSelectedAnalysisId={setSelectedAnalysisId}
            onGenerateReport={() => void generateReport("Budget Review Report")}
          />
        ) : null}
        {activeTab === "reports" ? (
          <ReportsWorkspace
            reports={reports}
            analyses={analyses}
            selectedReport={selectedReport}
            selectedReportId={selectedReportId}
            setSelectedReportId={setSelectedReportId}
            selectedAnalysis={selectedAnalysis}
            setSelectedAnalysisId={setSelectedAnalysisId}
            generateReport={generateReport}
          />
        ) : null}
        {activeTab === "knowledge" ? (
          <KnowledgeHub
            profiles={profiles}
            selectedProfile={selectedProfile}
            refreshWorkspace={refreshWorkspace}
          />
        ) : null}
        {activeTab === "history" ? (
          <AnalysisHistory
            analyses={analyses}
            setSelectedAnalysisId={setSelectedAnalysisId}
            openAnalysis={() => setActiveTab("analyze")}
            openFindings={() => setActiveTab("audit")}
            generateReport={generateReport}
          />
        ) : null}
      </section>
    </div>
  );
}

function BusinessDisclaimer() {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
      {businessSafetyDisclaimer} AgenticOps AI does not certify financial
      statements, submit tax filings, connect bank accounts, execute payments,
      approve budgets or replace human auditors, finance professionals or legal
      reviewers.
    </section>
  );
}

function ExecutiveOverview({
  metrics,
  analyses,
  onOpenHistory,
  onOpenReports,
}: {
  metrics: ReturnType<typeof calculateBusinessWorkspaceMetrics>;
  analyses: BusinessAnalysisRecord[];
  onOpenHistory: () => void;
  onOpenReports: () => void;
}) {
  const latestHighRisk = analyses.find(
    (analysis) =>
      analysis.result.riskLevel === "High" || analysis.status === "Needs Human Review",
  );

  return (
    <section className="section-card p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="kicker">Executive Overview</p>
          <h2 className="mt-3 text-2xl font-semibold">
            Business intelligence based on saved analyses.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Metrics are deterministic aggregates from stored AgenticOps AI
            analysis records. No demo statistics are fabricated.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onOpenHistory} className="btn btn-secondary">
            History
          </button>
          <button type="button" onClick={onOpenReports} className="btn btn-primary">
            Reports
          </button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="Total analyses" value={metrics.totalAnalyses} />
        <MetricCard label="Audits completed" value={metrics.auditsCompleted} />
        <MetricCard label="Budget reviews" value={metrics.budgetReviewsCompleted} />
        <MetricCard label="Human reviews" value={metrics.humanReviewsRequired} />
        <MetricCard label="Critical findings" value={metrics.criticalFindings} />
        <MetricCard label="High-risk open" value={metrics.openHighRiskFindings} />
        <MetricCard label="Reports generated" value={metrics.reportsGenerated} />
        <MetricCard label="Common purpose" value={metrics.mostCommonPurpose} />
      </div>
      {analyses.length === 0 ? (
        <EmptyState
          title="No saved analyses yet"
          text="Run an analysis from pasted text or a supported business file to populate the workspace dashboard."
        />
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <SummaryList title="Risk distribution" values={metrics.riskDistribution} />
          <SummaryList title="Purpose distribution" values={metrics.purposeDistribution} />
          <SummaryList title="Findings by severity" values={metrics.findingsBySeverity} />
        </div>
      )}
      {latestHighRisk ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-950">
          Current risk posture: review {latestHighRisk.purpose} finding for{" "}
          {latestHighRisk.businessProfile.name}. Recommended management action:
          verify evidence and assign an accountable role before action.
        </p>
      ) : null}
    </section>
  );
}

function AnalysisWorkspace({
  profiles,
  selectedProfile,
  profileId,
  setProfileId,
  purpose,
  setPurpose,
  content,
  setContent,
  extraction,
  setExtraction,
  auditCategory,
  setAuditCategory,
  handleBusinessUpload,
  runAndSaveAnalysis,
  loadSample,
}: {
  profiles: BusinessProfile[];
  selectedProfile: BusinessProfile;
  profileId: string;
  setProfileId: (value: string) => void;
  purpose: BusinessAnalysisPurpose;
  setPurpose: (value: BusinessAnalysisPurpose) => void;
  content: string;
  setContent: (value: string) => void;
  extraction: BusinessExtraction | null;
  setExtraction: (value: BusinessExtraction | null) => void;
  auditCategory: AuditCategory;
  setAuditCategory: (value: AuditCategory) => void;
  handleBusinessUpload: (file: File | undefined) => Promise<void>;
  runAndSaveAnalysis: (purpose?: BusinessAnalysisPurpose) => Promise<void>;
  loadSample: (sample: (typeof sampleMessages)[number]) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
      <section className="section-card p-5 md:p-6">
        <p className="kicker">Analyze Workspace</p>
        <h2 className="mt-3 text-2xl font-semibold">
          Step-by-step communication and file analysis.
        </h2>
        <ol className="mt-5 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-2">
          {[
            "Select business profile",
            "Select analysis purpose",
            "Add text or upload a file",
            "Review extracted content and metadata",
            "Analyze",
            "Review findings and recommendations",
            "Save analysis or generate report",
          ].map((step, index) => (
            <li key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <span className="font-bold text-teal-800">Step {index + 1}</span>{" "}
              {step}
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-5">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Business profile
            </span>
            <select
              value={profileId}
              onChange={(event) => setProfileId(event.target.value)}
              className="field"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-800">
              Analysis purpose
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {businessAnalysisPurposes.map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 hover:border-teal-200 hover:bg-teal-50"
                >
                  <input
                    type="radio"
                    name="purpose"
                    value={item}
                    checked={purpose === item}
                    onChange={() => setPurpose(item)}
                    className="size-4 accent-teal-700"
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>

          {purpose === "Business Audit" ? (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">
                Audit category
              </span>
              <select
                value={auditCategory}
                onChange={(event) => setAuditCategory(event.target.value as AuditCategory)}
                className="field"
              >
                {auditCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Paste communication, table or review notes
            </span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              maxLength={12000}
              className="field leading-6"
              placeholder="Paste a business email, support note, budget table, process description or audit evidence summary."
            />
            <span className="block text-xs text-slate-500">
              {content.length}/12000 characters. Use “Insufficient information”
              when source data does not contain a required fact.
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-[1fr_240px]">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Sample inputs
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sampleMessages.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => loadSample(sample)}
                    className="btn btn-secondary min-h-9 px-3 py-2 text-xs"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">
                Upload file
              </span>
              <input
                type="file"
                accept=".txt,text/plain,.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => void handleBusinessUpload(event.target.files?.[0])}
                className="field text-sm"
              />
            </label>
          </div>

          {extraction ? (
            <ExtractionPreview extraction={extraction} onRemove={() => setExtraction(null)} />
          ) : null}

          <button
            type="button"
            onClick={() => void runAndSaveAnalysis()}
            disabled={!content.trim()}
            className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            Analyze And Save
          </button>
        </div>
      </section>

      <aside className="space-y-6">
        <ProfileCard profile={selectedProfile} />
        <FormatPanel />
        <FutureFinancialPanel />
      </aside>
    </div>
  );
}

function ExtractionPreview({
  extraction,
  onRemove,
}: {
  extraction: BusinessExtraction;
  onRemove: () => void;
}) {
  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-950">
            Extraction preview
          </p>
          <p className="mt-1 text-xs leading-5 text-emerald-900">
            {extraction.extractionSummary}
          </p>
        </div>
        <button type="button" onClick={onRemove} className="btn btn-secondary min-h-9 px-3 py-2 text-xs">
          Remove file
        </button>
      </div>
      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
        <PreviewDetail label="Filename" value={extraction.filename} />
        <PreviewDetail label="File type" value={extraction.fileTypeLabel} />
        <PreviewDetail label="File size" value={`${extraction.sizeBytes} bytes`} />
        {extraction.pageCount !== undefined ? (
          <PreviewDetail label="Page count" value={String(extraction.pageCount)} />
        ) : null}
        {extraction.worksheetName ? (
          <PreviewDetail label="Worksheet" value={extraction.worksheetName} />
        ) : null}
        {extraction.importedRowCount !== undefined ? (
          <PreviewDetail label="Rows imported" value={String(extraction.importedRowCount)} />
        ) : null}
        <PreviewDetail
          label="Extracted characters"
          value={String(extraction.extractedCharacterCount)}
        />
        <PreviewDetail label="Truncated" value={extraction.truncated ? "Yes" : "No"} />
      </dl>
      {extraction.detectedColumns?.length ? (
        <p className="mt-3 text-xs leading-5 text-emerald-900">
          Columns: {extraction.detectedColumns.join(", ")}
        </p>
      ) : null}
      <p className="mt-4 max-h-48 overflow-auto rounded-lg bg-white/80 p-3 text-xs leading-5 text-slate-700">
        {extraction.preview}
      </p>
    </section>
  );
}

function AuditWorkspace({
  analysis,
  analyses,
  setSelectedAnalysisId,
  onGenerateReport,
}: {
  analysis: BusinessAnalysisRecord | null;
  analyses: BusinessAnalysisRecord[];
  setSelectedAnalysisId: (id: string) => void;
  onGenerateReport: () => void;
}) {
  const auditAnalyses = analyses.filter(
    (item) => item.purpose === "Business Audit" || item.findings.length > 0,
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="Business Audit Workspace"
        title="AI-assisted preliminary audit review"
        text="Review policies, operational documents, communications, records and datasets. This is not certified audit assurance."
      />
      <RecordSelector
        label="Saved audit analysis"
        records={auditAnalyses}
        selectedId={analysis?.id ?? ""}
        setSelectedId={setSelectedAnalysisId}
      />
      {!analysis ? (
        <EmptyState
          title="No audit findings yet"
          text="Run a Business Audit analysis from the Analyze tab to create findings."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Findings" value={analysis.findings.length} />
            <MetricCard
              label="Human review"
              value={analysis.findings.filter((finding) => finding.requiresHumanReview).length}
            />
            <MetricCard label="Rating" value={analysis.result.preliminaryAuditScore ?? "Requires review"} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {analysis.findings.map((finding) => (
              <article key={finding.id} className="interactive-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {finding.title}
                  </h3>
                  <span className="badge border-amber-200 bg-amber-50 text-amber-800">
                    {finding.severity}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {finding.description}
                </p>
                <dl className="mt-4 grid gap-3 text-sm">
                  <Detail label="Category" value={finding.category} />
                  <Detail label="Evidence" value={finding.evidenceSummary} />
                  <Detail label="Severity reason" value={finding.severityExplanation} />
                  <Detail label="Recommendation" value={finding.recommendation} />
                  <Detail label="Responsible role" value={finding.responsibleRole} />
                  <Detail label="Status" value={`${finding.status} (read-only in this release)`} />
                </dl>
              </article>
            ))}
          </div>
          <button type="button" onClick={onGenerateReport} className="btn btn-primary">
            Generate Business Audit Report
          </button>
        </>
      )}
      <FutureAuditRoadmap />
    </div>
  );
}

function BudgetWorkspace({
  analysis,
  analyses,
  setSelectedAnalysisId,
  onGenerateReport,
}: {
  analysis: BusinessAnalysisRecord | null;
  analyses: BusinessAnalysisRecord[];
  setSelectedAnalysisId: (id: string) => void;
  onGenerateReport: () => void;
}) {
  const budgetAnalyses = analyses.filter((item) => item.purpose === "Budget Review");
  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="Budget Intelligence Workspace"
        title="Preliminary budget and variance review"
        text="Review CSV, XLSX, pasted tables, PDF budget reports and DOCX narratives. Calculations are deterministic where source columns are present; missing values are not invented."
      />
      <RecordSelector
        label="Saved budget analysis"
        records={budgetAnalyses}
        selectedId={analysis?.id ?? ""}
        setSelectedId={setSelectedAnalysisId}
      />
      {!analysis ? (
        <EmptyState
          title="No budget reviews yet"
          text="Run a Budget Review analysis from structured text, CSV, XLSX, PDF or DOCX content."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Risk" value={analysis.result.riskLevel} />
            <MetricCard label="Priority" value={analysis.result.priority} />
            <MetricCard label="Human review" value={analysis.result.requiresHumanReview ? "Required" : "Available"} />
          </div>
          {analysis.budgetIntelligence ? (
            <div className="section-card p-5">
              <h3 className="text-lg font-semibold text-slate-950">
                Deterministic Budget Calculations
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Calculated from supplied table columns only. Missing budget or actual
                values are not inferred.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <MetricCard
                  label="Budgeted"
                  value={formatMoney(analysis.budgetIntelligence.totalBudgeted, analysis.budgetIntelligence.currency)}
                />
                <MetricCard
                  label="Actual"
                  value={formatMoney(analysis.budgetIntelligence.totalActual, analysis.budgetIntelligence.currency)}
                />
                <MetricCard
                  label="Variance"
                  value={formatMoney(analysis.budgetIntelligence.totalVariance, analysis.budgetIntelligence.currency)}
                />
                <MetricCard
                  label="Variance %"
                  value={
                    analysis.budgetIntelligence.totalVariancePercentage === null
                      ? "Insufficient information"
                      : `${analysis.budgetIntelligence.totalVariancePercentage}%`
                  }
                />
              </div>
              {analysis.budgetIntelligence.largestDeviations.length > 0 ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <tr>
                        <th className="py-2 pr-4">Category</th>
                        <th className="py-2 pr-4">Department</th>
                        <th className="py-2 pr-4">Budgeted</th>
                        <th className="py-2 pr-4">Actual</th>
                        <th className="py-2 pr-4">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {analysis.budgetIntelligence.largestDeviations.map((variance) => (
                        <tr key={`${variance.department}-${variance.category}`}>
                          <td className="py-3 pr-4 font-medium text-slate-900">{variance.category}</td>
                          <td className="py-3 pr-4 text-slate-600">{variance.department}</td>
                          <td className="py-3 pr-4 text-slate-600">
                            {formatMoney(variance.budgetedAmount, variance.currency)}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {formatMoney(variance.actualAmount, variance.currency)}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {formatMoney(variance.variance, variance.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <ResultList
                title="Data-Quality Warnings"
                items={
                  analysis.budgetIntelligence.dataQualityWarnings.length > 0
                    ? analysis.budgetIntelligence.dataQualityWarnings
                    : ["No deterministic budget data-quality warnings were produced."]
                }
              />
            </div>
          ) : null}
          <div className="grid gap-5 lg:grid-cols-2">
            <ResultList title="Revenue / Expense Observations" items={analysis.result.revenueExpenseObservations ?? ["Insufficient information"]} />
            <ResultList title="Budget Versus Actual" items={analysis.result.budgetVarianceIndicators ?? ["Insufficient financial columns: variance cannot be calculated."]} />
            <ResultList title="Unusual Entries" items={analysis.result.exceptionsOrAnomalies ?? ["No obvious anomaly terms were detected."]} />
            <ResultList title="Questions For Finance Staff" items={analysis.result.recommendedFollowUpChecks ?? ["Requires human confirmation."]} />
          </div>
          <button type="button" onClick={onGenerateReport} className="btn btn-primary">
            Generate Budget Review Report
          </button>
        </>
      )}
    </div>
  );
}

function formatMoney(value: number | null, currency: string | null) {
  if (value === null) {
    return "Insufficient information";
  }
  if (!currency) {
    return value.toLocaleString();
  }
  return `${currency} ${value.toLocaleString()}`;
}

function ReportsWorkspace({
  reports,
  analyses,
  selectedReport,
  selectedReportId,
  setSelectedReportId,
  selectedAnalysis,
  setSelectedAnalysisId,
  generateReport,
}: {
  reports: BusinessReportRecord[];
  analyses: BusinessAnalysisRecord[];
  selectedReport: BusinessReportRecord | null;
  selectedReportId: string | null;
  setSelectedReportId: (id: string) => void;
  selectedAnalysis: BusinessAnalysisRecord | null;
  setSelectedAnalysisId: (id: string) => void;
  generateReport: (type: BusinessReportType, analysis?: BusinessAnalysisRecord | null) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="Executive Reports"
        title="Generate reports from saved analyses"
        text="Reports use actual stored analysis results only. Use browser Print or Save as PDF for PDF output; JSON and CSV exports are real downloads."
      />
      <div className="section-card p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <RecordSelector
            label="Source analysis"
            records={analyses}
            selectedId={selectedAnalysis?.id ?? ""}
            setSelectedId={setSelectedAnalysisId}
          />
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Report type
            </span>
            <select
              className="field"
              onChange={(event) =>
                void generateReport(event.target.value as BusinessReportType, selectedAnalysis)
              }
              defaultValue=""
            >
              <option value="" disabled>
                Select report to generate
              </option>
              {businessReportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {reports.length === 0 ? (
        <EmptyState
          title="No reports generated"
          text="Save an analysis, then generate a communication, audit, budget, risk, department, year-end or findings report."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.35fr_1fr]">
          <aside className="section-card p-4">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">
                Saved reports
              </span>
              <select
                className="field"
                value={selectedReportId ?? reports[0]?.id ?? ""}
                onChange={(event) => setSelectedReportId(event.target.value)}
              >
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.reportType} - {new Date(report.generatedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </label>
          </aside>
          {selectedReport ? <ReportPreview report={selectedReport} /> : null}
        </div>
      )}
    </div>
  );
}

function ReportPreview({ report }: { report: BusinessReportRecord }) {
  return (
    <article className="section-card p-5 print:border-0 print:shadow-none md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between print:hidden">
        <div>
          <p className="kicker">AgenticOps AI Report</p>
          <h2 className="mt-3 text-2xl font-semibold">{report.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className="btn btn-secondary">
            Print / Save as PDF
          </button>
          <a href={`/api/business/reports/${report.id}/export?format=json`} className="btn btn-secondary">
            JSON Export
          </a>
          <a href={`/api/business/reports/${report.id}/export?format=csv`} className="btn btn-secondary">
            CSV Findings
          </a>
        </div>
      </div>
      <div className="mt-6 space-y-5 text-sm leading-6 text-slate-700">
        <Detail label="Date generated" value={new Date(report.generatedAt).toLocaleString()} />
        <Detail label="Scope" value={report.reportData.scope} />
        <Detail label="Executive summary" value={report.reportData.executiveSummary} />
        <ResultList title="Risks" items={report.reportData.risks} />
        <ResultList title="Recommendations" items={report.reportData.recommendations} />
        <ResultList title="Required Actions" items={report.reportData.requiredActions} />
        <ResultList title="Human Review Notes" items={report.reportData.humanReviewNotes} />
        <ResultList title="Limitations" items={report.reportData.limitations} />
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-950">
          {report.reportData.disclaimer}
        </p>
      </div>
    </article>
  );
}

function KnowledgeHub({
  profiles,
  selectedProfile,
  refreshWorkspace,
}: {
  profiles: BusinessProfile[];
  selectedProfile: BusinessProfile;
  refreshWorkspace: () => Promise<void>;
}) {
  const [profileName, setProfileName] = useState("");
  const [knowledgeText, setKnowledgeText] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  async function saveProfile() {
    if (!profileName.trim()) {
      setSaveStatus("Profile name is required.");
      return;
    }

    const response = await fetch("/api/business/profiles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: profileName,
        industry: "User configured",
        context: knowledgeText.slice(0, 1_000) || "User configured profile.",
        responseStyle: "Professional",
        knowledgeText: knowledgeText.slice(0, 8_000),
      }),
    });
    setSaveStatus(
      response.ok
        ? "Profile saved. Storage behavior follows the configured business repository."
        : "Profile could not be saved.",
    );
    if (response.ok) {
      setProfileName("");
      setKnowledgeText("");
      await refreshWorkspace();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.78fr_1fr]">
      <section className="section-card p-5 md:p-6">
        <p className="kicker">Knowledge Hub</p>
        <h2 className="mt-3 text-2xl font-semibold">
          Business profiles shape analysis context.
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Profiles change context only. They do not silently alter deterministic
          calculations or approve external actions.
        </p>
        <div className="mt-5 grid gap-4">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </section>
      <section className="section-card p-5 md:p-6">
        <h2 className="text-2xl font-semibold">Add bounded profile knowledge</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add pasted text or bounded knowledge extracted from TXT, PDF or DOCX.
          This is structured profile storage, not vector search or semantic retrieval.
        </p>
        <div className="mt-5 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Business name</span>
            <input className="field" value={profileName} onChange={(event) => setProfileName(event.target.value)} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Knowledge text</span>
            <textarea
              className="field"
              rows={8}
              maxLength={8000}
              value={knowledgeText}
              onChange={(event) => setKnowledgeText(event.target.value)}
            />
            <span className="text-xs text-slate-500">
              {knowledgeText.length}/8000 characters
            </span>
          </label>
          <button type="button" onClick={() => void saveProfile()} className="btn btn-primary">
            Save Profile
          </button>
          {saveStatus ? <StatusNotice tone="info" message={saveStatus} /> : null}
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Selected profile</h3>
          <ProfileCard profile={selectedProfile} />
        </div>
      </section>
    </div>
  );
}

function AnalysisHistory({
  analyses,
  setSelectedAnalysisId,
  openAnalysis,
  openFindings,
  generateReport,
}: {
  analyses: BusinessAnalysisRecord[];
  setSelectedAnalysisId: (id: string) => void;
  openAnalysis: () => void;
  openFindings: () => void;
  generateReport: (type: BusinessReportType, analysis?: BusinessAnalysisRecord | null) => Promise<void>;
}) {
  if (analyses.length === 0) {
    return (
      <EmptyState
        title="No analysis history"
        text="Saved analyses will appear here in newest-first order. Deleting records is not exposed until safe deletion semantics are implemented."
      />
    );
  }

  return (
    <section className="section-card p-5 md:p-6">
      <p className="kicker">Analysis History</p>
      <h2 className="mt-3 text-2xl font-semibold">Saved business analyses</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Purpose</th>
              <th className="px-3 py-2">Input</th>
              <th className="px-3 py-2">Profile</th>
              <th className="px-3 py-2">Risk</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Report</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis) => (
              <tr key={analysis.id} className="border-t border-slate-200">
                <td className="px-3 py-3">{new Date(analysis.createdAt).toLocaleString()}</td>
                <td className="px-3 py-3">{analysis.purpose}</td>
                <td className="px-3 py-3">{analysis.inputType}</td>
                <td className="px-3 py-3">{analysis.businessProfile.name}</td>
                <td className="px-3 py-3">{analysis.result.riskLevel}</td>
                <td className="px-3 py-3">{analysis.status}</td>
                <td className="px-3 py-3">{analysis.reportIds.length ? "Available" : "Not generated"}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAnalysisId(analysis.id);
                        openAnalysis();
                      }}
                      className="btn btn-secondary min-h-9 px-3 py-2 text-xs"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAnalysisId(analysis.id);
                        openFindings();
                      }}
                      className="btn btn-secondary min-h-9 px-3 py-2 text-xs"
                    >
                      Findings
                    </button>
                    <button
                      type="button"
                      onClick={() => void generateReport("Executive Summary", analysis)}
                      className="btn btn-primary min-h-9 px-3 py-2 text-xs"
                    >
                      Report
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Delete is not shown in this release. Removing an AgenticOps analysis
        record must never delete source Gmail, Discord, Telegram, Meta or other
        provider content.
      </p>
    </section>
  );
}

function ProfileCard({ profile }: { profile: BusinessProfile }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-lg font-semibold text-slate-950">{profile.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{profile.context}</p>
      <dl className="mt-4 grid gap-3 text-sm">
        <Detail label="Industry" value={profile.industry} />
        <Detail label="Business type" value={profile.businessType ?? "Optional"} />
        <Detail label="Response style" value={profile.responseStyle} />
        <Detail label="Risk tolerance" value={profile.riskTolerance ?? "Not configured"} />
        <Detail label="Reporting currency" value={profile.reportingCurrency || "Not configured"} />
      </dl>
      {profile.departments?.length ? (
        <p className="mt-3 text-xs font-semibold text-slate-500">
          Departments: {profile.departments.join(", ")}
        </p>
      ) : null}
    </article>
  );
}

function FormatPanel() {
  return (
    <section className="section-card p-5 md:p-6">
      <p className="kicker">Supported Inputs</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {["Paste Text", "TXT", "PDF", "DOCX", "CSV", "XLSX"].map((item) => (
          <span key={item} className="badge border-emerald-200 bg-emerald-50 text-emerald-800">
            {item} Implemented
          </span>
        ))}
        {["DOC", "XLS", "XLSM", "OCR"].map((item) => (
          <span key={item} className="badge border-amber-200 bg-amber-50 text-amber-800">
            {item} Unsupported
          </span>
        ))}
      </div>
    </section>
  );
}

function FutureFinancialPanel() {
  return (
    <section className="section-card p-5 md:p-6">
      <p className="kicker">Future Financial Intelligence</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "QuickBooks",
          "Xero",
          "Stripe revenue analysis",
          "Bank-feed review",
          "Cash-flow forecasting",
          "Invoice intelligence",
          "Expense classification",
          "Financial KPI monitoring",
          "Tax-document preparation assistance",
        ].map((item) => (
          <span key={item} className="badge border-amber-200 bg-amber-50 text-amber-800">
            Planned: {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function FutureAuditRoadmap() {
  return (
    <section className="section-card p-5 md:p-6">
      <p className="kicker">Future AI Audit Roadmap</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "Scheduled audits",
          "Continuous control monitoring",
          "Multi-period comparison",
          "Evidence request workflows",
          "Auditor collaboration",
          "Compliance framework mapping",
          "Audit sampling",
          "Policy-control mapping",
          "Corrective-action tracking",
          "External audit platform export",
          "Automated evidence collection with approval",
        ].map((item) => (
          <span key={item} className="badge border-slate-200 bg-slate-50 text-slate-700">
            Future: {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function RecordSelector({
  label,
  records,
  selectedId,
  setSelectedId,
}: {
  label: string;
  records: BusinessAnalysisRecord[];
  selectedId: string;
  setSelectedId: (id: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <select
        className="field"
        value={selectedId}
        onChange={(event) => setSelectedId(event.target.value)}
      >
        {records.length === 0 ? (
          <option value="">No saved analyses</option>
        ) : null}
        {records.map((record) => (
          <option key={record.id} value={record.id}>
            {record.purpose} - {record.businessProfile.name} -{" "}
            {new Date(record.createdAt).toLocaleDateString()}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionHeader({
  kicker,
  title,
  text,
}: {
  kicker: string;
  title: string;
  text: string;
}) {
  return (
    <section className="section-card p-5 md:p-6">
      <p className="kicker">{kicker}</p>
      <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{text}</p>
    </section>
  );
}

function StatusNotice({
  tone,
  message,
}: {
  tone: "success" | "error" | "info";
  message: string;
}) {
  const toneClass = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    info: "border-sky-200 bg-sky-50 text-sky-900",
  }[tone];
  return (
    <p className={`rounded-lg border px-4 py-3 text-sm font-semibold ${toneClass}`}>
      {message}
    </p>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="metric-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function SummaryList({ title, values }: { title: string; values: Record<string, number> }) {
  const entries = Object.entries(values);
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No data yet.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {entries.map(([label, value]) => (
            <li key={label} className="flex justify-between gap-3">
              <span>{label}</span>
              <strong>{value}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
        {items.length > 0 ? items.map((item) => <li key={item}>{item}</li>) : <li>Insufficient information</li>}
      </ul>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-slate-700">{value}</dd>
    </div>
  );
}

function PreviewDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/80 p-3">
      <dt className="font-bold uppercase tracking-[0.12em] text-emerald-800">
        {label}
      </dt>
      <dd className="mt-1 break-words font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <section className="section-card border-dashed p-8 text-center md:p-10">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        {text}
      </p>
    </section>
  );
}
