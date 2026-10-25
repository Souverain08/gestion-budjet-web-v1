import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../../../components/feedback';
import { Card, CardTitle, Money, SkeletonList, useMoneyFormatter } from '../../../components/ui';
import { useReport, type Report } from '../hooks/useTracking';

/** Où est passé chaque franc, puis prévu, réel et écart. */
export function ReportPanel({ budgetId }: { budgetId: string }) {
  const { t } = useTranslation();
  const report = useReport(budgetId);

  if (report.isError) return <ErrorMessage error={report.error} onRetry={() => report.refetch()} />;
  if (!report.data) return <SkeletonList rows={5} />;
  const r = report.data;

  return (
    <div className="space-y-6">
      <Flow report={r} />
      <Card>
        <CardTitle>{t('tracking.planVsActual')}</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-2 font-medium">{t('tracking.part')}</th>
                <th className="py-2 text-right font-medium">{t('tracking.planned')}</th>
                <th className="py-2 text-right font-medium">{t('tracking.actual')}</th>
                <th className="py-2 text-right font-medium">{t('tracking.gap')}</th>
              </tr>
            </thead>
            <tbody>
              <Row name={t('tracking.savings')} line={r.savings} currency={r.currency} kind="savings" strong />
              <Row name={t('tracking.spending')} line={r.spending} currency={r.currency} kind="spending" strong />
              {r.lines.map((line) => (
                <Row
                  key={line.categoryId ?? 'unplanned'}
                  name={line.name}
                  color={line.color}
                  line={line}
                  currency={r.currency}
                  kind="spending"
                  indent
                />
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">{t('tracking.gapHint')}</p>
      </Card>
    </div>
  );
}

/** Revenu → épargné → dépensé → reste. */
function Flow({ report }: { report: Report }) {
  const { t } = useTranslation();
  const format = useMoneyFormatter(report.currency);
  const f = report.flow;
  const steps = [
    { label: t('tracking.flow.income'), cents: f.incomeCents, sign: '', tone: 'text-primary', bar: 'bg-primary', hint: t('dashboard.received', { amount: format(f.receivedIncomeCents) }) },
    { label: t('tracking.flow.saved'), cents: f.savedCents, sign: '−', tone: 'text-savings', bar: 'bg-savings' },
    { label: t('tracking.flow.spent'), cents: f.spentCents, sign: '−', tone: 'text-warning', bar: 'bg-warning' },
    f.remainingCents < 0
      ? { label: t('tracking.flow.remaining'), cents: f.remainingCents, sign: '=', tone: 'text-danger', bar: 'bg-danger' }
      : { label: t('tracking.flow.remaining'), cents: f.remainingCents, sign: '=', tone: 'text-text', bar: 'bg-muted' },
  ];
  const max = Math.max(f.incomeCents, 1);

  return (
    <Card>
      <CardTitle>{t('tracking.whereMoneyWent')}</CardTitle>
      <ol className="space-y-3">
        {steps.map((s) => (
          <li key={s.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted">
                <span aria-hidden className="inline-block w-4 font-semibold">{s.sign}</span>
                {s.label}
              </span>
              <Money cents={s.cents} currency={report.currency} className={`text-lg font-semibold ${s.tone}`} />
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface-muted" aria-hidden>
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${Math.min(100, (Math.abs(s.cents) / max) * 100)}%` }}
              />
            </div>
            {s.hint && <p className="mt-0.5 text-xs text-muted">{s.hint}</p>}
          </li>
        ))}
      </ol>
    </Card>
  );
}

function Row({
  name,
  line,
  currency,
  kind,
  color,
  strong,
  indent,
}: {
  name: string;
  line: { plannedCents: number; actualCents: number; gapCents: number };
  currency: string;
  kind: 'savings' | 'spending';
  color?: string | null;
  strong?: boolean;
  indent?: boolean;
}) {
  const { t } = useTranslation();
  // Épargne : au-dessus du prévu, c'est bien. Dépenses : au-dessus, c'est un dépassement.
  const good = kind === 'savings' ? line.gapCents >= 0 : line.gapCents <= 0;
  const status =
    line.gapCents === 0
      ? t('tracking.onTarget')
      : kind === 'savings'
        ? good ? t('tracking.aboveTarget') : t('tracking.belowTarget')
        : good ? t('tracking.underBudget') : t('tracking.overBudget');

  return (
    <tr className="border-b border-border last:border-0">
      <td className={`py-2 ${strong ? 'font-semibold' : ''} ${indent ? 'pl-4' : ''}`}>
        <span className="inline-flex items-center gap-2">
          {color !== undefined && <span aria-hidden className="size-2.5 rounded-full" style={{ background: color ?? 'var(--text-muted)' }} />}
          {name}
        </span>
      </td>
      <td className="py-2 text-right"><Money cents={line.plannedCents} currency={currency} /></td>
      <td className="py-2 text-right"><Money cents={line.actualCents} currency={currency} /></td>
      <td className={`py-2 text-right ${good ? 'text-savings' : 'text-danger'}`}>
        <Money cents={line.gapCents} currency={currency} signed />
        <span className="block text-xs">{status}</span>
      </td>
    </tr>
  );
}
