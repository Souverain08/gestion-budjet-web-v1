import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  value: number;
  max: number;
  /** Libellé accessible */
  label: string;
  tone?: 'budget' | 'savings';
}

/**
 * Barre prévu vs réel (US-10) : rouge au-delà de 100 %, et le dépassement
 * est aussi écrit, jamais porté par la seule couleur (section 6.1).
 */
export function ProgressBar({ value, max, label, tone = 'budget' }: ProgressBarProps) {
  const { t } = useTranslation();
  const percent = max > 0 ? (value / max) * 100 : value > 0 ? 101 : 0;
  const over = percent > 100;
  const color = over ? 'bg-danger' : tone === 'savings' ? 'bg-savings' : percent > 85 ? 'bg-warning' : 'bg-primary';

  return (
    <div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(percent, 100))}
        aria-valuetext={over ? t('budget.overspentA11y', { percent: Math.round(percent) }) : `${Math.round(percent)} %`}
        className="h-2 overflow-hidden rounded-full bg-surface-muted"
      >
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
      {over && <p className="mt-1 text-xs font-medium text-danger">{t('budget.overspent')}</p>}
    </div>
  );
}
