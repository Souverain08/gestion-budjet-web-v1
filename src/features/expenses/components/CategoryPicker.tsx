import { CircleHelp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../../components/ui';
import type { Category } from '../../budgets/hooks/useBudget';
import { CategoryIcon } from '../../budgets/components/CategoryIcon';

interface CategoryPickerProps {
  categories: Category[];
  value: string | null;
  onChange: (id: string | null) => void;
  loading?: boolean;
  /** Le mois n'a pas de budget : seule « Non planifié » est possible (RG-11) */
  unplannedMonth?: boolean;
}

/** Puces de catégories : un seul geste pour choisir. */
export function CategoryPicker({ categories, value, onChange, loading, unplannedMonth }: CategoryPickerProps) {
  const { t } = useTranslation();
  if (loading) return <Skeleton className="h-20 w-full" />;

  const chip = (selected: boolean) =>
    `flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
      selected ? 'border-primary bg-primary-soft text-primary' : 'border-border hover:bg-surface-muted'
    }`;

  return (
    <div className="space-y-2">
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="radio"
            aria-checked={value === category.id}
            onClick={() => onChange(category.id)}
            className={chip(value === category.id)}
          >
            <CategoryIcon name={category.icon} color={category.color} size="sm" />
            {category.name}
          </button>
        ))}
        <button type="button" role="radio" aria-checked={value === null} onClick={() => onChange(null)} className={chip(value === null)}>
          <CircleHelp className="size-4" aria-hidden />
          {t('budget.unplanned')}
        </button>
      </div>
      {unplannedMonth && <p className="text-sm text-muted">{t('expenses.noBudgetHint')}</p>}
    </div>
  );
}
