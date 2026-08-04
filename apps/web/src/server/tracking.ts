import { prisma, type Prisma } from "@narau/database";
import { trackEvent, type AnalyticsEventName } from "@narau/analytics";

export function track(
  userId: string | undefined,
  name: AnalyticsEventName,
  payload?: Record<string, unknown>,
): Promise<void> {
  return trackEvent(name, payload, {
    userId,
    write: async (event) => {
      await prisma.analyticsEvent.create({
        data: {
          userId: event.userId,
          name: event.name,
          payload: (event.payload ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
    },
  });
}
