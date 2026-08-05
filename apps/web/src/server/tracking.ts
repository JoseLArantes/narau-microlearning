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
      const user = event.userId
        ? await prisma.user.findUnique({
            where: { id: event.userId },
            select: { id: true, tenantId: true },
          })
        : null;

      await prisma.analyticsEvent.create({
        data: {
          ...(user ? { userId: user.id } : {}),
          ...(user ? { tenantId: user.tenantId } : {}),
          name: event.name,
          payload: (event.payload ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
    },
  });
}
