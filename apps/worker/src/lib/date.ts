export function utcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function parseUtcDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error(`Invalid UTC date "${value}", expected YYYY-MM-DD`);
  }
  return new Date(Date.UTC(year, month - 1, day));
}
