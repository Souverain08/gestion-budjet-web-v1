import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from '../../../services/api/apiClient';
import { queryKeys } from '../../../services/api/queryKeys';
import type { YearMonth } from '../../../utils/dates';

export function useDashboardSummary(month: YearMonth) {
  return useQuery({
    queryKey: queryKeys.summary(month),
    queryFn: () => unwrap(api.GET('/v1/dashboard/summary', { params: { query: month } })),
  });
}

export function useDashboardTrend(months = 6) {
  return useQuery({
    queryKey: queryKeys.trend(months),
    queryFn: () => unwrap(api.GET('/v1/dashboard/trend', { params: { query: { months } } })),
  });
}
