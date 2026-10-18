import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { useSelectedMonth } from '../../../app/store';
import { ProgressBar } from '../../../components/charts/ProgressBar';
import { EmptyState, ErrorMessage } from '../../../components/feedback';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button, Card, Modal, Money, SkeletonList } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { ExpenseForm } from '../../expenses/components/ExpenseForm';
import { ExpenseList } from '../../expenses/components/ExpenseList';
import { CategoryIcon } from '../components/CategoryIcon';
import { useBudgetForMonth } from '../hooks/useBudget';

/** Prévu vs réel d'une catégorie et ses dépenses de la période. */
export function CategoryDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [month] = useSelectedMonth();
  const budget = useBudgetForMonth(month);
  const [adding, setAdding] = useState(false);

  if (budget.isError) return <ErrorMessage error={budget.error} onRetry={() => budget.refetch()} />;
  if (budget.isLoading) return <SkeletonList />;

  const category = budget.data?.categories.find((c) => c.id === id);
  if (!budget.data || !category) {
    return (
      <EmptyState
        title={t('budget.categoryNotFound')}
        actions={
          <Link to={ROUTES.budget} className="text-primary hover:underline">
            {t('budget.backToBudget')}
          </Link>
        }
      />
    );
  }

  const { currency, periodStart, periodEnd } = budget.data;

  return (
    <>
      <Link to={ROUTES.budget} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft className="size-4" aria-hidden />
        {t('budget.backToBudget')}
      </Link>
      <PageHeader
        title={category.name}
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setAdding(true)}>
            {t('expenses.add')}
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <CategoryIcon name={category.icon} color={category.color} />
          <div className="flex-1">
            <p className="text-sm text-muted">{t('budget.spent')}</p>
            <p className="text-xl font-semibold">
              <Money cents={category.spentCents} currency={currency} className={category.overspent ? 'text-danger' : ''} />
              <span className="text-base font-normal text-muted">
                {' / '}
                <Money cents={category.plannedCents} currency={currency} />
              </span>
            </p>
          </div>
        </div>
        <ProgressBar value={category.spentCents} max={category.plannedCents} label={category.name} />
      </Card>

      <ExpenseList
        filters={{ categoryId: category.id, from: periodStart, to: periodEnd }}
        categories={budget.data.categories}
      />

      <Modal open={adding} title={t('expenses.add')} onClose={() => setAdding(false)}>
        {adding && <ExpenseForm defaultCategoryId={category.id} onDone={() => setAdding(false)} />}
      </Modal>
    </>
  );
}
