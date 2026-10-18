import type { QueryClient } from '@tanstack/react-query';
import type { YearMonth } from '../../utils/dates';

export const queryKeys = {
  budgetForMonth: (m: YearMonth) => ['budget', 'month', m.year, m.month] as const,
  budget: (id: string) => ['budget', id] as const,
  incomes: (budgetId: string) => ['incomes', budgetId] as const,
  expenses: (filters: object) => ['expenses', filters] as const,
  expense: (id: string) => ['expenses', 'one', id] as const,
  savingsAccounts: ['savings', 'accounts'] as const,
  savingsTransactions: (accountId: string) => ['savings', 'transactions', accountId] as const,
  summary: (m: YearMonth) => ['dashboard', 'summary', m.year, m.month] as const,
  trend: (months: number) => ['dashboard', 'trend', months] as const,
};

/**
 * Une écriture change souvent plusieurs vues (budget, tableau de bord,
 * historique) : on invalide toutes les données budgétaires.
 */
export function invalidateBudgetData(client: QueryClient): Promise<void> {
  return client.invalidateQueries({
    predicate: (query) =>
      ['budget', 'incomes', 'expenses', 'savings', 'dashboard'].includes(String(query.queryKey[0])),
  });
}
