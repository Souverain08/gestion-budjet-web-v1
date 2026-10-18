import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, type Schemas } from '../../../services/api/apiClient';
import { invalidateBudgetData, queryKeys } from '../../../services/api/queryKeys';

export type Expense = Schemas['ExpenseView'];

export interface ExpenseFilters {
  from?: string;
  to?: string;
  /** Identifiant de catégorie ou « unplanned » */
  categoryId?: string;
}

/** Historique paginé par curseur (US-11). */
export function useExpenses(filters: ExpenseFilters, pageSize = 30) {
  return useInfiniteQuery({
    queryKey: queryKeys.expenses({ ...filters, pageSize }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      unwrap(
        api.GET('/v1/expenses', {
          params: { query: { ...filters, cursor: pageParam, limit: pageSize } },
        }),
      ),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

function useExpenseMutation<T, R>(mutationFn: (v: T) => Promise<R>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => invalidateBudgetData(client) });
}

/** clientId généré ici : un double clic ou un nouvel essai ne crée pas de doublon. */
export const useCreateExpense = () =>
  useExpenseMutation((body: Schemas['CreateExpenseDto']) =>
    unwrap(api.POST('/v1/expenses', { body: { clientId: crypto.randomUUID(), ...body } })),
  );

export const useUpdateExpense = () =>
  useExpenseMutation(({ id, ...body }: { id: string } & Schemas['UpdateExpenseDto']) =>
    unwrap(api.PATCH('/v1/expenses/{id}', { params: { path: { id } }, body })),
  );

export const useDeleteExpense = () =>
  useExpenseMutation((id: string) => unwrap(api.DELETE('/v1/expenses/{id}', { params: { path: { id } } })));
