import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, type Schemas } from '../../../services/api/apiClient';
import { invalidateBudgetData, queryKeys } from '../../../services/api/queryKeys';

export type SavingsAccount = Schemas['SavingsAccountView'];

export function useSavingsAccounts() {
  return useQuery({
    queryKey: queryKeys.savingsAccounts,
    queryFn: () => unwrap(api.GET('/v1/savings/accounts')),
  });
}

export function useSavingsTransactions(accountId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.savingsTransactions(accountId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      unwrap(
        api.GET('/v1/savings/accounts/{id}/transactions', {
          params: { path: { id: accountId }, query: { cursor: pageParam } },
        }),
      ),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
}

function useSavingsMutation<T, R>(mutationFn: (v: T) => Promise<R>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => invalidateBudgetData(client) });
}

export const useCreateSavingsAccount = () =>
  useSavingsMutation((body: Schemas['CreateSavingsAccountDto']) =>
    unwrap(api.POST('/v1/savings/accounts', { body })),
  );

export const useUpdateSavingsAccount = () =>
  useSavingsMutation(({ id, ...body }: { id: string } & Schemas['UpdateSavingsAccountDto']) =>
    unwrap(api.PATCH('/v1/savings/accounts/{id}', { params: { path: { id } }, body })),
  );

export const useDeleteSavingsAccount = () =>
  useSavingsMutation((id: string) =>
    unwrap(api.DELETE('/v1/savings/accounts/{id}', { params: { path: { id } } })),
  );

export const useCreateSavingsTransaction = () =>
  useSavingsMutation((body: Schemas['CreateSavingsTransactionDto']) =>
    unwrap(api.POST('/v1/savings/transactions', { body: { clientId: crypto.randomUUID(), ...body } })),
  );

export const useDeleteSavingsTransaction = () =>
  useSavingsMutation((id: string) =>
    unwrap(api.DELETE('/v1/savings/transactions/{id}', { params: { path: { id } } })),
  );
