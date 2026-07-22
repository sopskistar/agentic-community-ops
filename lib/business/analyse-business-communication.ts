import type {
  BusinessAnalysisInput,
  BusinessAnalysisResult,
  BusinessProfile,
  BusinessPriority,
  BusinessRiskLevel,
  BusinessSentiment,
} from "./types";

const topicKeywords = [
  ["Billing", ["invoice", "billing", "payment", "refund", "charge", "paid"]],
  ["Pricing", ["price", "pricing", "quote", "budget", "cost"]],
  ["Product", ["feature", "product", "platform", "integration", "demo"]],
  ["Support", ["help", "issue", "broken", "bug", "problem", "support"]],
  ["Timeline", ["today", "tomorrow", "deadline", "asap", "urgent", "schedule"]],
  ["Contract", ["contract", "terms", "legal", "security review", "agreement"]],
  ["Partnership", ["partner", "partnership", "collaboration", "vendor"]],
] as const;

export function analyseBusinessCommunication(
  input: BusinessAnalysisInput,
): BusinessAnalysisResult {
  const content = input.content.trim();
  const lowerContent = content.toLowerCase();
  const sentences = splitSentences(content);
  const keyTopics = detectTopics(lowerContent);
  const intent = detectIntent(lowerContent, input.purpose);
  const priority = detectPriority(lowerContent);
  const sentiment = detectSentiment(lowerContent);
  const riskLevel = detectRisk(lowerContent);
  const requestedActions = detectRequestedActions(sentences);
  const importantEntities = detectEntities(content);
  const deadlinesOrDates = detectDeadlinesOrDates(content);
  const peopleOrDepartments = detectPeopleOrDepartments(content, input.profile);
  const missingContext = detectMissingContext(lowerContent, input.purpose);
  const requiresHumanReview =
    priority === "Critical" ||
    riskLevel === "High" ||
    input.purpose === "Business Audit" ||
    input.purpose === "Budget Review" ||
    confidenceNeedsHumanReview({
      content,
      keyTopics,
      requestedActions,
      importantEntities,
    });
  const suggestedActions = createSuggestedActions({
    intent,
    priority,
    riskLevel,
    requestedActions,
  });
  const recommendedNextStep = createRecommendedNextStep({
    intent,
    priority,
    riskLevel,
    requestedActions,
  });
  const businessReview = createBusinessReviewSections(content, lowerContent, input.purpose);

  return {
    summary: createSummary(sentences, input.purpose),
    executiveSummary: createExecutiveSummary(sentences, input.purpose),
    communicationType: input.purpose,
    intent,
    priority,
    sentiment,
    riskLevel,
    requestedActions,
    importantEntities,
    deadlinesOrDates,
    peopleOrDepartments,
    recommendedNextStep,
    escalationRecommendation: createEscalationRecommendation({
      priority,
      riskLevel,
      requiresHumanReview,
    }),
    confidence: calculateConfidence({
      content,
      keyTopics,
      requestedActions,
      importantEntities,
    }),
    keyTopics,
    suggestedActions,
    recommendedReplyOutline: createReplyOutline({
      intent,
      priority,
      riskLevel,
      purpose: input.purpose,
    }),
    missingContext,
    requiresHumanReview,
    explanation: createExplanation({
      input,
      keyTopics,
      priority,
      sentiment,
      riskLevel,
      requestedActions,
    }),
    profileMetadata: {
      profileName: input.profile.name,
      industry: input.profile.industry,
      responseStyle: input.profile.responseStyle,
    },
    analysisMode: "Local demonstration logic",
    ...businessReview,
  };
}

function splitSentences(content: string) {
  return content
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function detectTopics(lowerContent: string) {
  const topics = topicKeywords
    .filter(([, keywords]) =>
      keywords.some((keyword) => lowerContent.includes(keyword)),
    )
    .map(([topic]) => topic);

  return topics.length > 0 ? topics : ["General communication"];
}

function detectIntent(
  lowerContent: string,
  purpose: BusinessAnalysisInput["purpose"],
) {
  if (purpose === "Business Audit") {
    return "Preliminary business audit review";
  }

  if (purpose === "Budget Review") {
    return "Budget and variance review";
  }

  if (containsAny(lowerContent, ["complaint", "unhappy", "frustrated", "angry"])) {
    return "Complaint";
  }

  if (containsAny(lowerContent, ["broken", "bug", "issue", "help", "support"])) {
    return "Support request";
  }

  if (containsAny(lowerContent, ["price", "pricing", "quote", "demo", "buy"])) {
    return "Purchase or sales intent";
  }

  if (containsAny(lowerContent, ["invoice", "contract", "partnership", "follow up"])) {
    return "Business email follow-up";
  }

  if (purpose === "Internal Team") {
    return "Internal coordination";
  }

  return `${purpose} review`;
}

function detectPriority(lowerContent: string): BusinessPriority {
  if (containsAny(lowerContent, ["breach", "legal", "lawsuit", "security incident"])) {
    return "Critical";
  }

  if (containsAny(lowerContent, ["urgent", "asap", "today", "blocked", "broken"])) {
    return "High";
  }

  if (containsAny(lowerContent, ["please", "can you", "could you", "follow up", "question"])) {
    return "Medium";
  }

  return "Low";
}

function detectSentiment(lowerContent: string): BusinessSentiment {
  const negative = containsAny(lowerContent, [
    "angry",
    "unhappy",
    "frustrated",
    "disappointed",
    "broken",
    "cancel",
  ]);
  const positive = containsAny(lowerContent, [
    "thanks",
    "great",
    "appreciate",
    "excited",
    "interested",
  ]);

  if (negative && positive) {
    return "Mixed";
  }

  if (negative) {
    return "Negative";
  }

  if (positive) {
    return "Positive";
  }

  return "Neutral";
}

function detectRisk(lowerContent: string): BusinessRiskLevel {
  if (containsAny(lowerContent, ["password", "secret", "legal", "lawsuit", "security incident"])) {
    return "High";
  }

  if (containsAny(lowerContent, ["invoice", "payment", "contract", "refund", "cancel"])) {
    return "Medium";
  }

  if (containsAny(lowerContent, ["urgent", "blocked", "complaint"])) {
    return "Low";
  }

  return "Safe";
}

function detectRequestedActions(sentences: string[]) {
  const actionSentences = sentences.filter((sentence) =>
    containsAny(sentence.toLowerCase(), [
      "please",
      "can you",
      "could you",
      "need",
      "send",
      "schedule",
      "follow up",
      "confirm",
      "reply",
    ]),
  );

  return actionSentences.length > 0
    ? actionSentences.slice(0, 4)
    : ["No explicit requested action detected."];
}

function detectEntities(content: string) {
  const emails = content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  const money = content.match(/[$£€]\s?\d[\d,.]*/g) ?? [];
  const capitalizedTerms =
    content.match(/\b(?:[A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+){0,2})\b/g) ?? [];
  const deduped = [...new Set([...emails, ...money, ...capitalizedTerms])];

  return deduped.slice(0, 8).length > 0
    ? deduped.slice(0, 8)
    : ["No important entities detected."];
}

function detectDeadlinesOrDates(content: string) {
  const dates =
    content.match(
      /\b(?:today|tomorrow|next week|next month|monday|tuesday|wednesday|thursday|friday|saturday|sunday|q[1-4]|fy\d{2,4}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2})\b/gi,
    ) ?? [];
  const uniqueDates = [...new Set(dates.map((date) => date.trim()))];
  return uniqueDates.length > 0
    ? uniqueDates.slice(0, 8)
    : ["Insufficient information: no explicit date or deadline detected."];
}

function detectPeopleOrDepartments(
  content: string,
  profile: BusinessProfile,
) {
  const departmentMatches = [
    "Executive",
    "Finance",
    "Operations",
    "Customer Support",
    "Support",
    "Sales",
    "Marketing",
    "HR",
    "Engineering",
    "Security",
    "Compliance",
  ].filter((department) =>
    content.toLowerCase().includes(department.toLowerCase()),
  );
  const configuredDepartments = profile.departments ?? [];
  const combined = [...new Set([...departmentMatches, ...configuredDepartments])];

  return combined.length > 0
    ? combined.slice(0, 8)
    : ["Requires human confirmation: no person or department was explicit."];
}

function detectMissingContext(
  lowerContent: string,
  purpose: BusinessAnalysisInput["purpose"],
) {
  const missing: string[] = [];

  if (purpose === "Budget Review") {
    if (!containsAny(lowerContent, ["budget", "forecast", "planned"])) {
      missing.push("Insufficient information: budget or planned amount column was not explicit.");
    }
    if (!containsAny(lowerContent, ["actual", "spent", "expense", "revenue"])) {
      missing.push("Insufficient information: actual amount or realized value was not explicit.");
    }
  }

  if (purpose === "Business Audit" && !containsAny(lowerContent, ["evidence", "approval", "policy", "control"])) {
    missing.push("Requires human confirmation: audit evidence, controls or policy criteria were not explicit.");
  }

  if (!containsAny(lowerContent, ["owner", "team", "department", "manager", "lead"])) {
    missing.push("Requires human confirmation: accountable owner was not explicit.");
  }

  return missing.length > 0 ? missing : ["No major missing context detected by local rules."];
}

function createSummary(sentences: string[], purpose: BusinessAnalysisInput["purpose"]) {
  if (sentences.length === 0) {
    return "No communication content was available for analysis.";
  }

  const firstSentence = sentences[0].replace(/\s+/g, " ");
  return `${purpose} message about ${firstSentence.slice(0, 140)}${
    firstSentence.length > 140 ? "..." : ""
  }`;
}

function createExecutiveSummary(
  sentences: string[],
  purpose: BusinessAnalysisInput["purpose"],
) {
  if (sentences.length === 0) {
    return "Insufficient information: no source content was available.";
  }

  return `${purpose} review identified ${sentences.length} supplied statement${
    sentences.length === 1 ? "" : "s"
  }. Findings are limited to the supplied content and require human confirmation before decisions.`;
}

function createSuggestedActions({
  intent,
  priority,
  riskLevel,
  requestedActions,
}: {
  intent: string;
  priority: BusinessPriority;
  riskLevel: BusinessRiskLevel;
  requestedActions: string[];
}) {
  const actions = [
    `Handle as: ${intent}.`,
    `Respond with ${priority.toLowerCase()} priority.`,
  ];

  if (riskLevel === "High" || riskLevel === "Medium") {
    actions.push("Review sensitive business, legal, payment or account details before replying.");
  }

  if (!requestedActions.includes("No explicit requested action detected.")) {
    actions.push("Address the explicit request before adding optional context.");
  }

  return actions;
}

function createRecommendedNextStep({
  intent,
  priority,
  riskLevel,
  requestedActions,
}: {
  intent: string;
  priority: BusinessPriority;
  riskLevel: BusinessRiskLevel;
  requestedActions: string[];
}) {
  if (riskLevel === "High") {
    return "Escalate to an owner before responding because sensitive or high-risk language was detected.";
  }

  if (priority === "Critical" || priority === "High") {
    return "Route for same-day review and answer the highest-priority request first.";
  }

  if (intent === "Purchase or sales intent") {
    return "Reply with a concise qualification question and offer the next commercial step.";
  }

  if (!requestedActions.includes("No explicit requested action detected.")) {
    return "Reply directly to the requested action and confirm the next owner or deadline.";
  }

  return "Summarize the message, acknowledge receipt and ask one clarifying question if needed.";
}

function createEscalationRecommendation({
  priority,
  riskLevel,
  requiresHumanReview,
}: {
  priority: BusinessPriority;
  riskLevel: BusinessRiskLevel;
  requiresHumanReview: boolean;
}) {
  if (!requiresHumanReview) {
    return "No immediate escalation required by local rules; keep normal human review available.";
  }

  if (riskLevel === "High" || priority === "Critical") {
    return "Route to a qualified human owner before acting because high risk or critical priority was detected.";
  }

  return "Route for human review before external action or management decision.";
}

function createReplyOutline({
  intent,
  priority,
  riskLevel,
  purpose,
}: {
  intent: string;
  priority: BusinessPriority;
  riskLevel: BusinessRiskLevel;
  purpose: BusinessAnalysisInput["purpose"];
}) {
  if (purpose === "Business Audit") {
    return [
      "State that this is a preliminary AI-assisted business review, not a certified audit.",
      "Summarize the reviewed scope and key findings.",
      "List missing evidence or data-quality concerns for human review.",
      "Recommend follow-up checks with an accountable owner.",
    ];
  }

  if (purpose === "Budget Review") {
    return [
      "State that this is decision-support analysis, not financial advice.",
      "Summarize revenue and expense observations from the provided data.",
      "Do not calculate totals or variances when the source data is incomplete.",
      "Flag unusual entries, missing categories or possible variances.",
      "Recommend human review before budget decisions.",
    ];
  }

  return [
    "Open with a professional acknowledgement.",
    `Address the detected intent: ${intent}.`,
    `State the next step and expected timing for a ${priority.toLowerCase()} priority case.`,
    riskLevel === "High" || riskLevel === "Medium"
      ? "Avoid making commitments on sensitive details until an owner reviews the message."
      : "Close with a clear offer to help or confirm follow-up.",
  ];
}

function createBusinessReviewSections(
  content: string,
  lowerContent: string,
  purpose: BusinessAnalysisInput["purpose"],
) {
  if (purpose === "Business Audit") {
    const hasPolicy = containsAny(lowerContent, ["policy", "approval", "control", "process"]);
    const hasMissing = containsAny(lowerContent, ["missing", "unknown", "n/a", "tbd", "blank"]);
    const hasMoney = /[$£€]\s?\d|\b\d+(?:\.\d+)?%\b/.test(content);
    const concerns = [
      hasMissing ? "Missing or incomplete values were mentioned." : "No explicit missing values were detected in the supplied text.",
      hasPolicy ? "Policy, approval or process terms appear in the source material." : "No explicit policy or approval references were detected.",
    ];

    return {
      dataOverview: [
        "AI-assisted business review based only on the uploaded or pasted content.",
        hasMoney ? "Financial values or percentages appear in the material." : "No obvious financial values were detected.",
      ],
      scopeReviewed: ["Provided document, message or table content only."],
      keyFindings: detectTopics(lowerContent).map((topic) => `Relevant topic: ${topic}.`),
      riskIndicators: detectRisk(lowerContent) === "High"
        ? ["High-risk business, legal, payment or security language detected."]
        : ["No high-risk language was detected by local rules."],
      missingInformation: hasMissing
        ? ["The content references missing, unknown or placeholder values."]
        : ["No explicit missing-information marker was detected."],
      dataQualityConcerns: concerns,
      policyOrProcessConcerns: hasPolicy
        ? ["Policy, control, approval or process terms require human validation."]
        : ["No policy/process concern was detected in local review."],
      auditObservations: [
        "This is a preliminary AI-assisted business review, not a certified external audit.",
      ],
      recommendedFollowUpChecks: [
        "Validate source completeness with the document owner.",
        "Review high-risk or missing entries manually before decisions.",
      ],
      questionsRequiringHumanReview: [
        "Is the source data complete and approved?",
        "Are any financial, legal or compliance statements supported by evidence?",
      ],
      preliminaryAuditScore: deriveAuditBand(lowerContent),
    };
  }

  if (purpose === "Budget Review") {
    const hasRevenue = containsAny(lowerContent, ["revenue", "sales", "income", "arr", "mrr"]);
    const hasExpense = containsAny(lowerContent, ["expense", "cost", "spend", "vendor", "invoice"]);
    const hasVariance = containsAny(lowerContent, ["variance", "over budget", "under budget", "forecast"]);
    return {
      dataOverview: ["AI-assisted budget review based only on supplied content."],
      revenueExpenseObservations: [
        hasRevenue ? "Revenue or income terms were detected." : "No explicit revenue terms were detected.",
        hasExpense ? "Expense, cost or invoice terms were detected." : "No explicit expense terms were detected.",
      ],
      budgetVarianceIndicators: [
        hasVariance ? "Variance or forecast language was detected." : "No explicit variance language was detected.",
      ],
      notableTrends: [
        containsAny(lowerContent, ["increase", "decrease", "growth", "decline"])
          ? "Trend language appears in the source."
          : "No explicit trend language was detected.",
      ],
      exceptionsOrAnomalies: [
        containsAny(lowerContent, ["unusual", "unexpected", "duplicate", "missing"])
          ? "Possible exception or anomaly language detected."
          : "No obvious anomaly terms were detected.",
      ],
      missingOrInconsistentEntries: [
        containsAny(lowerContent, ["missing", "blank", "unknown", "duplicate"])
          ? "Potential missing, duplicate or inconsistent entries were referenced."
          : "No explicit missing or duplicate entry language was detected.",
      ],
      recommendedFollowUpChecks: [
        "Confirm totals against the original financial system before decisions.",
        "Review unusual entries and missing categories with a human owner.",
      ],
    };
  }

  return {};
}

function deriveAuditBand(lowerContent: string) {
  const highSignals = ["lawsuit", "breach", "fraud", "missing", "unapproved"].filter(
    (keyword) => lowerContent.includes(keyword),
  ).length;
  const mediumSignals = ["invoice", "payment", "contract", "variance", "policy"].filter(
    (keyword) => lowerContent.includes(keyword),
  ).length;

  if (highSignals > 0) {
    return "High preliminary risk band: high-severity terms were detected.";
  }

  if (mediumSignals > 1) {
    return "Medium preliminary risk band: multiple review-sensitive terms were detected.";
  }

  return "Low preliminary risk band: few review-sensitive terms were detected.";
}

function createExplanation({
  input,
  keyTopics,
  priority,
  sentiment,
  riskLevel,
  requestedActions,
}: {
  input: BusinessAnalysisInput;
  keyTopics: string[];
  priority: BusinessPriority;
  sentiment: BusinessSentiment;
  riskLevel: BusinessRiskLevel;
  requestedActions: string[];
}) {
  return [
    `Purpose selected by the user: ${input.purpose}.`,
    `Profile metadata applied for display context only: ${input.profile.name}.`,
    `Detected topics came from keyword matches: ${keyTopics.join(", ")}.`,
    `Priority was set to ${priority} from urgency, request and risk language.`,
    `Sentiment was set to ${sentiment} from positive and negative wording.`,
    `Risk was set to ${riskLevel} from sensitive, payment, legal or escalation terms.`,
    requestedActions.includes("No explicit requested action detected.")
      ? "No direct action request was found, so the next step asks for confirmation or clarification."
      : "One or more request phrases were found, so the recommendation focuses on answering them.",
  ];
}

function calculateConfidence({
  content,
  keyTopics,
  requestedActions,
  importantEntities,
}: {
  content: string;
  keyTopics: string[];
  requestedActions: string[];
  importantEntities: string[];
}) {
  let confidence = 0.58;

  if (content.length > 120) {
    confidence += 0.08;
  }

  if (!keyTopics.includes("General communication")) {
    confidence += 0.08;
  }

  if (!requestedActions.includes("No explicit requested action detected.")) {
    confidence += 0.08;
  }

  if (!importantEntities.includes("No important entities detected.")) {
    confidence += 0.06;
  }

  return Math.min(Number(confidence.toFixed(2)), 0.88);
}

function confidenceNeedsHumanReview({
  content,
  keyTopics,
  requestedActions,
  importantEntities,
}: {
  content: string;
  keyTopics: string[];
  requestedActions: string[];
  importantEntities: string[];
}) {
  return (
    calculateConfidence({
      content,
      keyTopics,
      requestedActions,
      importantEntities,
    }) < 0.7
  );
}

function containsAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}
