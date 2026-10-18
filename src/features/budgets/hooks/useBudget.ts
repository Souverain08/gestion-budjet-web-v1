import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, unwrap, type Schemas } from '../../../services/api/apiClient';
import { invalidateBudgetData, queryKeys } from '../../../services/api/queryKeys';
import type { YearMonth } from '../../../utils/dates';

export type Budget = Schemas['BudgetView'];
export type Category = Schemas['CategoryView'];

/** Budget du mois ; null si le mois n'est pas encore planifié. */
export function useBudgetForMonth(month: YearMonth) {
  return useQuery({
    queryKey: queryKeys.budgetForMonth(month),
    queryFn: async (): Promise<Budget | null> => {
      try {
        return await unwrap(api.GET('/v1/budgets', { params: { query: month } }));
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}

export function useBudget(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.budget(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => unwrap(api.GET('/v1/budgets/{id}', { params: { path: { id: id! } } })),
  });
}

/** Mutation qui rafraîchit toutes les vues budgétaires une fois terminée. */
function useBudgetMutation<TVariables, TResult>(mutationFn: (v: TVariables) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => invalidateBudgetData(client) });
}

export const useCreateBudget = () =>
  useBudgetMutation((body: Schemas['CreateBudgetDto']) => unwrap(api.POST('/v1/budgets', { body })));

export const useDuplicateBudget = () =>
  useBudgetMutation(({ id, ...body }: { id: string } & Schemas['DuplicateBudgetDto']) =>
    unwrap(api.POST('/v1/budgets/{id}/duplicate', { params: { path: { id } }, body })),
  );

export const useUpdateBudget = () =>
  useBudgetMutation(({ id, ...body }: { id: string } & Schemas['UpdateBudgetDto']) =>
    unwrap(api.PATCH('/v1/budgets/{id}', { params: { path: { id } }, body })),
  );

export const useCreateCategory = () =>
  useBudgetMutation(({ budgetId, ...body }: { budgetId: string } & Schemas['CreateCategoryDto']) =>
    unwrap(api.POST('/v1/budgets/{id}/categories', { params: { path: { id: budgetId } }, body })),
  );

export const useUpdateCategory = () =>
  useBudgetMutation(({ id, ...body }: { id: string } & Schemas['UpdateCategoryDto']) =>
    unwrap(api.PATCH('/v1/categories/{id}', { params: { path: { id } }, body })),
  );

export const useDeleteCategory = () =>
  useBudgetMutation(({ id, reassignTo }: { id: string; reassignTo?: string }) =>
    unwrap(api.DELETE('/v1/categories/{id}', { params: { path: { id }, query: { reassignTo } } })),
  );

export const useReallocate = () =>
  useBudgetMutation(({ budgetId, ...body }: { budgetId: string } & Schemas['ReallocateDto']) =>
    unwrap(api.POST('/v1/budgets/{id}/reallocate', { params: { path: { id: budgetId } }, body })),
  );
