import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorMessage } from '../../../components/feedback';
import { Button, Money, SkeletonList } from '../../../components/ui';
import { useActivity, type Activity } from '../hooks/useTracking';

/** Historique daté de chaque opération, avec le montant avant et après. */
export function ActivityPanel({ budgetId, currency }: { budgetId: string; currency: string }) {
  const { t, i18n } = useTranslation();
  const activity = useActivity(budgetId);

  if (activity.isError) return <ErrorMessage error={activity.error} onRetry={() => activity.refetch()} />;
  if (activity.isLoading) return <SkeletonList rows={6} />;
  const items = activity.data?.pages.flatMap((p) => p.items) ?? [];
  if (items.length === 0) return <EmptyState title={t('tracking.noActivity')} />;

  const when = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <ol className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{describe(item, t)}</p>
              <p className="text-xs text-muted">
                <time dateTime={String(item.occurredAt)}>{when.format(new Date(item.occurredAt))}</time>
                {changesText(item, t) && ` · ${changesText(item, t)}`}
              </p>
            </div>
            <Amounts item={item} currency={item.currency ?? currency} />
          </li>
        ))}
      </ol>
      {activity.hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" loading={activity.isFetchingNextPage} onClick={() => activity.fetchNextPage()}>
            {t('common.loadMore')}
          </Button>
        </div>
      )}
    </>
  );
}

export type T = ReturnType<typeof useTranslation>['t'];

/** « Dépense modifiée : Marché » */
export function describe(item: Activity, t: T): string {
  const what = t(`tracking.entity.${item.entity}`);
  const action = t(`tracking.action.${item.action}`);
  const label = item.label === 'savingsTarget' ? t('budget.savingsTarget') : item.label;
  return label ? `${action} · ${what} : ${label}` : `${action} · ${what}`;
}

function changesText(item: Activity, t: T): string | null {
  if (!item.changes) return null;
  const parts = Object.entries(item.changes)
    .filter(([key]) => ['category', 'spentOn', 'status', 'name', 'expensesMovedTo', 'copiedFrom'].includes(key))
    .map(([key, [before, after]]) => `${t(`tracking.field.${key}`)} : ${String(before ?? '—')} → ${String(after ?? '—')}`);
  return parts.length ? parts.join(' · ') : null;
}

export function Amounts({ item, currency }: { item: Activity; currency: string }) {
  const before = item.amountBeforeCents;
  const after = item.amountAfterCents;
  if (before === null && after === null) return null;
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      {before !== null && <Money cents={before} currency={currency} className={after !== null && before !== after ? 'text-muted line-through' : ''} />}
      {before !== null && after !== null && before !== after && <ArrowRight className="size-3.5 text-muted" aria-label="→" />}
      {after !== null && (before === null || before !== after) && <Money cents={after} currency={currency} className="font-semibold" />}
    </span>
  );
}
