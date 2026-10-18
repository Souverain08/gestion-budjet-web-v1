export const SUPPORTED_LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Devises proposées dans les paramètres (ISO 4217). */
export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'XOF', 'XAF', 'MAD', 'CDF'] as const;

export const STORAGE_KEYS = {
  locale: 'gb.locale',
  theme: 'gb.theme',
} as const;
