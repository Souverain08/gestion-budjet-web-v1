import createClient, { type Middleware } from 'openapi-fetch';
import type { components, paths } from '../../types/api';
import { getAccessToken, setAccessToken } from './session';

export type Schemas = components['schemas'];
export type ApiErrorBody = Schemas['ErrorDto'];

const baseUrl = import.meta.env.VITE_API_URL ?? '';

/** Erreur d'API au format commun { code, message, details }. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string[]>;

  constructor(status: number, body: Partial<ApiErrorBody> | undefined) {
    super(body?.message ?? 'Erreur réseau');
    this.status = status;
    this.code = body?.code ?? (status === 0 ? 'NETWORK_ERROR' : 'INTERNAL_ERROR');
    this.details = body?.details;
  }
}

/** Le web reçoit le jeton de rafraîchissement dans un cookie httpOnly. */
const PLATFORM_HEADERS = { 'X-Client-Platform': 'web' };

let onSessionExpired: () => void = () => {};
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

/** Profil renvoyé par le dernier rafraîchissement réussi. */
export let lastRefreshUser: Schemas['UserView'] | null = null;

/** Un seul rafraîchissement à la fois, même si plusieurs requêtes échouent ensemble. */
let refreshing: Promise<boolean> | null = null;
export function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${baseUrl}/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...PLATFORM_HEADERS, 'Content-Type': 'application/json' },
    body: '{}',
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const body = (await res.json()) as Schemas['AuthResponseDto'];
      setAccessToken(body.accessToken);
      lastRefreshUser = body.user;
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

const retryCopies = new WeakMap<Request, Request>();

const authMiddleware: Middleware = {
  onRequest({ request }) {
    const token = getAccessToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    retryCopies.set(request, request.clone());
    return request;
  },
  async onResponse({ request, response }) {
    const isAuthRoute = new URL(request.url).pathname.startsWith('/v1/auth/');
    if (response.status !== 401 || isAuthRoute) return response;

    // Jeton d'accès expiré : on rafraîchit puis on rejoue la requête une fois.
    const copy = retryCopies.get(request);
    if (!copy || !(await refreshSession())) {
      setAccessToken(null);
      onSessionExpired();
      return response;
    }
    copy.headers.set('Authorization', `Bearer ${getAccessToken()}`);
    return fetch(copy);
  },
};

export const api = createClient<paths>({
  baseUrl,
  credentials: 'include',
  headers: PLATFORM_HEADERS,
});
api.use(authMiddleware);

/** Renvoie les données ou lève une ApiError. */
export async function unwrap<T>(
  promise: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  let result: { data?: T; error?: unknown; response: Response };
  try {
    result = await promise;
  } catch {
    throw new ApiError(0, undefined);
  }
  if (!result.response.ok) {
    throw new ApiError(result.response.status, result.error as ApiErrorBody | undefined);
  }
  return result.data as T;
}
