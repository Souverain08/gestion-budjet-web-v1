import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormError } from '../../../components/feedback';
import { AmountInput, Button, Field, Modal, Select } from '../../../components/ui';
import { parseAmountToCents } from '../../../utils/money';
import { useReallocate, type Budget } from '../hooks/useBudget';

export interface Reallocation {
  fromCategoryId: string;
  toCategoryId: string;
  amountCents: number;
}

interface ReallocateModalProps {
  open: boolean;
  budget: Budget;
  onClose: () => void;
  /** Appelé après succès, pour proposer l'annulation (US-08) */
  onDone: (move: Reallocation) => void;
}

/** RG-07 : déplacer un montant prévu sans changer le total du budget. */
export function ReallocateModal({ open, budget, onClose, onDone }: ReallocateModalProps) {
  const { t } = useTranslation();
  const categories = budget.categories;
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string>();
  const reallocate = useReallocate();

  const close = () => {
    reallocate.reset();
    setAmount('');
    setError(undefined);
    onClose();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(amount);
    const fromCategoryId = from || categories[0]?.id;
    const toCategoryId = to || categories[1]?.id;
    if (!amountCents) return setError(t('validation.amount'));
    if (fromCategoryId === toCategoryId) return setError(t('budget.sameCategory'));
    setError(undefined);
    const move = { fromCategoryId, toCategoryId, amountCents };
    reallocate.mutate({ budgetId: budget.id, ...move }, { onSuccess: () => (onDone(move), close()) });
  };

  const options = categories.map((c) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ));

  return (
    <Modal open={open} title={t('budget.reallocate')} onClose={close}>
      <form noValidate onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('budget.from')}>
            {(p) => (
              <Select {...p} value={from || categories[0]?.id} onChange={(e) => setFrom(e.target.value)}>
                {options}
              </Select>
            )}
          </Field>
          <Field label={t('budget.to')}>
            {(p) => (
              <Select {...p} value={to || categories[1]?.id} onChange={(e) => setTo(e.target.value)}>
                {options}
              </Select>
            )}
          </Field>
        </div>
        <Field label={t('expenses.amount')} error={error}>
          {(p) => <AmountInput {...p} currency={budget.currency} value={amount} onChange={(e) => setAmount(e.target.value)} />}
        </Field>
        <p className="text-sm text-muted">{t('budget.reallocateHint')}</p>
        <FormError error={reallocate.error} />
        <Button type="submit" className="w-full" loading={reallocate.isPending}>
          {t('budget.reallocateAction')}
        </Button>
      </form>
    </Modal>
  );
}
