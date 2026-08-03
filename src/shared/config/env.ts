export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN ?? '',
} as const
