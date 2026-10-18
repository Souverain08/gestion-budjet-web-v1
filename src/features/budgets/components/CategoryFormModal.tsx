import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormError } from '../../../components/feedback';
import { AmountInput, Button, Field, Input, Modal } from '../../../components/ui';
import { centsToInput, parseAmountToCents } from '../../../utils/money';
import { useCreateCategory, useUpdateCategory, type Category } from '../hooks/useBudget';
import { CATEGORY_ICON_NAMES, CategoryIcon } from './CategoryIcon';

const COLORS = ['#6366F1', '#22C55E', '#0EA5E9', '#EF4444', '#A855F7', '#F59E0B', '#EC4899', '#64748B', '#14B8A6', '#F97316'];

interface CategoryFormModalProps {
  open: boolean;
  budgetId: string;
  currency: string;
  category?: Category;
  onClose: () => void;
}

/** Création (US-07) ou modification d'une catégorie : nom, montant prévu, icône, couleur. */
export function CategoryFormModal({ open, budgetId, currency, category, onClose }: CategoryFormModalProps) {
  const { t } = useTranslation();
  return (
    <Modal open={open} title={category ? t('budget.editCategoryTitle') : t('budget.addCategory')} onClose={onClose}>
      {/* La clé remet le formulaire à zéro à chaque ouverture */}
      <CategoryForm key={category?.id ?? 'new'} budgetId={budgetId} currency={currency} category={category} onDone={onClose} />
    </Modal>
  );
}

function CategoryForm({
  budgetId,
  currency,
  category,
  onDone,
}: {
  budgetId: string;
  currency: string;
  category?: Category;
  onDone: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState(category?.name ?? '');
  const [planned, setPlanned] = useState(category ? centsToInput(category.plannedCents, i18n.language) : '');
  const [icon, setIcon] = useState(category?.icon ?? 'tag');
  const [color, setColor] = useState(category?.color ?? COLORS[0]);
  const [errors, setErrors] = useState<{ name?: string; planned?: string }>({});
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const mutation = category ? update : create;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const plannedCents = planned.trim() === '' ? 0 : parseAmountToCents(planned);
    const next = {
      name: name.trim() ? undefined : t('validation.required'),
      planned: plannedCents === null ? t('validation.amount') : undefined,
    };
    setErrors(next);
    if (next.name || next.planned) return;

    const body = { name: name.trim(), plannedCents: plannedCents!, icon, color };
    if (category) update.mutate({ id: category.id, ...body }, { onSuccess: onDone });
    else create.mutate({ budgetId, ...body }, { onSuccess: onDone });
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <Field label={t('budget.categoryName')} error={errors.name}>
        {(p) => <Input {...p} autoFocus maxLength={50} value={name} onChange={(e) => setName(e.target.value)} />}
      </Field>
      <Field label={t('budget.planned')} error={errors.planned}>
        {(p) => <AmountInput {...p} currency={currency} value={planned} onChange={(e) => setPlanned(e.target.value)} />}
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">{t('budget.icon')}</legend>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {CATEGORY_ICON_NAMES.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={icon === n}
              aria-label={n}
              onClick={() => setIcon(n)}
              className={`rounded-full p-0.5 ring-2 ${icon === n ? 'ring-primary' : 'ring-transparent'}`}
            >
              <CategoryIcon name={n} color={color} />
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">{t('budget.color')}</legend>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              aria-label={c}
              onClick={() => setColor(c)}
              className={`size-8 rounded-full ring-2 ring-offset-2 ring-offset-surface ${color === c ? 'ring-primary' : 'ring-transparent'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </fieldset>
      <FormError error={mutation.error} />
      <Button type="submit" className="w-full" loading={mutation.isPending}>
        {t('common.save')}
      </Button>
    </form>
  );
}
