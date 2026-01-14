export type CartLookup = {
  userId?: string | null;
  sessionId?: string | null;
};

export function buildCartQuery({ userId, sessionId }: CartLookup): { $or: Array<any> } | null {
  const ors: Array<Record<string, string>> = [];
  const normalizedUserId = typeof userId === 'string' && userId.trim() ? userId.trim() : null;
  const normalizedSessionId =
    typeof sessionId === 'string' && sessionId.trim() ? sessionId.trim() : null;

  if (normalizedUserId) ors.push({ userId: normalizedUserId });
  if (normalizedSessionId) ors.push({ sessionId: normalizedSessionId });

  if (!ors.length) return null;
  return { $or: ors };
}
