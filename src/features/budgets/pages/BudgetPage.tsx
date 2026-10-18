import { ArrowLeftRight, CalendarPlus, Copy, PiggyBank, Plus, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useSelectedMonth } from '../../../app/store';
import { EmptyState, ErrorMessage, FormError } from '../../../components/feedback';
import { MonthSwitcher } from '../../../components/layout/MonthSwitcher';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button, Card, CardTitle, Money, SkeletonList } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { formatMonth, shiftMonth } from '../../../utils/dates';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { CategoryRow } from '../components/CategoryRow';
import { DeleteCategoryModal } from '../components/DeleteCategoryModal';
import { InlineAmount } from '../components/InlineAmount';
import { ReallocateModal, type Reallocation } from '../components/ReallocateModal';
import { RemainingToAllocate } from '../components/RemainingToAllocate';
import {
  useBudgetForMonth,
  useCreateBudget,
  useDuplicateBudget,
  useReallocate,
  useUpdateBudget,
  type Budget,
  type Category,
} from '../hooks/useBudget';

export function BudgetPage() {
  const { t } = useTranslation();
  const [month, setMonth] = useSelectedMonth();
  const budget = useBudgetForMonth(month);

  return (
    <>
      <PageHeader title={t('nav.budget')} subtitle={<MonthSwitcher value={month} onChange={setMonth} />} />
      {budget.isError ? (
        <ErrorMessage error={budget.error} onRetry={() => budget.refetch()} />
      ) : budget.isLoading ? (
        <SkeletonList rows={6} />
      ) : budget.data ? (
        <BudgetPlan budget={budget.data} />
      ) : (
        <NoBudget />
      )}
    </>
  );
}

/** Mois sans budget : créer ou dupliquer le mois précédent (section 6.4). */
function NoBudget() {
  const { t, i18n } = useTranslation();
  const [month] = useSelectedMonth();
  const previous = useBudgetForMonth(shiftMonth(month, -1));
  const create = useCreateBudget();
  const duplicate = useDuplicateBudget();

  return (
    <div className="space-y-3">
      <EmptyState
        icon={<CalendarPlus className="size-8" />}
        title={t('budget.emptyTitle', { month: formatMonth(month, i18n.language) })}
        description={t('budget.emptyText')}
        actions={
          <>
            {previous.data && (
              <Button
                icon={<Copy className="size-4" />}
                loading={duplicate.isPending}
                onClick={() => duplicate.mutate({ id: previous.data!.id, ...month })}
              >
                {t('budget.duplicatePrevious')}
              </Button>
            )}
            <Button
              variant={previous.data ? 'secondary' : 'primary'}
              loading={create.isPending}
              onClick={() => create.mutate({ ...month, withDefaultCategories: true })}
            >
              {t('budget.createAction')}
            </Button>
          </>
        }
      />
      <FormError error={create.error ?? duplicate.error} />
    </div>
  );
}

function BudgetPlan({ budget }: { budget: Budget }) {
  const { t, i18n } = useTranslation();
  const [month] = useSelectedMonth();
  const update = useUpdateBudget();
  const duplicate = useDuplicateBudget();
  const reallocate = useReallocate();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [reallocating, setReallocating] = useState(false);
  const [lastMove, setLastMove] = useState<Reallocation | null>(null);
  const next = shiftMonth(month, 1);

  return (
    <>
      <RemainingToAllocate budget={budget} />

      <div className="space-y-6">
        {/* RG-05 : l'épargne est la première ligne du budget */}
        <Card className="border-savings/40">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-savings-soft text-savings">
              <PiggyBank className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">{t('budget.savingsFirst')}</h2>
              <p className="text-sm text-muted">
                {t('budget.savedSoFar')} <Money cents={budget.savedCents} currency={budget.currency} className="text-savings" />
              </p>
            </div>
            <div className="w-full sm:w-44">
              <InlineAmount
                cents={budget.savingsTargetCents}
                currency={budget.currency}
                label={t('budget.savingsTarget')}
                onSave={(savingsTargetCents) => update.mutate({ id: budget.id, savingsTargetCents })}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle
            action={
              <Link to={ROUTES.incomes} className="text-sm text-primary hover:underline">
                {t('budget.manageIncomes')}
              </Link>
            }
          >
            {t('nav.incomes')}
          </CardTitle>
          <p className="text-sm text-muted">
            <Money cents={budget.incomeCents} currency={budget.currency} className="text-lg font-semibold text-text" />{' '}
            {t('budget.incomeReceived')}{' '}
            <Money cents={budget.receivedIncomeCents} currency={budget.currency} />
          </p>
        </Card>

        <Card>
          <CardTitle
            action={
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeftRight className="size-4" />}
                  disabled={budget.categories.length < 2}
                  onClick={() => setReallocating(true)}
                >
                  {t('budget.reallocate')}
                </Button>
                <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
                  {t('budget.addCategory')}
                </Button>
              </div>
            }
          >
            {t('budget.categories')}
          </CardTitle>

          {lastMove && (
            <div role="status" className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-primary-soft px-3 py-2 text-sm text-primary">
              {t('budget.moved')}
              <Button
                variant="ghost"
                size="sm"
                icon={<Undo2 className="size-4" />}
                loading={reallocate.isPending}
                onClick={() =>
                  reallocate.mutate(
                    {
                      budgetId: budget.id,
                      fromCategoryId: lastMove.toCategoryId,
                      toCategoryId: lastMove.fromCategoryId,
                      amountCents: lastMove.amountCents,
                    },
                    { onSuccess: () => setLastMove(null) },
                  )
                }
              >
                {t('common.undo')}
              </Button>
            </div>
          )}

          {budget.categories.length === 0 ? (
            <p className="py-6 text-center text-muted">{t('budget.noCategories')}</p>
          ) : (
            <ul className="divide-y divide-border">
              {budget.categories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  currency={budget.currency}
                  onEdit={() => setEditing(category)}
                  onDelete={() => setDeleting(category)}
                />
              ))}
            </ul>
          )}

          {budget.unplannedSpentCents > 0 && (
            <Link
              to={`${ROUTES.expenses}?categoryId=unplanned`}
              className="mt-3 flex items-center justify-between rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning"
            >
              <span>{t('budget.unplannedSpent')}</span>
              <Money cents={budget.unplannedSpentCents} currency={budget.currency} className="font-medium" />
            </Link>
          )}
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            icon={<Copy className="size-4" />}
            loading={duplicate.isPending}
            onClick={() => duplicate.mutate({ id: budget.id, ...next })}
          >
            {t('budget.duplicateTo', { month: formatMonth(next, i18n.language) })}
          </Button>
        </div>
        <FormError error={duplicate.error ?? update.error} />
        {duplicate.isSuccess && <p className="text-right text-sm text-savings">{t('budget.duplicated')}</p>}
      </div>

      <CategoryFormModal
        open={editing !== null}
        budgetId={budget.id}
        currency={budget.currency}
        category={editing === 'new' || editing === null ? undefined : editing}
        onClose={() => setEditing(null)}
      />
      <DeleteCategoryModal category={deleting} categories={budget.categories} onClose={() => setDeleting(null)} />
      <ReallocateModal open={reallocating} budget={budget} onClose={() => setReallocating(false)} onDone={setLastMove} />
    </>
  );
}
