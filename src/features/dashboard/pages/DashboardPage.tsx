import { ArrowDownCircle, ArrowUpCircle, CalendarClock, CalendarDays, CircleAlert, PiggyBank, Target, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useCurrentUser, useSelectedMonth } from '../../../app/store';
import { CategoryPieChart } from '../../../components/charts/CategoryPieChart';
import { MonthlyTrendChart } from '../../../components/charts/MonthlyTrendChart';
import { ProgressBar } from '../../../components/charts/ProgressBar';
import { EmptyState, ErrorMessage } from '../../../components/feedback';
import { MonthSwitcher } from '../../../components/layout/MonthSwitcher';
import { buttonClass, Card, CardTitle, Money, Skeleton, useMoneyFormatter } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { formatDate, formatMonth, parseDateOnly } from '../../../utils/dates';
import { CategoryIcon } from '../../budgets/components/CategoryIcon';
import { useBudgetForMonth } from '../../budgets/hooks/useBudget';
import { BudgetHealth } from '../components/BudgetHealth';
import { ColorCard, HeroBanner, QuickActions, RecentActivity, RecentExpenses } from '../components/DashboardBlocks';
import { useDashboardSummary, useDashboardTrend } from '../hooks/useDashboard';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Résumé du mois (US-14) : bandeau d'accueil, chiffres clés, activité, statistiques. */
export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const user = useCurrentUser();
  const [month, setMonth] = useSelectedMonth();
  const summary = useDashboardSummary(month);
  const budget = useBudgetForMonth(month);
  const trend = useDashboardTrend(6);
  const s = summary.data;
  const currency = s?.currency ?? user.currency;
  const format = useMoneyFormatter(currency);

  const title = user.displayName ? t('dashboard.welcomeBack', { name: user.displayName }) : t('dashboard.welcome');

  if (summary.isError) return <ErrorMessage error={summary.error} onRetry={() => summary.refetch()} />;
  if (!s) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </div>
    );
  }

  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((parseDateOnly(s.periodEnd).getTime() + DAY_MS - today.getTime()) / DAY_MS));
  const overspent = s.categories.filter((c) => c.overspent).length;
  const savingsProgress = s.savingsTargetCents > 0 ? s.savedCents / s.savingsTargetCents : undefined;

  return (
    <div className="space-y-6">
      <HeroBanner
        title={title}
        subtitle={t('dashboard.heroSubtitle', { month: formatMonth(month, i18n.language) })}
        aside={<MonthSwitcher value={month} onChange={setMonth} />}
        currency={currency}
        tiles={[
          { label: t('dashboard.income'), cents: s.incomeCents, icon: ArrowDownCircle, hint: t('dashboard.received', { amount: format(s.receivedIncomeCents) }) },
          { label: t('dashboard.spent'), cents: s.spentCents, icon: ArrowUpCircle, hint: s.planned ? t('dashboard.ofPlanned', { amount: format(s.plannedCents) }) : undefined },
          { label: t('dashboard.remaining'), cents: s.remainingCents, icon: Wallet },
          { label: t('dashboard.saved'), cents: s.savedCents, icon: PiggyBank, hint: s.savingsTargetCents > 0 ? t('dashboard.savingsGoal', { amount: format(s.savingsTargetCents) }) : undefined },
        ]}
      />

      {!s.planned ? (
        // Planification incitée, pas bloquante (section 1.4).
        <EmptyState
          icon={<CalendarClock className="size-8" />}
          title={t('dashboard.unplannedTitle', { month: formatMonth(month, i18n.language) })}
          description={t('dashboard.unplannedText')}
          actions={
            <>
              <Link to={ROUTES.onboarding} className={buttonClass()}>
                {t('onboarding.guided')}
              </Link>
              <Link to={ROUTES.budget} className={buttonClass('secondary')}>
                {t('budget.planAction')}
              </Link>
            </>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <ColorCard
              tone="green"
              icon={Target}
              label={t('dashboard.cards.savings')}
              value={savingsProgress === undefined ? '—' : `${Math.round(savingsProgress * 100)} %`}
              progress={savingsProgress}
              footer={t('dashboard.cards.savingsFooter', { saved: format(s.savedCents), target: format(s.savingsTargetCents) })}
            />
            <ColorCard
              tone="blue"
              icon={Wallet}
              label={t('dashboard.cards.planned')}
              value={<Money cents={s.plannedCents} currency={currency} />}
              footer={t('dashboard.cards.categories', { count: s.categories.filter((c) => c.id).length })}
            />
            <ColorCard
              tone="amber"
              icon={CalendarDays}
              label={t('dashboard.cards.daysLeft')}
              value={daysLeft}
              progress={s.health.elapsedRatio}
              footer={t('dashboard.cards.until', { date: formatDate(s.periodEnd, i18n.language, { day: 'numeric', month: 'long' }) })}
            />
            <ColorCard
              tone="red"
              icon={CircleAlert}
              label={t('dashboard.cards.overspent')}
              value={overspent}
              footer={t(`dashboard.health.${s.health.color}`)}
            />
          </div>

          <BudgetHealth health={s.health} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentExpenses from={s.periodStart} to={s.periodEnd} categories={budget.data?.categories ?? []} />
            </div>
            {s.budgetId && <RecentActivity budgetId={s.budgetId} currency={currency} />}
          </div>
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
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
        <Card className="p-5">
          <CardTitle>{t('dashboard.breakdown')}</CardTitle>
          {s.categories.some((c) => c.spentCents > 0) ? (
            <CategoryPieChart currency={currency} slices={s.categories.map((c) => ({ name: c.name, value: c.spentCents, color: c.color }))} />
          ) : (
            <p className="py-6 text-center text-muted">{t('dashboard.noExpenses')}</p>
          )}
        </Card>
      </div>

      {s.planned && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <CardTitle
              action={
                <Link to={ROUTES.budget} className="text-sm font-medium text-primary hover:underline">
                  {t('dashboard.seeBudget')}
                </Link>
              }
            >
              {t('dashboard.plannedVsActual')}
            </CardTitle>
            {s.categories.length === 0 ? (
              <p className="py-6 text-center text-muted">{t('dashboard.noCategories')}</p>
            ) : (
              <ul className="space-y-4">
                {[...s.categories]
                  .sort((a, b) => b.spentCents - a.spentCents)
                  .slice(0, 6)
                  .map((c) => (
                    <li key={c.id ?? 'unplanned'}>
                      <div className="mb-1.5 flex items-center gap-2 text-sm">
                        <CategoryIcon name={c.icon} color={c.color} size="sm" />
                        <span className="flex-1 truncate font-medium">{c.name}</span>
                        <Money cents={c.spentCents} currency={currency} />
                        {c.id && <span className="text-muted">/ {format(c.plannedCents)}</span>}
                      </div>
                      {c.id && <ProgressBar value={c.spentCents} max={c.plannedCents} label={c.name} />}
                    </li>
                  ))}
              </ul>
            )}
          </Card>
          <QuickActions />
        </div>
      )}
    </div>
  );
}
