import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ProgressBar } from '../../../components/charts/ProgressBar';
import { IconButton, Money } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { useUpdateCategory, type Category } from '../hooks/useBudget';
import { CategoryIcon } from './CategoryIcon';
import { InlineAmount } from './InlineAmount';

interface CategoryRowProps {
  category: Category;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
}

/** Ligne du plan : montant prévu modifiable, dépensé et barre prévu vs réel (US-10). */
export function CategoryRow({ category, currency, onEdit, onDelete }: CategoryRowProps) {
  const { t } = useTranslation();
  const update = useUpdateCategory();

  return (
    <li className="py-3">
      {/* Ordinateur : icône, nom, montant, actions. Téléphone : le montant passe à la ligne. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <CategoryIcon name={category.icon} color={category.color} />
        <div className="min-w-0 flex-1">
          <Link to={ROUTES.category(category.id)} className="group flex items-center gap-1 font-medium hover:text-primary">
            <span className="truncate">{category.name}</span>
            <ChevronRight className="size-4 shrink-0 text-muted group-hover:text-primary" aria-hidden />
          </Link>
          <p className="text-sm text-muted">
            {t('budget.spent')}{' '}
            <Money cents={category.spentCents} currency={currency} className={category.overspent ? 'font-medium text-danger' : ''} />
            {' · '}
            {category.remainingCents >= 0 ? (
              <>
                {t('budget.remaining')} <Money cents={category.remainingCents} currency={currency} />
              </>
            ) : (
              <span className="text-danger">
                {t('budget.over')} <Money cents={-category.remainingCents} currency={currency} />
              </span>
            )}
          </p>
        </div>
        <div className="order-last w-full pl-12 sm:order-none sm:w-40 sm:pl-0">
          <InlineAmount
            cents={category.plannedCents}
            currency={currency}
            label={t('budget.plannedFor', { name: category.name })}
            onSave={(plannedCents) => update.mutate({ id: category.id, plannedCents })}
          />
        </div>
        <div className="flex sm:order-last">
          <IconButton label={t('budget.editCategory', { name: category.name })} onClick={onEdit}>
            <Pencil className="size-4" />
          </IconButton>
          <IconButton label={t('budget.deleteCategory', { name: category.name })} onClick={onDelete}>
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>
      <div className="mt-2 pl-12">
        <ProgressBar value={category.spentCents} max={category.plannedCents} label={category.name} />
      </div>
    </li>
  );
}
