import type { TFunction } from 'i18next';
import { ApiError } from '../services/api/apiClient';

/** Message lisible pour une erreur : traduction du code, sinon message de l'API. */
export function errorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    const key = `errors.${error.code}`;
    const translated = t(key);
    return translated === key ? error.message : translated;
  }
  return t('errors.UNKNOWN');
}

/** Premier message d'erreur d'un champ renvoyé par l'API (details). */
export function fieldError(error: unknown, field: string): string | undefined {
  return error instanceof ApiError ? error.details?.[field]?.[0] : undefined;
}
