import { Pencil, Receipt, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { openQuickExpense, useAppDispatch } from '../../../app/store';
import { EmptyState, ErrorMessage, FormError } from '../../../components/feedback';
import { Button, IconButton, Modal, Money, SkeletonList } from '../../../components/ui';
import { formatDate } from '../../../utils/dates';
import type { Category } from '../../budgets/hooks/useBudget';
import { CategoryIcon } from '../../budgets/components/CategoryIcon';
import { useDeleteExpense, useExpenses, type Expense, type ExpenseFilters } from '../hooks/useExpenses';
import { ExpenseForm } from './ExpenseForm';

interface ExpenseListProps {
  filters: ExpenseFilters;
  /** Pour afficher le nom et l'icône de chaque catégorie */
  categories: Category[];
}

/** Dépenses regroupées par jour, avec modification et suppression (US-11). */
export function ExpenseList({ filters, categories }: ExpenseListProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const query = useExpenses(filters);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const remove = useDeleteExpense();
  const byId = new Map(categories.map((c) => [c.id, c]));

  if (query.isError) return <ErrorMessage error={query.error} onRetry={() => query.refetch()} />;
  if (query.isLoading) return <SkeletonList rows={5} />;

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="size-8" />}
        title={t('expenses.emptyTitle')}
        description={t('expenses.emptyText')}
        actions={<Button onClick={() => dispatch(openQuickExpense())}>{t('expenses.add')}</Button>}
      />
    );
  }

  const groups = new Map<string, Expense[]>();
  for (const expense of items) groups.set(expense.spentOn, [...(groups.get(expense.spentOn) ?? []), expense]);

  return (
    <>
      <div className="space-y-5">
        {[...groups].map(([day, expenses]) => (
          <section key={day}>
            <h3 className="mb-2 text-sm font-medium text-muted">
              {formatDate(day, i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
              {expenses.map((expense) => {
                const category = expense.categoryId ? byId.get(expense.categoryId) : undefined;
                const categoryName = category?.name ?? t(expense.categoryId ? 'expenses.otherMonth' : 'budget.unplanned');
                return (
                  <li key={expense.id} className="flex items-center gap-3 px-4 py-3">
                    <CategoryIcon name={category?.icon ?? (expense.categoryId ? 'tag' : 'circle-help')} color={category?.color ?? null} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{expense.note || categoryName}</p>
                      {expense.note && <p className="truncate text-sm text-muted">{categoryName}</p>}
                    </div>
                    <Money cents={expense.amountCents} currency={expense.currency} className="font-medium" />
                    <IconButton label={t('expenses.edit')} onClick={() => setEditing(expense)}>
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton label={t('expenses.delete')} onClick={() => setDeleting(expense)}>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {query.hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
            {t('common.loadMore')}
          </Button>
        </div>
      )}

      <Modal open={editing !== null} title={t('expenses.edit')} onClose={() => setEditing(null)}>
        {editing && <ExpenseForm key={editing.id} expense={editing} onDone={() => setEditing(null)} />}
      </Modal>

      <Modal open={deleting !== null} title={t('expenses.delete')} onClose={() => (remove.reset(), setDeleting(null))}>
        <p className="text-muted">{t('expenses.deleteConfirm')}</p>
        <FormError error={remove.error} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
          >
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
