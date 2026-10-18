import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/money';

export interface PieSlice {
  name: string;
  value: number;
  color: string | null;
}

/** Répartition des dépenses par catégorie, avec la légende écrite à côté. */
export function CategoryPieChart({ slices, currency }: { slices: PieSlice[]; currency: string }) {
  const { i18n } = useTranslation();
  const data = slices.filter((s) => s.value > 0);
  const total = data.reduce((sum, s) => sum + s.value, 0);
  const format = (cents: number) => formatCurrency(cents, currency, i18n.language);

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <div className="h-44" aria-hidden>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="95%" strokeWidth={2} stroke="var(--surface)">
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color ?? 'var(--text-muted)'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => format(value)}
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-sm">
        {data.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-full" style={{ background: slice.color ?? 'var(--text-muted)' }} aria-hidden />
            <span className="flex-1 truncate">{slice.name}</span>
            <span className="tabular-nums text-muted">{Math.round((slice.value / total) * 100)} %</span>
            <span className="w-24 text-right tabular-nums">{format(slice.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
