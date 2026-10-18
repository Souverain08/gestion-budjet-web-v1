import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormError } from '../../../components/feedback';
import { AmountInput, Button, Field, Input, Modal } from '../../../components/ui';
import { centsToInput, parseAmountToCents } from '../../../utils/money';
import { useCreateIncome, useUpdateIncome, type Income } from '../hooks/useIncomes';

interface IncomeFormModalProps {
  open: boolean;
  budgetId: string;
  currency: string;
  income?: Income;
  onClose: () => void;
}

export function IncomeFormModal({ open, budgetId, currency, income, onClose }: IncomeFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal open={open} title={income ? t('incomes.edit') : t('incomes.add')} onClose={onClose}>
      {open && <IncomeForm key={income?.id ?? 'new'} budgetId={budgetId} currency={currency} income={income} onDone={onClose} />}
    </Modal>
  );
}

function IncomeForm({ budgetId, currency, income, onDone }: Omit<IncomeFormModalProps, 'open' | 'onClose'> & { onDone: () => void }) {
  const { t, i18n } = useTranslation();
  const [label, setLabel] = useState(income?.label ?? '');
  const [amount, setAmount] = useState(income ? centsToInput(income.amountCents, i18n.language) : '');
  const [received, setReceived] = useState(income?.status === 'received');
  const [recurring, setRecurring] = useState(income?.isRecurring ?? false);
  const [errors, setErrors] = useState<{ label?: string; amount?: string }>({});
  const create = useCreateIncome();
  const update = useUpdateIncome();
  const mutation = income ? update : create;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(amount);
    const next = {
      label: label.trim() ? undefined : t('validation.required'),
      amount: amountCents ? undefined : t('validation.amount'),
    };
    setErrors(next);
    if (next.label || next.amount) return;

    const body = {
      label: label.trim(),
      amountCents: amountCents!,
      status: received ? ('received' as const) : ('expected' as const),
      isRecurring: recurring,
    };
    if (income) update.mutate({ id: income.id, ...body }, { onSuccess: onDone });
    else create.mutate({ budgetId, ...body }, { onSuccess: onDone });
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <Field label={t('incomes.label')} error={errors.label}>
        {(p) => <Input {...p} autoFocus maxLength={80} placeholder={t('incomes.labelPlaceholder')} value={label} onChange={(e) => setLabel(e.target.value)} />}
      </Field>
      <Field label={t('expenses.amount')} error={errors.amount}>
        {(p) => <AmountInput {...p} currency={currency} value={amount} onChange={(e) => setAmount(e.target.value)} />}
      </Field>
      <label className="flex items-center gap-3">
        <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={received} onChange={(e) => setReceived(e.target.checked)} />
        {t('incomes.alreadyReceived')}
      </label>
      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 size-4 accent-[var(--primary)]" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
        <span>
          {t('incomes.recurring')}
          <span className="block text-sm text-muted">{t('incomes.recurringHint')}</span>
        </span>
      </label>
      <FormError error={mutation.error} />
      <Button type="submit" className="w-full" loading={mutation.isPending}>
        {t('common.save')}
      </Button>
    </form>
  );
}
