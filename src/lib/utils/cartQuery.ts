export type CartLookup = {
  userId?: string | null;
  sessionId?: string | null;
};

export function buildCartQuery({ userId, sessionId }: CartLookup): Record<string, string> | null {
  const normalizedUserId = typeof userId === 'string' && userId.trim() ? userId.trim() : null;
  const normalizedSessionId =
    typeof sessionId === 'string' && sessionId.trim() ? sessionId.trim() : null;

  if (normalizedUserId) return { userId: normalizedUserId };
  if (normalizedSessionId) return { sessionId: normalizedSessionId };
  return null;
}
