export function utcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function parseUtcDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? startOfUtcDay() : date;
}

export function startOfUtcDay(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export function localDateForTimezone(utcDate: Date, timezone: string): Date {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(utcDate);
    const year = Number(parts.find((part) => part.type === "year")?.value ?? NaN);
    const month = Number(parts.find((part) => part.type === "month")?.value ?? NaN);
    const day = Number(parts.find((part) => part.type === "day")?.value ?? NaN);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return utcDate;
    }
    return new Date(Date.UTC(year, month - 1, day));
  } catch {
    return utcDate;
  }
}
