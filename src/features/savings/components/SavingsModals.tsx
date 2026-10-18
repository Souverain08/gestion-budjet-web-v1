import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormError } from '../../../components/feedback';
import { AmountInput, Button, Field, Input, Modal } from '../../../components/ui';
import { todayDateOnly } from '../../../utils/dates';
import { centsToInput, parseAmountToCents } from '../../../utils/money';
import {
  useCreateSavingsAccount,
  useCreateSavingsTransaction,
  useUpdateSavingsAccount,
  type SavingsAccount,
} from '../hooks/useSavings';

/** Création ou modification d'un compte ou objectif d'épargne (US-13). */
export function SavingsAccountModal({
  open,
  account,
  currency,
  onClose,
}: {
  open: boolean;
  account?: SavingsAccount;
  currency: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal open={open} title={account ? t('savings.editAccount') : t('savings.addAccount')} onClose={onClose}>
      {open && <AccountForm key={account?.id ?? 'new'} account={account} currency={currency} onDone={onClose} />}
    </Modal>
  );
}

function AccountForm({ account, currency, onDone }: { account?: SavingsAccount; currency: string; onDone: () => void }) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState(account?.name ?? '');
  const [target, setTarget] = useState(account?.targetCents ? centsToInput(account.targetCents, i18n.language) : '');
  const [deadline, setDeadline] = useState(account?.deadline ?? '');
  const [errors, setErrors] = useState<{ name?: string; target?: string }>({});
  const create = useCreateSavingsAccount();
  const update = useUpdateSavingsAccount();
  const mutation = account ? update : create;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const targetCents = target.trim() ? parseAmountToCents(target) : null;
    const next = {
      name: name.trim() ? undefined : t('validation.required'),
      target: target.trim() && !targetCents ? t('validation.amount') : undefined,
    };
    setErrors(next);
    if (next.name || next.target) return;
    const body = { name: name.trim(), targetCents, deadline: deadline || null };
    if (account) update.mutate({ id: account.id, ...body }, { onSuccess: onDone });
    else create.mutate(body, { onSuccess: onDone });
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <Field label={t('savings.name')} error={errors.name}>
        {(p) => <Input {...p} autoFocus maxLength={50} placeholder={t('savings.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />}
      </Field>
      <Field label={t('savings.target')} hint={t('common.optional')} error={errors.target}>
        {(p) => <AmountInput {...p} currency={currency} value={target} onChange={(e) => setTarget(e.target.value)} />}
      </Field>
      <Field label={t('savings.deadline')} hint={t('common.optional')}>
        {(p) => <Input {...p} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />}
      </Field>
      <FormError error={mutation.error} />
      <Button type="submit" className="w-full" variant="savings" loading={mutation.isPending}>
        {t('common.save')}
      </Button>
    </form>
  );
}

/** Versement (positif) ou retrait (négatif) sur un compte. */
export function SavingsMoveModal({
  account,
  direction,
  currency,
  onClose,
}: {
  account: SavingsAccount | null;
  direction: 'deposit' | 'withdraw';
  currency: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal
      open={account !== null}
      title={t(direction === 'deposit' ? 'savings.depositTo' : 'savings.withdrawFrom', { name: account?.name })}
      onClose={onClose}
    >
      {account && <MoveForm key={`${account.id}-${direction}`} account={account} direction={direction} currency={currency} onDone={onClose} />}
    </Modal>
  );
}

function MoveForm({
  account,
  direction,
  currency,
  onDone,
}: {
  account: SavingsAccount;
  direction: 'deposit' | 'withdraw';
  currency: string;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [madeOn, setMadeOn] = useState(todayDateOnly());
  const [error, setError] = useState<string>();
  const create = useCreateSavingsTransaction();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const cents = parseAmountToCents(amount);
    if (!cents) return setError(t('validation.amount'));
    setError(undefined);
    create.mutate(
      { savingsAccountId: account.id, amountCents: direction === 'deposit' ? cents : -cents, madeOn },
      { onSuccess: onDone },
    );
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <Field label={t('expenses.amount')} error={error}>
        {(p) => <AmountInput {...p} autoFocus currency={currency} value={amount} onChange={(e) => setAmount(e.target.value)} />}
      </Field>
      <Field label={t('expenses.date')}>
        {(p) => <Input {...p} type="date" value={madeOn} onChange={(e) => e.target.value && setMadeOn(e.target.value)} />}
      </Field>
      {direction === 'deposit' && <p className="text-sm text-muted">{t('savings.notSpentHint')}</p>}
      <FormError error={create.error} />
      <Button type="submit" className="w-full" variant={direction === 'deposit' ? 'savings' : 'primary'} loading={create.isPending}>
        {t(direction === 'deposit' ? 'savings.deposit' : 'savings.withdraw')}
      </Button>
    </form>
  );
}
