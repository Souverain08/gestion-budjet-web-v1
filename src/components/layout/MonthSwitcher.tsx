import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatMonth, shiftMonth, type YearMonth } from '../../utils/dates';
import { IconButton } from '../ui';

export function MonthSwitcher({ value, onChange }: { value: YearMonth; onChange: (v: YearMonth) => void }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1 text-text">
      <IconButton label={t('common.previousMonth')} onClick={() => onChange(shiftMonth(value, -1))}>
        <ChevronLeft className="size-5" />
      </IconButton>
      <span className="min-w-36 text-center font-medium" aria-live="polite">
        {formatMonth(value, i18n.language)}
      </span>
      <IconButton label={t('common.nextMonth')} onClick={() => onChange(shiftMonth(value, 1))}>
        <ChevronRight className="size-5" />
      </IconButton>
    </div>
  );
}
