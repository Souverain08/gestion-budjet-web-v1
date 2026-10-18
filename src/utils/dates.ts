/** Dates « YYYY-MM-DD » dans le fuseau de l'appareil. */

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayDateOnly(): string {
  return toDateOnly(new Date());
}

export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' },
): string {
  return new Intl.DateTimeFormat(locale, options).format(parseDateOnly(value));
}

export interface YearMonth {
  year: number;
  month: number;
}

/**
 * Mois budgétaire en cours : avant le jour de début, on est encore dans la
 * période du mois précédent (RG-02).
 */
export function currentBudgetMonth(monthStartDay: number, now = new Date()): YearMonth {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (now.getDate() >= monthStartDay) return { year, month };
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function formatMonth({ year, month }: YearMonth, locale: string): string {
  const label = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}
