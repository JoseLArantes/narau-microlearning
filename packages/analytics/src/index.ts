import { ANALYTICS_EVENT_NAMES } from "./events";
import type { AnalyticsEventName } from "./events";

export interface TrackEventOptions {
  userId?: string;
  write?: (event: { name: AnalyticsEventName; userId?: string; payload?: Record<string, unknown> }) => Promise<void>;
}

/**
 * Records an analytics event. When a write callback is injected the event is
 * persisted through it (for example to the database). Otherwise events are
 * logged in non-production environments only.
 */
export async function trackEvent(name: AnalyticsEventName, payload?: Record<string, unknown>, options: TrackEventOptions = {}): Promise<void> {
  const event = { name, userId: options.userId, payload };
  if (options.write) {
    await options.write(event);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${name}`, payload ?? {});
  }
}

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENT_NAMES as readonly string[]).includes(value);
}

export { ANALYTICS_EVENT_NAMES };
export type { AnalyticsEventName } from "./events";
