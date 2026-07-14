import { OpenAiAnalysisProvider } from "./openai-provider";
import type { AiAnalysisProvider } from "./types";

export function createDefaultAiAnalysisProvider(): AiAnalysisProvider {
  if (!process.env.OPENAI_API_KEY) {
    return {
      async classifyMessage() {
        throw new Error("AI provider is not configured.");
      },
    };
  }

  return new OpenAiAnalysisProvider();
}
