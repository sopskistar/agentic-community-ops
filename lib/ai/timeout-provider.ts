import type { AiAnalysisProvider } from "./types";

export function createTimeoutAiAnalysisProvider(
  provider: AiAnalysisProvider,
  timeoutMs: number,
): AiAnalysisProvider {
  return {
    async classifyMessage(input, context) {
      return withTimeout(
        provider.classifyMessage(input, context),
        timeoutMs,
        "AI analysis timed out.",
      );
    },
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}
