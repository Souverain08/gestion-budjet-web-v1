import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api, unwrap, type Schemas } from '../../../services/api/apiClient';

export type Report = Schemas['BudgetReportView'];
export type Statement = Schemas['StatementView'];
export type Activity = Schemas['ActivityView'];

/** Bilan du mois : où est passé chaque franc, prévu et réel. */
export function useReport(budgetId: string | undefined) {
  return useQuery({
    queryKey: ['budget', 'report', budgetId],
    enabled: Boolean(budgetId),
    queryFn: () => unwrap(api.GET('/v1/budgets/{id}/report', { params: { path: { id: budgetId! } } })),
  });
}

/** Relevé du mois avec le solde après chaque mouvement. */
export function useStatement(budgetId: string | undefined) {
  return useQuery({
    queryKey: ['budget', 'statement', budgetId],
    enabled: Boolean(budgetId),
    queryFn: () => unwrap(api.GET('/v1/budgets/{id}/statement', { params: { path: { id: budgetId! } } })),
  });
}

/** Historique des opérations du mois, les plus récentes d'abord. */
export function useActivity(budgetId: string | undefined) {
  return useInfiniteQuery({
    // Préfixe « budget » : rafraîchi après chaque écriture (invalidateBudgetData).
    queryKey: ['budget', 'activity', budgetId],
    enabled: Boolean(budgetId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      unwrap(api.GET('/v1/activity', { params: { query: { budgetId, cursor: pageParam, limit: 30 } } })),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}
