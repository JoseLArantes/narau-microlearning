import { prisma } from "@narau/database";

const DEFAULT_READING_MINUTES = 5;

export async function getAppSettings(): Promise<{ defaultReadingMinutes: number }> {
  const settings = await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return { defaultReadingMinutes: settings.defaultReadingMinutes };
}

export async function getDefaultReadingMinutes(): Promise<number> {
  const settings = await getAppSettings();
  return settings.defaultReadingMinutes || DEFAULT_READING_MINUTES;
}

export async function setDefaultReadingMinutes(minutes: number): Promise<void> {
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: { defaultReadingMinutes: minutes },
    create: { id: 1, defaultReadingMinutes: minutes },
  });
}
