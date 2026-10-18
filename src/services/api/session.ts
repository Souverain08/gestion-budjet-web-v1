/**
 * Jeton d'accès gardé en mémoire uniquement (jamais dans localStorage).
 * Le jeton de rafraîchissement est un cookie httpOnly posé par l'API.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
