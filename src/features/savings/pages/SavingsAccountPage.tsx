import { ArrowLeft, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { useCurrentUser } from '../../../app/store';
import { ProgressBar } from '../../../components/charts/ProgressBar';
import { EmptyState, ErrorMessage, FormError } from '../../../components/feedback';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button, Card, IconButton, Modal, Money, SkeletonList } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { formatDate } from '../../../utils/dates';
import { SavingsAccountModal, SavingsMoveModal } from '../components/SavingsModals';
import {
  useDeleteSavingsAccount,
  useDeleteSavingsTransaction,
  useSavingsAccounts,
  useSavingsTransactions,
} from '../hooks/useSavings';

export function SavingsAccountPage() {
  const { t, i18n } = useTranslation();
  const { id = '' } = useParams();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const accounts = useSavingsAccounts();
  const transactions = useSavingsTransactions(id);
  const removeAccount = useDeleteSavingsAccount();
  const removeMove = useDeleteSavingsTransaction();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [direction, setDirection] = useState<'deposit' | 'withdraw' | null>(null);

  if (accounts.isError) return <ErrorMessage error={accounts.error} onRetry={() => accounts.refetch()} />;
  if (accounts.isLoading) return <SkeletonList />;
  const account = accounts.data?.find((a) => a.id === id);
  if (!account) {
    return (
      <EmptyState
        title={t('savings.notFound')}
        actions={
          <Link to={ROUTES.savings} className="text-primary hover:underline">
            {t('savings.back')}
          </Link>
        }
      />
    );
  }

  const moves = transactions.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <>
      <Link to={ROUTES.savings} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft className="size-4" aria-hidden />
        {t('savings.back')}
      </Link>
      <PageHeader
        title={account.name}
        actions={
          <>
            <IconButton label={t('savings.editAccount')} onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
            </IconButton>
            <IconButton label={t('savings.deleteAccount')} onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" />
            </IconButton>
          </>
        }
      />

      <Card className="mb-6 space-y-3">
        <Money cents={account.balanceCents} currency={user.currency} className="text-3xl font-semibold text-savings" />
        {account.targetCents && (
          <ProgressBar value={account.balanceCents} max={account.targetCents} label={account.name} tone="savings" />
        )}
        <div className="flex gap-2">
          <Button variant="savings" icon={<Plus className="size-4" />} onClick={() => setDirection('deposit')}>
            {t('savings.deposit')}
          </Button>
          <Button variant="secondary" icon={<Minus className="size-4" />} disabled={account.balanceCents <= 0} onClick={() => setDirection('withdraw')}>
            {t('savings.withdraw')}
          </Button>
        </div>
      </Card>

      <h2 className="mb-3 font-semibold">{t('savings.history')}</h2>
      {transactions.isLoading ? (
        <SkeletonList />
      ) : moves.length === 0 ? (
        <p className="text-muted">{t('savings.noMoves')}</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {moves.map((move) => (
            <li key={move.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1">
                <p className="font-medium">{move.amountCents > 0 ? t('savings.deposit') : t('savings.withdraw')}</p>
                <p className="text-sm text-muted">{formatDate(move.madeOn, i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <Money cents={move.amountCents} currency={user.currency} signed className={move.amountCents > 0 ? 'text-savings' : ''} />
              <IconButton label={t('savings.cancelMove')} onClick={() => removeMove.mutate(move.id)}>
                <Trash2 className="size-4" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      {transactions.hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" loading={transactions.isFetchingNextPage} onClick={() => transactions.fetchNextPage()}>
            {t('common.loadMore')}
          </Button>
        </div>
      )}
      <div className="mt-3">
        <FormError error={removeMove.error} />
      </div>

      <SavingsAccountModal open={editing} account={account} currency={user.currency} onClose={() => setEditing(false)} />
      <SavingsMoveModal account={direction ? account : null} direction={direction ?? 'deposit'} currency={user.currency} onClose={() => setDirection(null)} />
      <Modal open={confirmDelete} title={t('savings.deleteAccount')} onClose={() => setConfirmDelete(false)}>
        <p className="text-muted">{t('savings.deleteConfirm')}</p>
        <FormError error={removeAccount.error} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            loading={removeAccount.isPending}
            onClick={() => removeAccount.mutate(account.id, { onSuccess: () => navigate(ROUTES.savings) })}
          >
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
