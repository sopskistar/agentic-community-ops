import type { BusinessProfile } from "./types";

export const businessProfiles: BusinessProfile[] = [
  {
    id: "default",
    name: "Default",
    industry: "General business",
    context: "Default communication review profile for general messages.",
    responseStyle: "Clear, concise and professional",
  },
  {
    id: "acme-corp",
    name: "Acme Corp",
    industry: "B2B services",
    context: "Demo company profile for commercial customer conversations.",
    responseStyle: "Helpful, direct and commercially aware",
  },
  {
    id: "demo-saas",
    name: "Demo SaaS",
    industry: "Software as a service",
    context: "Demo SaaS profile for product questions, trials and account issues.",
    responseStyle: "Product-informed and action-oriented",
  },
  {
    id: "support-center",
    name: "Support Center",
    industry: "Customer operations",
    context: "Demo support profile for service requests, complaints and urgent issues.",
    responseStyle: "Empathetic, structured and escalation-aware",
  },
];

export function getBusinessProfile(profileId: string) {
  return (
    businessProfiles.find((profile) => profile.id === profileId) ??
    businessProfiles[0]
  );
}
