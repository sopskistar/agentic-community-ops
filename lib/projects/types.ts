export const responseTones = [
  "PROFESSIONAL",
  "FRIENDLY",
  "TECHNICAL",
  "CONCISE",
] as const;

export type ResponseTone = (typeof responseTones)[number];

export type Project = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  documentationText: string;
  officialLinks: string[];
  responseTone: ResponseTone;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  name: string;
  description: string;
  websiteUrl: string;
  documentationText: string;
  officialLinks: string[];
  responseTone: ResponseTone;
};
