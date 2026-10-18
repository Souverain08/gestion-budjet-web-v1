import { useTranslation } from 'react-i18next';
import { closeQuickExpense, useAppDispatch, useAppSelector } from '../../../app/store';
import { Modal } from '../../../components/ui';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { ExpenseForm } from './ExpenseForm';

/** Saisie rapide ouverte depuis n'importe quel écran. */
export function QuickExpenseModal() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.quickExpenseOpen);
  const online = useNetworkStatus();
  const close = () => dispatch(closeQuickExpense());

  return (
    <Modal open={open} title={t('expenses.add')} onClose={close}>
      {online ? (
        <ExpenseForm onDone={close} />
      ) : (
        // Le web est en lecture seule hors-ligne (section 12.1).
        <p className="text-muted">{t('offline.readOnly')}</p>
      )}
    </Modal>
  );
}
