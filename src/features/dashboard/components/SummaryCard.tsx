import type { ReactNode } from 'react';
import { Card, Money } from '../../../components/ui';

export function SummaryCard({
  label,
  cents,
  currency,
  icon,
  tone = 'text-text',
  footer,
}: {
  label: string;
  cents: number;
  currency: string;
  icon: ReactNode;
  tone?: string;
  footer?: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-sm text-muted">
        {icon}
        {label}
      </div>
      <Money cents={cents} currency={currency} className={`mt-2 block text-xl font-semibold ${tone}`} />
      {footer && <div className="mt-1 text-xs text-muted">{footer}</div>}
    </Card>
  );
}
