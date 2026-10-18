import { ArrowDownCircle, ArrowUpCircle, CalendarClock, PiggyBank, Plus, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { openQuickExpense, useAppDispatch, useCurrentUser, useSelectedMonth } from '../../../app/store';
import { CategoryPieChart } from '../../../components/charts/CategoryPieChart';
import { MonthlyTrendChart } from '../../../components/charts/MonthlyTrendChart';
import { ProgressBar } from '../../../components/charts/ProgressBar';
import { EmptyState, ErrorMessage } from '../../../components/feedback';
import { MonthSwitcher } from '../../../components/layout/MonthSwitcher';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button, buttonClass, Card, CardTitle, Money, Skeleton, useMoneyFormatter } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { formatMonth } from '../../../utils/dates';
import { CategoryIcon } from '../../budgets/components/CategoryIcon';
import { BudgetHealth } from '../components/BudgetHealth';
import { SummaryCard } from '../components/SummaryCard';
import { useDashboardSummary, useDashboardTrend } from '../hooks/useDashboard';

/** Résumé du mois (US-14) : revenus, dépensé, restant, épargné, santé, répartition. */
export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const user = useCurrentUser();
  const dispatch = useAppDispatch();
  const [month, setMonth] = useSelectedMonth();
  const summary = useDashboardSummary(month);
  const trend = useDashboardTrend(6);
  const s = summary.data;
  const currency = s?.currency ?? user.currency;
  const format = useMoneyFormatter(currency);

  return (
    <>
      <PageHeader
        title={user.displayName ? t('dashboard.hello', { name: user.displayName }) : t('nav.dashboard')}
        subtitle={<MonthSwitcher value={month} onChange={setMonth} />}
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => dispatch(openQuickExpense())}>
            {t('expenses.add')}
          </Button>
        }
      />

      {summary.isError ? (
        <ErrorMessage error={summary.error} onRetry={() => summary.refetch()} />
      ) : !s ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {!s.planned && (
            // Planification incitée, pas bloquante (section 1.4).
            <EmptyState
              icon={<CalendarClock className="size-8" />}
              title={t('dashboard.unplannedTitle', { month: formatMonth(month, i18n.language) })}
              description={t('dashboard.unplannedText')}
              actions={
                <Link to={ROUTES.budget} className={buttonClass()}>
                  {t('budget.planAction')}
                </Link>
              }
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label={t('dashboard.income')}
              cents={s.incomeCents}
              currency={currency}
              icon={<ArrowDownCircle className="size-4 text-primary" aria-hidden />}
              footer={t('dashboard.received', { amount: format(s.receivedIncomeCents) })}
            />
            <SummaryCard
              label={t('dashboard.spent')}
              cents={s.spentCents}
              currency={currency}
              icon={<ArrowUpCircle className="size-4 text-warning" aria-hidden />}
              footer={s.planned ? t('dashboard.ofPlanned', { amount: format(s.plannedCents) }) : undefined}
            />
            <SummaryCard
              label={t('dashboard.remaining')}
              cents={s.remainingCents}
              currency={currency}
              tone={s.remainingCents < 0 ? 'text-danger' : 'text-text'}
              icon={<Wallet className="size-4 text-primary" aria-hidden />}
            />
            <SummaryCard
              label={t('dashboard.saved')}
              cents={s.savedCents}
              currency={currency}
              tone="text-savings"
              icon={<PiggyBank className="size-4 text-savings" aria-hidden />}
              footer={s.savingsTargetCents > 0 ? t('dashboard.savingsGoal', { amount: format(s.savingsTargetCents) }) : undefined}
            />
          </div>

          {s.planned && <BudgetHealth health={s.health} />}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle>{t('dashboard.breakdown')}</CardTitle>
              {s.categories.some((c) => c.spentCents > 0) ? (
                <CategoryPieChart
                  currency={currency}
                  slices={s.categories.map((c) => ({ name: c.name, value: c.spentCents, color: c.color }))}
                />
              ) : (
                <p className="py-6 text-center text-muted">{t('dashboard.noExpenses')}</p>
              )}
            </Card>

            <Card>
              <CardTitle
                action={
                  <Link to={ROUTES.budget} className="text-sm text-primary hover:underline">
                    {t('dashboard.seeBudget')}
                  </Link>
                }
              >
                {t('dashboard.plannedVsActual')}
              </CardTitle>
              {s.categories.length === 0 ? (
                <p className="py-6 text-center text-muted">{t('dashboard.noCategories')}</p>
              ) : (
                <ul className="space-y-3">
                  {[...s.categories]
                    .sort((a, b) => b.spentCents - a.spentCents)
                    .slice(0, 6)
                    .map((c) => (
                      <li key={c.id ?? 'unplanned'}>
                        <div className="mb-1 flex items-center gap-2 text-sm">
                          <CategoryIcon name={c.icon} color={c.color} size="sm" />
                          <span className="flex-1 truncate">{c.name}</span>
                          <Money cents={c.spentCents} currency={currency} />
                          {c.id && <span className="text-muted">/ {format(c.plannedCents)}</span>}
                        </div>
                        {c.id && <ProgressBar value={c.spentCents} max={c.plannedCents} label={c.name} />}
                      </li>
                    ))}
                </ul>
              )}
            </Card>
          </div>

          <Card>
            <CardTitle>{t('dashboard.trend')}</CardTitle>
            {trend.data ? (
              <MonthlyTrendChart
                currency={currency}
                points={trend.data.map((p) => ({
                  label: new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(new Date(p.year, p.month - 1, 1)),
                  incomeCents: p.incomeCents,
                  spentCents: p.spentCents,
                  savedCents: p.savedCents,
                }))}
              />
            ) : (
              <Skeleton className="h-64" />
            )}
          </Card>
        </div>
      )}
    </>
  );
}
