export const appVersion = "v1.0.0";

export const appName = "AgenticOps AI";

export const appDescription =
  "AI Communication Intelligence Platform for Web3 community security, business intelligence, integrations, human approval workflows and explainable analysis.";

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_BASE_URL?.trim() ||
    "https://agenticopsai.xyz"
  ).replace(/\/$/, "");
}
