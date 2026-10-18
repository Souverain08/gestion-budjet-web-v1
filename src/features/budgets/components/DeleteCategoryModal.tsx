import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormError } from '../../../components/feedback';
import { Button, Field, Modal, Select } from '../../../components/ui';
import { ApiError } from '../../../services/api/apiClient';
import { useDeleteCategory, type Category } from '../hooks/useBudget';

interface DeleteCategoryModalProps {
  category: Category | null;
  categories: Category[];
  onClose: () => void;
}

/** RG-12 : une catégorie qui contient des dépenses demande une catégorie de réaffectation. */
export function DeleteCategoryModal({ category, categories, onClose }: DeleteCategoryModalProps) {
  const { t } = useTranslation();
  const remove = useDeleteCategory();
  const [target, setTarget] = useState('unplanned');
  const needsTarget =
    (category?.spentCents ?? 0) > 0 || (remove.error instanceof ApiError && remove.error.code === 'REASSIGN_REQUIRED');

  const close = () => {
    remove.reset();
    setTarget('unplanned');
    onClose();
  };

  return (
    <Modal open={category !== null} title={t('budget.deleteTitle', { name: category?.name })} onClose={close}>
      {category && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            remove.mutate({ id: category.id, reassignTo: needsTarget ? target : undefined }, { onSuccess: close });
          }}
        >
          <p className="text-muted">{needsTarget ? t('budget.deleteWithExpenses') : t('budget.deleteConfirm')}</p>
          {needsTarget && (
            <Field label={t('budget.moveExpensesTo')}>
              {(p) => (
                <Select {...p} value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="unplanned">{t('budget.unplanned')}</option>
                  {categories
                    .filter((c) => c.id !== category.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </Select>
              )}
            </Field>
          )}
          {!(remove.error instanceof ApiError && remove.error.code === 'REASSIGN_REQUIRED') && <FormError error={remove.error} />}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="danger" loading={remove.isPending}>
              {t('common.delete')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
