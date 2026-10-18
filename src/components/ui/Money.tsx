import { forwardRef, type InputHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/money';

export function useMoneyFormatter(currency: string) {
  const { i18n } = useTranslation();
  return (cents: number, signed = false) => formatCurrency(cents, currency, i18n.language, { signed });
}

export function Money({
  cents,
  currency,
  className = '',
  signed = false,
}: {
  cents: number;
  currency: string;
  className?: string;
  signed?: boolean;
}) {
  const format = useMoneyFormatter(currency);
  return <span className={`tabular-nums ${className}`}>{format(cents, signed)}</span>;
}

/** Champ de montant : clavier décimal sur mobile, virgule ou point acceptés. */
export const AmountInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { currency: string }>(
  function AmountInput({ currency, className = '', ...props }, ref) {
    return (
      <div className="relative">
        <input
          ref={ref}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          className={`h-11 w-full rounded-xl border border-border bg-surface pr-14 pl-3 text-right text-lg tabular-nums text-text focus:border-primary focus:outline-none aria-[invalid=true]:border-danger ${className}`}
          {...props}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">
          {currency}
        </span>
      </div>
    );
  },
);
