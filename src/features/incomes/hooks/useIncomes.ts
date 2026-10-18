import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, type Schemas } from '../../../services/api/apiClient';
import { invalidateBudgetData, queryKeys } from '../../../services/api/queryKeys';

export type Income = Schemas['IncomeView'];

export function useIncomes(budgetId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.incomes(budgetId ?? ''),
    enabled: Boolean(budgetId),
    queryFn: () => unwrap(api.GET('/v1/incomes', { params: { query: { budgetId: budgetId! } } })),
  });
}

function useIncomeMutation<T, R>(mutationFn: (v: T) => Promise<R>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => invalidateBudgetData(client) });
}

export const useCreateIncome = () =>
  useIncomeMutation((body: Schemas['CreateIncomeDto']) => unwrap(api.POST('/v1/incomes', { body })));

export const useUpdateIncome = () =>
  useIncomeMutation(({ id, ...body }: { id: string } & Schemas['UpdateIncomeDto']) =>
    unwrap(api.PATCH('/v1/incomes/{id}', { params: { path: { id } }, body })),
  );

export const useDeleteIncome = () =>
  useIncomeMutation((id: string) => unwrap(api.DELETE('/v1/incomes/{id}', { params: { path: { id } } })));
