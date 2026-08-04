export interface SessionTokenIdentity {
  id?: string | null;
  sub?: string | null;
}

export function resolveUserIdFromToken(token: SessionTokenIdentity): string | undefined {
  return token.id?.trim() || token.sub?.trim() || undefined;
}
