import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from '../../../app/store';
import { FormError } from '../../../components/feedback';
import { AmountInput, Button, Field, Input } from '../../../components/ui';
import { currentBudgetMonth, parseDateOnly, todayDateOnly } from '../../../utils/dates';
import { centsToInput, parseAmountToCents } from '../../../utils/money';
import { useBudgetForMonth } from '../../budgets/hooks/useBudget';
import { useCreateExpense, useUpdateExpense, type Expense } from '../hooks/useExpenses';
import { CategoryPicker } from './CategoryPicker';

interface ExpenseFormProps {
  expense?: Expense;
  /** Catégorie présélectionnée (depuis le détail d'une catégorie) */
  defaultCategoryId?: string | null;
  onDone: () => void;
}

/**
 * Saisie en 3 gestes (US-09) : montant, catégorie, valider. La date vaut
 * aujourd'hui par défaut, la note est facultative.
 */
export function ExpenseForm({ expense, defaultCategoryId = null, onDone }: ExpenseFormProps) {
  const { t, i18n } = useTranslation();
  const user = useCurrentUser();
  const [amount, setAmount] = useState(expense ? centsToInput(expense.amountCents, i18n.language) : '');
  const [categoryId, setCategoryId] = useState<string | null>(expense?.categoryId ?? defaultCategoryId);
  const [spentOn, setSpentOn] = useState(expense?.spentOn ?? todayDateOnly());
  const [note, setNote] = useState(expense?.note ?? '');
  const [amountError, setAmountError] = useState<string>();

  // Les catégories proposées sont celles du budget qui couvre la date (RG-02).
  const month = currentBudgetMonth(user.monthStartDay, parseDateOnly(spentOn));
  const budget = useBudgetForMonth(month);
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const mutation = expense ? update : create;

  const currency = budget.data?.currency ?? expense?.currency ?? user.currency;
  const categories = budget.data?.categories ?? [];
  const validCategory = categoryId === null || categories.some((c) => c.id === categoryId);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(amount);
    if (!amountCents) {
      setAmountError(t('validation.amount'));
      return;
    }
    const body = {
      amountCents,
      categoryId: validCategory ? categoryId : null,
      spentOn,
      note: note.trim() || null,
    };
    const options = { onSuccess: onDone };
    if (expense) update.mutate({ id: expense.id, ...body }, options);
    else create.mutate(body, options);
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <Field label={t('expenses.amount')} error={amountError}>
        {(p) => (
          <AmountInput
            {...p}
            autoFocus
            currency={currency}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setAmountError(undefined);
            }}
          />
        )}
      </Field>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">{t('expenses.category')}</legend>
        <CategoryPicker
          categories={categories}
          value={validCategory ? categoryId : null}
          onChange={setCategoryId}
          loading={budget.isLoading}
          unplannedMonth={!budget.isLoading && !budget.data}
        />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('expenses.date')}>
          {(p) => <Input {...p} type="date" required value={spentOn} onChange={(e) => e.target.value && setSpentOn(e.target.value)} />}
        </Field>
        <Field label={t('expenses.note')} hint={t('expenses.noteHint')}>
          {(p) => <Input {...p} maxLength={280} value={note} onChange={(e) => setNote(e.target.value)} />}
        </Field>
      </div>

      <FormError error={mutation.error} />
      <Button type="submit" className="w-full" loading={mutation.isPending}>
        {expense ? t('common.save') : t('expenses.addAction')}
      </Button>
    </form>
  );
}
