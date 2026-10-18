import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/money';

export interface TrendPoint {
  label: string;
  incomeCents: number;
  spentCents: number;
  savedCents: number;
}

export function MonthlyTrendChart({ points, currency }: { points: TrendPoint[]; currency: string }) {
  const { t, i18n } = useTranslation();
  const format = (cents: number) => formatCurrency(cents, currency, i18n.language);
  const compact = (cents: number) =>
    new Intl.NumberFormat(i18n.language, { notation: 'compact', maximumFractionDigits: 1 }).format(cents / 100);

  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={points} margin={{ left: -12, right: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <YAxis tickFormatter={compact} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => format(value)}
            cursor={{ fill: 'var(--surface-muted)' }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="incomeCents" name={t('dashboard.income')} fill="var(--primary)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="spentCents" name={t('dashboard.spent')} fill="var(--warning)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="savedCents" name={t('dashboard.saved')} fill="var(--savings)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
