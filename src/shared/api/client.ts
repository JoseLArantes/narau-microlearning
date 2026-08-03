import { env } from '@/shared/config/env'

export class ApiError extends Error {
  status: number
  body: string

  constructor(status: number, body: string) {
    super(`API error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/** The ONE fetch wrapper: auth headers and error normalization go here. */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    throw new ApiError(res.status, await res.text())
  }
  return res.json() as Promise<T>
}
