/**
 * Montants en centimes, jamais en flottants (RG-01). Un seul endroit pour
 * lire une saisie et afficher un montant.
 */

/**
 * Lit une saisie utilisateur (« 12 », « 12,5 », « 1 234.56 ») et la convertit
 * en centimes. Renvoie null si la saisie est invalide.
 */
export function parseAmountToCents(input: string): number | null {
  // Espaces, y compris insécables (séparateur de milliers en français).
  const cleaned = input.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const [units, decimals = ''] = cleaned.split('.');
  const cents = Number(units) * 100 + Number(decimals.padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** Centimes → texte modifiable (« 1234.5 » → « 1234,50 » en français). */
export function centsToInput(cents: number, locale: string): string {
  const separator = locale.startsWith('fr') ? ',' : '.';
  const units = Math.trunc(cents / 100);
  const decimals = String(Math.abs(cents % 100)).padStart(2, '0');
  return `${units}${separator}${decimals}`;
}

export function formatCurrency(
  cents: number,
  currency: string,
  locale: string,
  options: { signed?: boolean } = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    signDisplay: options.signed ? 'exceptZero' : 'auto',
  }).format(cents / 100);
}

/** Part (0 à 1, ou plus en cas de dépassement), pour les barres de progression. */
export function ratio(part: number, total: number): number {
  if (total <= 0) return part > 0 ? 1 : 0;
  return part / total;
}
