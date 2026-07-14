import type { PublicSecurityRule, SecurityRuleDefinition } from "./types";

const safeEducationalContext = [
  /\bnever\s+(share|send|provide|enter|give|reveal)\b/,
  /\bdo\s+not\s+(share|send|provide|enter|give|reveal)\b/,
  /\bdon t\s+(share|send|provide|enter|give|reveal)\b/,
  /\bwill\s+never\s+ask\b/,
  /\bno\s+one\s+from\s+the\s+team\s+will\s+ask\b/,
  /\bexample\s+of\s+(a\s+)?scam\b/,
  /\beducational\s+(example|warning)\b/,
];

const repeatedPromotionEvidence = (normalizedText: string) => {
  const evidence = new Set<string>();
  const promoMatches = normalizedText.match(
    /\b(buy now|join now|limited offer|100x|pump|moon|free tokens)\b/g,
  );

  if (promoMatches && promoMatches.length >= 3) {
    evidence.add(promoMatches.slice(0, 3).join(" "));
  }

  const words = normalizedText.split(" ").filter(Boolean);
  for (let index = 0; index <= words.length - 3; index += 1) {
    const phrase = words.slice(index, index + 3).join(" ");
    const occurrences = normalizedText.match(
      new RegExp(`\\b${phrase.replaceAll(" ", "\\s+")}\\b`, "g"),
    );

    if (occurrences && occurrences.length >= 3) {
      evidence.add(phrase);
    }
  }

  return [...evidence];
};

export const securityRuleDefinitions: SecurityRuleDefinition[] = [
  {
    ruleId: "SEC-001",
    name: "Seed phrase or recovery phrase request",
    description:
      "Detects requests for a seed phrase, recovery phrase, secret phrase, or recovery words.",
    severity: "CRITICAL",
    recommendedAction:
      "Escalate immediately, warn the user not to share recovery material, and remove or quarantine the message.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(share|send|provide|enter|confirm|verify|give|dm|message)\b.{0,50}\b(seed|recovery|secret)\s+(phrase|words?)\b/,
      /\b(seed|recovery|secret)\s+(phrase|words?)\b.{0,50}\b(required|needed|verify|confirm|send|share)\b/,
    ],
    safeContextPatterns: safeEducationalContext,
  },
  {
    ruleId: "SEC-002",
    name: "Private-key request",
    description: "Detects requests for a private key or wallet key.",
    severity: "CRITICAL",
    recommendedAction:
      "Escalate immediately and warn the user that private keys must never be shared.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(share|send|provide|enter|confirm|verify|give|dm|message)\b.{0,50}\bprivate\s+key\b/,
      /\bprivate\s+key\b.{0,50}\b(required|needed|verify|confirm|send|share)\b/,
    ],
    safeContextPatterns: safeEducationalContext,
  },
  {
    ruleId: "SEC-003",
    name: "Payment request to verify or unlock a wallet",
    description:
      "Detects requests to send money, crypto, or tokens to verify, activate, recover, or unlock a wallet.",
    severity: "CRITICAL",
    recommendedAction:
      "Escalate immediately and instruct the user not to send funds for wallet verification or unlocking.",
    requiresEscalationByDefault: true,
    patterns: [
      /\bsend\b.{0,45}\b(money|funds?|crypto|eth|btc|sol|usdc|tokens?)\b.{0,60}\b(verify|unlock|activate|recover|validate)\b.{0,30}\b(wallet|account)\b/,
      /\b(verify|unlock|activate|recover|validate)\b.{0,30}\b(wallet|account)\b.{0,60}\bsend\b.{0,45}\b(money|funds?|crypto|eth|btc|sol|usdc|tokens?)\b/,
    ],
    safeContextPatterns: safeEducationalContext,
  },
  {
    ruleId: "SEC-004",
    name: "Administrator contacting users privately",
    description:
      "Detects claims that an administrator or moderator will contact a user privately.",
    severity: "HIGH",
    recommendedAction:
      "Escalate to moderators and remind users to use verified public support channels.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(admin|administrator|moderator|mod|support)\b.{0,45}\b(dm|direct message|private message|pm|inbox|contact you privately)\b/,
      /\b(dm|direct message|private message|pm|inbox)\b.{0,45}\b(admin|administrator|moderator|mod|support)\b/,
    ],
    safeContextPatterns: safeEducationalContext,
  },
  {
    ruleId: "SEC-005",
    name: "Urgent wallet verification or account-suspension threat",
    description:
      "Detects urgent wallet verification demands or account suspension threats.",
    severity: "HIGH",
    recommendedAction:
      "Escalate for review and advise the user not to verify wallets through unsolicited messages.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(urgent|immediately|within\s+\d+\s+(minutes?|hours?)|last chance|final warning)\b.{0,80}\b(verify|validate|connect|update)\b.{0,40}\b(wallet|account)\b/,
      /\b(wallet|account)\b.{0,50}\b(suspended|suspension|disabled|locked|terminated)\b.{0,50}\b(verify|validate|connect|update)\b/,
    ],
    safeContextPatterns: safeEducationalContext,
  },
  {
    ruleId: "SEC-006",
    name: "Guaranteed profit or guaranteed return",
    description:
      "Detects promises of guaranteed profit, guaranteed returns, or risk-free crypto gains.",
    severity: "HIGH",
    recommendedAction:
      "Escalate for scam review and avoid providing financial advice in any automated response.",
    requiresEscalationByDefault: true,
    patterns: [
      /\bguaranteed\b.{0,30}\b(profits?|returns?|gains?|yield|income)\b/,
      /\b(risk free|no risk)\b.{0,30}\b(profits?|returns?|gains?|yield|income|crypto)\b/,
      /\b(profits?|returns?|gains?|yield|income)\b.{0,30}\bguaranteed\b/,
    ],
    safeContextPatterns: safeEducationalContext,
  },
  {
    ruleId: "SEC-007",
    name: "Unknown token-claim, airdrop or wallet-connection link",
    description:
      "Detects token claim, airdrop, or wallet-connection messages that include a link.",
    severity: "HIGH",
    recommendedAction:
      "Escalate and avoid presenting the link as official unless it is verified in project documentation.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(claim|airdrop|free tokens?|reward|mint|token migration)\b.{0,80}\b(connect|link|visit|open|go to|http|www\.)\b/,
      /\b(connect|link)\b.{0,25}\b(wallet)\b.{0,80}\b(claim|airdrop|reward|mint|token)\b/,
    ],
    safeContextPatterns: safeEducationalContext,
  },
  {
    ruleId: "SEC-008",
    name: "Administrator, support agent or founder impersonation",
    description:
      "Detects messages that claim authority as an admin, support agent, founder, or official team member.",
    severity: "HIGH",
    recommendedAction:
      "Escalate for identity verification and do not trust the claimed role without official confirmation.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(i am|i m|this is|official)\b.{0,35}\b(admin|administrator|support agent|support|founder|co founder|team member)\b/,
      /\b(admin|administrator|support agent|support|founder|co founder|team member)\b.{0,35}\b(here|speaking|team|official)\b/,
    ],
    safeContextPatterns: safeEducationalContext,
  },
  {
    ruleId: "SEC-009",
    name: "Missing funds or unauthorized transaction",
    description:
      "Detects reports of missing funds, stolen assets, drained wallets, or unauthorized transactions.",
    severity: "HIGH",
    recommendedAction:
      "Escalate to support and security operations for incident handling.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(missing|lost|stolen|drained|unauthorized|not authorized|unknown)\b.{0,45}\b(funds?|tokens?|assets?|transaction|transfer|wallet)\b/,
      /\b(funds?|tokens?|assets?|wallet)\b.{0,45}\b(missing|lost|stolen|drained)\b/,
      /\bunauthorized\s+(transaction|transfer|withdrawal)\b/,
    ],
  },
  {
    ruleId: "SEC-010",
    name: "Failed or pending transaction",
    description:
      "Detects support requests about failed, stuck, or pending transactions.",
    severity: "MEDIUM",
    recommendedAction:
      "Escalate to support with transaction details, while avoiding requests for secrets or credentials.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(failed|pending|stuck|delayed|dropped)\b.{0,35}\b(transaction|transfer|withdrawal|deposit|tx)\b/,
      /\b(transaction|transfer|withdrawal|deposit|tx)\b.{0,35}\b(failed|pending|stuck|delayed|dropped)\b/,
    ],
  },
  {
    ruleId: "SEC-011",
    name: "Remote-access software request",
    description:
      "Detects requests to install or use remote-access tools for support.",
    severity: "CRITICAL",
    recommendedAction:
      "Escalate immediately and warn users not to install remote-access tools from community messages.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(install|download|open|run|use)\b.{0,45}\b(anydesk|teamviewer|remote desktop|screen share|screenshare|remote access)\b/,
      /\b(anydesk|teamviewer|remote desktop|screen share|screenshare|remote access)\b.{0,45}\b(install|download|open|run|use)\b/,
    ],
    safeContextPatterns: safeEducationalContext,
  },
  {
    ruleId: "SEC-012",
    name: "Password, OTP or authentication-code request",
    description:
      "Detects requests for passwords, one-time passcodes, OTPs, 2FA codes, or authentication codes.",
    severity: "CRITICAL",
    recommendedAction:
      "Escalate immediately and warn the user never to share passwords or authentication codes.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(share|send|provide|enter|confirm|verify|give|dm|message)\b.{0,50}\b(password|otp|one time password|2fa|two factor|auth code|authentication code|login code)\b/,
      /\b(password|otp|one time password|2fa|two factor|auth code|authentication code|login code)\b.{0,50}\b(required|needed|verify|confirm|send|share)\b/,
    ],
    safeContextPatterns: safeEducationalContext,
  },
  {
    ruleId: "SEC-013",
    name: "Prompt injection attempting to override security rules",
    description:
      "Detects attempts to override system, developer, support, or security instructions.",
    severity: "HIGH",
    recommendedAction:
      "Escalate and ignore the attempted instruction override.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(ignore|forget|bypass|override|disable)\b.{0,45}\b(previous|above|system|developer|security|safety|rules?|instructions?)\b/,
      /\b(system|developer|security|safety|rules?|instructions?)\b.{0,45}\b(ignore|forget|bypass|override|disable)\b/,
      /\byou\s+are\s+now\b.{0,45}\b(no longer|not bound|allowed to ignore)\b/,
    ],
  },
  {
    ruleId: "SEC-014",
    name: "Suspicious shortened or obfuscated URL",
    description:
      "Detects shortened links, hxxp-style links, bracket-obfuscated domains, and lookalike URL formatting.",
    severity: "HIGH",
    recommendedAction:
      "Escalate and do not present the URL as official until verified.",
    requiresEscalationByDefault: true,
    patterns: [
      /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|cutt\.ly|is\.gd|rebrand\.ly|shorturl\.at|ow\.ly)\b/,
      /\bhxxps?:\/\//,
      /\b[a-z0-9-]+\s*(\[dot\]|\(dot\)|\s+dot\s+)\s*[a-z]{2,}\b/,
      /\bhttps?:\/\/[^\s]*(@|%40)[^\s]*/,
    ],
  },
  {
    ruleId: "SEC-015",
    name: "Spam or repeated promotional content",
    description:
      "Detects repeated promotional phrases or high-frequency promotional content.",
    severity: "MEDIUM",
    recommendedAction:
      "Queue for moderation or rate limiting; automated moderation response is acceptable when no higher risk is present.",
    requiresEscalationByDefault: false,
    patterns: [
      /\b(buy now|join now|limited offer|100x|pump|moon|free tokens)\b.{0,80}\b(buy now|join now|limited offer|100x|pump|moon|free tokens)\b/,
    ],
    customEvidence: repeatedPromotionEvidence,
  },
];

export const publicSecurityRules: PublicSecurityRule[] =
  securityRuleDefinitions.map(
    ({
      ruleId,
      name,
      description,
      severity,
      recommendedAction,
      requiresEscalationByDefault,
    }) => ({
      ruleId,
      name,
      description,
      severity,
      recommendedAction,
      requiresEscalationByDefault,
    }),
  );
