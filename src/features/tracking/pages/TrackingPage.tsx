import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useSelectedMonth } from '../../../app/store';
import { EmptyState, ErrorMessage } from '../../../components/feedback';
import { MonthSwitcher } from '../../../components/layout/MonthSwitcher';
import { PageHeader } from '../../../components/layout/PageHeader';
import { buttonClass, SkeletonList } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { formatMonth } from '../../../utils/dates';
import { useBudgetForMonth } from '../../budgets/hooks/useBudget';
import { ActivityPanel } from '../components/ActivityPanel';
import { ReportPanel } from '../components/ReportPanel';
import { StatementPanel } from '../components/StatementPanel';

const TABS = ['report', 'statement', 'activity'] as const;
type Tab = (typeof TABS)[number];

/** Suivi du mois : bilan (prévu et réel), relevé avec solde, historique. */
export function TrackingPage() {
  const { t, i18n } = useTranslation();
  const [month, setMonth] = useSelectedMonth();
  const budget = useBudgetForMonth(month);
  const [tab, setTab] = useState<Tab>('report');

  return (
    <>
      <PageHeader title={t('nav.tracking')} subtitle={<MonthSwitcher value={month} onChange={setMonth} />} />

      {budget.isError ? (
        <ErrorMessage error={budget.error} onRetry={() => budget.refetch()} />
      ) : budget.isLoading ? (
        <SkeletonList />
      ) : !budget.data ? (
        <EmptyState
          title={t('budget.emptyTitle', { month: formatMonth(month, i18n.language) })}
          description={t('tracking.noBudget')}
          actions={<Link to={ROUTES.budget} className={buttonClass()}>{t('budget.planAction')}</Link>}
        />
      ) : (
        <>
          <div role="tablist" aria-label={t('nav.tracking')} className="mb-6 inline-flex rounded-xl border border-border bg-surface p-1">
            {TABS.map((id) => (
              <button
                key={id}
                id={`tab-${id}`}
                role="tab"
                type="button"
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setTab(id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === id ? 'bg-primary text-on-primary' : 'text-muted hover:text-text'}`}
              >
                {t(`tracking.tabs.${id}`)}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'report' && <ReportPanel budgetId={budget.data.id} />}
            {tab === 'statement' && <StatementPanel budgetId={budget.data.id} />}
            {tab === 'activity' && <ActivityPanel budgetId={budget.data.id} currency={budget.data.currency} />}
          </div>
        </>
      )}
    </>
  );
}
