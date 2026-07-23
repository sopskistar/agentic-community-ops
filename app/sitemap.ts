import type { MetadataRoute } from "next";

import { getAppBaseUrl } from "../lib/app-config";

const routes = [
  "/",
  "/security-engine",
  "/demo",
  "/dashboard",
  "/business",
  "/integrations",
  "/integrations/gmail",
  "/docs/asp",
  "/docs/architecture",
  "/privacy",
  "/data-deletion",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppBaseUrl();
  const now = new Date();
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
