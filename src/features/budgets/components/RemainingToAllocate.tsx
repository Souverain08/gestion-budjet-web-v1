import { CheckCircle2, PiggyBank } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormError } from '../../../components/feedback';
import { Button, Money, useMoneyFormatter } from '../../../components/ui';
import { useUpdateBudget, type Budget } from '../hooks/useBudget';

/**
 * Reste à répartir (RG-03) toujours visible. Activation possible quand il
 * est ≥ 0 (RG-04) ; au-dessus de zéro, on propose de verser le surplus à
 * l'épargne.
 */
export function RemainingToAllocate({ budget }: { budget: Budget }) {
  const { t } = useTranslation();
  const format = useMoneyFormatter(budget.currency);
  const update = useUpdateBudget();
  const left = budget.leftToAllocateCents;
  const tone = left < 0 ? 'text-danger' : left === 0 ? 'text-savings' : 'text-primary';

  return (
    <section
      aria-label={t('budget.leftToAllocate')}
      className="sticky top-0 z-10 -mx-4 mb-6 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:rounded-2xl md:border md:bg-surface md:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{t('budget.leftToAllocate')}</p>
          <p aria-live="polite" className={`text-2xl font-semibold ${tone}`}>
            <Money cents={left} currency={budget.currency} />
          </p>
          <p className="text-xs text-muted">
            {t('budget.formula', {
              income: format(budget.incomeCents),
              savings: format(budget.savingsTargetCents),
              planned: format(budget.plannedCents),
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {left > 0 && (
            <Button
              variant="savings"
              size="sm"
              icon={<PiggyBank className="size-4" />}
              loading={update.isPending && update.variables?.savingsTargetCents !== undefined}
              onClick={() => update.mutate({ id: budget.id, savingsTargetCents: budget.savingsTargetCents + left })}
            >
              {t('budget.surplusToSavings')}
            </Button>
          )}
          {budget.status === 'draft' ? (
            <Button
              size="sm"
              disabled={left < 0}
              title={left < 0 ? t('budget.activateDisabled') : undefined}
              loading={update.isPending && update.variables?.status === 'active'}
              onClick={() => update.mutate({ id: budget.id, status: 'active' })}
            >
              {t('budget.activate')}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-savings-soft px-3 py-1 text-sm font-medium text-savings">
              <CheckCircle2 className="size-4" aria-hidden />
              {t('budget.active')}
            </span>
          )}
        </div>
      </div>
      {left < 0 && <p className="mt-2 text-sm text-danger">{t('budget.negativeHint')}</p>}
      <div className="mt-2">
        <FormError error={update.error} />
      </div>
    </section>
  );
}
