import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorMessage } from '../../../components/feedback';
import { Card, Money, SkeletonList } from '../../../components/ui';
import { formatDate } from '../../../utils/dates';
import { useStatement } from '../hooks/useTracking';

/** Relevé du mois : chaque mouvement, du plus ancien au plus récent, et le solde. */
export function StatementPanel({ budgetId }: { budgetId: string }) {
  const { t, i18n } = useTranslation();
  const statement = useStatement(budgetId);

  if (statement.isError) return <ErrorMessage error={statement.error} onRetry={() => statement.refetch()} />;
  if (!statement.data) return <SkeletonList rows={6} />;
  const s = statement.data;
  if (s.entries.length === 0) return <EmptyState title={t('tracking.noMovement')} />;

  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-2 font-medium">{t('expenses.date')}</th>
              <th className="px-4 py-2 font-medium">{t('tracking.movement')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('expenses.amount')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('tracking.balance')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border text-muted">
              <td className="px-4 py-2" colSpan={3}>{t('tracking.opening')}</td>
              <td className="px-4 py-2 text-right"><Money cents={s.openingBalanceCents} currency={s.currency} /></td>
            </tr>
            {s.entries.map((e) => (
              <tr key={`${e.kind}-${e.id}`} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-2 text-muted">{formatDate(e.date, i18n.language)}</td>
                <td className="px-4 py-2">
                  <span className="font-medium">{e.label ?? t(`tracking.kind.${e.kind}`)}</span>
                  <span className="block text-xs text-muted">
                    {t(`tracking.kind.${e.kind}`)}
                    {e.detail && ` · ${e.detail}`}
                    {e.expected && ` · ${t('incomes.expected')}`}
                  </span>
                </td>
                <td className={`px-4 py-2 text-right ${e.amountCents >= 0 ? 'text-savings' : ''}`}>
                  <Money cents={e.amountCents} currency={s.currency} signed />
                </td>
                <td className={`px-4 py-2 text-right font-medium ${e.balanceCents < 0 ? 'text-danger' : ''}`}>
                  <Money cents={e.balanceCents} currency={s.currency} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border font-semibold">
              <td className="px-4 py-3" colSpan={3}>{t('tracking.closing')}</td>
              <td className="px-4 py-3 text-right"><Money cents={s.closingBalanceCents} currency={s.currency} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
