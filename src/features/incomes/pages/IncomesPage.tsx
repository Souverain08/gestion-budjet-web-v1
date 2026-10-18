import { Banknote, CheckCircle2, Circle, Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useSelectedMonth } from '../../../app/store';
import { EmptyState, ErrorMessage, FormError } from '../../../components/feedback';
import { MonthSwitcher } from '../../../components/layout/MonthSwitcher';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button, buttonClass, Card, IconButton, Money, SkeletonList } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { formatDate } from '../../../utils/dates';
import { useBudgetForMonth } from '../../budgets/hooks/useBudget';
import { IncomeFormModal } from '../components/IncomeFormModal';
import { useDeleteIncome, useIncomes, useUpdateIncome, type Income } from '../hooks/useIncomes';

/** Revenus du mois (US-04) : attendus ou reçus (RG-09). */
export function IncomesPage() {
  const { t, i18n } = useTranslation();
  const [month, setMonth] = useSelectedMonth();
  const budget = useBudgetForMonth(month);
  const incomes = useIncomes(budget.data?.id);
  const update = useUpdateIncome();
  const remove = useDeleteIncome();
  const [editing, setEditing] = useState<Income | 'new' | null>(null);

  const header = (
    <PageHeader
      title={t('nav.incomes')}
      subtitle={<MonthSwitcher value={month} onChange={setMonth} />}
      actions={
        budget.data && (
          <Button icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            {t('incomes.add')}
          </Button>
        )
      }
    />
  );

  if (budget.isError) return (<>{header}<ErrorMessage error={budget.error} onRetry={() => budget.refetch()} /></>);
  if (budget.isLoading) return (<>{header}<SkeletonList /></>);
  if (!budget.data) {
    return (
      <>
        {header}
        <EmptyState
          icon={<Banknote className="size-8" />}
          title={t('incomes.noBudgetTitle')}
          description={t('incomes.noBudgetText')}
          actions={
            <Link to={ROUTES.budget} className={buttonClass()}>
              {t('budget.planAction')}
            </Link>
          }
        />
      </>
    );
  }

  const { currency, id: budgetId } = budget.data;
  const list = incomes.data ?? [];

  return (
    <>
      {header}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-muted">{t('incomes.total')}</p>
          <Money cents={budget.data.incomeCents} currency={currency} className="text-2xl font-semibold" />
        </Card>
        <Card>
          <p className="text-sm text-muted">{t('incomes.received')}</p>
          <Money cents={budget.data.receivedIncomeCents} currency={currency} className="text-2xl font-semibold text-savings" />
        </Card>
      </div>

      {incomes.isError ? (
        <ErrorMessage error={incomes.error} onRetry={() => incomes.refetch()} />
      ) : incomes.isLoading ? (
        <SkeletonList />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Banknote className="size-8" />}
          title={t('incomes.emptyTitle')}
          description={t('incomes.emptyText')}
          actions={<Button onClick={() => setEditing('new')}>{t('incomes.add')}</Button>}
        />
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {list.map((income) => {
            const received = income.status === 'received';
            return (
              <li key={income.id} className="flex items-center gap-3 px-4 py-3">
                <IconButton
                  label={received ? t('incomes.markExpected') : t('incomes.markReceived')}
                  onClick={() => update.mutate({ id: income.id, status: received ? 'expected' : 'received' })}
                  className={received ? 'text-savings' : ''}
                >
                  {received ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                </IconButton>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-medium">
                    {income.label}
                    {income.isRecurring && <Repeat className="size-3.5 text-muted" aria-label={t('incomes.recurring')} />}
                  </p>
                  <p className="text-sm text-muted">
                    {received && income.receivedOn
                      ? t('incomes.receivedOn', { date: formatDate(income.receivedOn, i18n.language) })
                      : t('incomes.expected')}
                  </p>
                </div>
                <Money cents={income.amountCents} currency={currency} className="font-medium" />
                <IconButton label={t('incomes.edit')} onClick={() => setEditing(income)}>
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton label={t('common.delete')} onClick={() => remove.mutate(income.id)}>
                  <Trash2 className="size-4" />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-3">
        <FormError error={update.error ?? remove.error} />
      </div>

      <IncomeFormModal
        open={editing !== null}
        budgetId={budgetId}
        currency={currency}
        income={editing === 'new' || editing === null ? undefined : editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
