import { ChevronRight, Minus, PiggyBank, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useCurrentUser } from '../../../app/store';
import { ProgressBar } from '../../../components/charts/ProgressBar';
import { EmptyState, ErrorMessage } from '../../../components/feedback';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button, Card, Money, SkeletonList, useMoneyFormatter } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { formatDate } from '../../../utils/dates';
import { SavingsAccountModal, SavingsMoveModal } from '../components/SavingsModals';
import { useSavingsAccounts, type SavingsAccount } from '../hooks/useSavings';

/** Comptes et objectifs d'épargne (US-13), solde calculé à partir des mouvements. */
export function SavingsPage() {
  const { t, i18n } = useTranslation();
  const user = useCurrentUser();
  const accounts = useSavingsAccounts();
  const format = useMoneyFormatter(user.currency);
  const [creating, setCreating] = useState(false);
  const [move, setMove] = useState<{ account: SavingsAccount; direction: 'deposit' | 'withdraw' } | null>(null);
  const list = accounts.data ?? [];
  const total = list.reduce((sum, a) => sum + a.balanceCents, 0);

  return (
    <>
      <PageHeader
        title={t('nav.savings')}
        subtitle={list.length > 0 && t('savings.totalBalance', { amount: format(total) })}
        actions={
          <Button variant="savings" icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>
            {t('savings.addAccount')}
          </Button>
        }
      />

      {accounts.isError ? (
        <ErrorMessage error={accounts.error} onRetry={() => accounts.refetch()} />
      ) : accounts.isLoading ? (
        <SkeletonList />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="size-8 text-savings" />}
          title={t('savings.emptyTitle')}
          description={t('savings.emptyText')}
          actions={
            <Button variant="savings" onClick={() => setCreating(true)}>
              {t('savings.addAccount')}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((account) => (
            <Card key={account.id} className="flex flex-col gap-3">
              <Link to={ROUTES.savingsAccount(account.id)} className="group flex items-center justify-between gap-2">
                <h2 className="truncate font-semibold group-hover:text-primary">{account.name}</h2>
                <ChevronRight className="size-4 text-muted" aria-hidden />
              </Link>
              <Money cents={account.balanceCents} currency={user.currency} className="text-2xl font-semibold text-savings" />
              {account.targetCents && (
                <div>
                  <ProgressBar value={account.balanceCents} max={account.targetCents} label={account.name} tone="savings" />
                  <p className="mt-1 text-sm text-muted">
                    {t('savings.progress', {
                      percent: Math.round((account.progress ?? 0) * 100),
                      target: format(account.targetCents),
                    })}
                    {account.deadline && ` · ${t('savings.by', { date: formatDate(account.deadline, i18n.language, { month: 'long', year: 'numeric' }) })}`}
                  </p>
                </div>
              )}
              <div className="mt-auto flex gap-2">
                <Button size="sm" variant="savings" icon={<Plus className="size-4" />} onClick={() => setMove({ account, direction: 'deposit' })}>
                  {t('savings.deposit')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Minus className="size-4" />}
                  disabled={account.balanceCents <= 0}
                  onClick={() => setMove({ account, direction: 'withdraw' })}
                >
                  {t('savings.withdraw')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SavingsAccountModal open={creating} currency={user.currency} onClose={() => setCreating(false)} />
      <SavingsMoveModal
        account={move?.account ?? null}
        direction={move?.direction ?? 'deposit'}
        currency={user.currency}
        onClose={() => setMove(null)}
      />
    </>
  );
}
