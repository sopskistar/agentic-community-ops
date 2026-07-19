import type {
  BusinessAnalysisInput,
  BusinessAnalysisResult,
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

  return {
    summary: createSummary(sentences, input.purpose),
    intent,
    priority,
    sentiment,
    riskLevel,
    requestedActions,
    importantEntities,
    recommendedNextStep,
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
    }),
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

function createSummary(sentences: string[], purpose: BusinessAnalysisInput["purpose"]) {
  if (sentences.length === 0) {
    return "No communication content was available for analysis.";
  }

  const firstSentence = sentences[0].replace(/\s+/g, " ");
  return `${purpose} message about ${firstSentence.slice(0, 140)}${
    firstSentence.length > 140 ? "..." : ""
  }`;
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

function createReplyOutline({
  intent,
  priority,
  riskLevel,
}: {
  intent: string;
  priority: BusinessPriority;
  riskLevel: BusinessRiskLevel;
}) {
  return [
    "Open with a professional acknowledgement.",
    `Address the detected intent: ${intent}.`,
    `State the next step and expected timing for a ${priority.toLowerCase()} priority case.`,
    riskLevel === "High" || riskLevel === "Medium"
      ? "Avoid making commitments on sensitive details until an owner reviews the message."
      : "Close with a clear offer to help or confirm follow-up.",
  ];
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

function containsAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}
