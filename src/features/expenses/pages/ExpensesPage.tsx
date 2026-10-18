import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { openQuickExpense, useAppDispatch, useSelectedMonth } from '../../../app/store';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button, Field, Input, Select } from '../../../components/ui';
import { useBudgetForMonth } from '../../budgets/hooks/useBudget';
import { ExpenseList } from '../components/ExpenseList';

/** Historique filtrable par période et par catégorie (US-11). Les filtres vivent dans l'URL. */
export function ExpensesPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [params, setParams] = useSearchParams();
  const [month] = useSelectedMonth();
  const categories = useBudgetForMonth(month).data?.categories ?? [];

  const filters = {
    from: params.get('from') || undefined,
    to: params.get('to') || undefined,
    categoryId: params.get('categoryId') || undefined,
  };
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHeader
        title={t('nav.expenses')}
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => dispatch(openQuickExpense())}>
            {t('expenses.add')}
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Field label={t('expenses.from')}>
          {(p) => <Input {...p} type="date" value={filters.from ?? ''} onChange={(e) => setFilter('from', e.target.value)} />}
        </Field>
        <Field label={t('expenses.to')}>
          {(p) => <Input {...p} type="date" value={filters.to ?? ''} onChange={(e) => setFilter('to', e.target.value)} />}
        </Field>
        <Field label={t('expenses.category')}>
          {(p) => (
            <Select {...p} value={filters.categoryId ?? ''} onChange={(e) => setFilter('categoryId', e.target.value)}>
              <option value="">{t('expenses.allCategories')}</option>
              <option value="unplanned">{t('budget.unplanned')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <ExpenseList filters={filters} categories={categories} />
    </>
  );
}
