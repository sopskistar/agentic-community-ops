const defaultTtlMs = 10 * 60 * 1000;

const processedEvents = new Map<string, number>();

export function hasSeenIntegrationEvent(key: string, now = Date.now()) {
  prune(now);

  if (processedEvents.has(key)) {
    return true;
  }

  processedEvents.set(key, now + defaultTtlMs);
  return false;
}

export function resetIntegrationDedupeForTests() {
  processedEvents.clear();
}

function prune(now: number) {
  for (const [key, expiresAt] of processedEvents.entries()) {
    if (expiresAt <= now) {
      processedEvents.delete(key);
    }
  }
}
