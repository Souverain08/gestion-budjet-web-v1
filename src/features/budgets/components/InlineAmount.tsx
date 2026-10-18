import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AmountInput } from '../../../components/ui';
import { centsToInput, parseAmountToCents } from '../../../utils/money';

interface InlineAmountProps {
  cents: number;
  currency: string;
  label: string;
  onSave: (cents: number) => void;
  disabled?: boolean;
}

/** Montant modifiable sur place : enregistré à la sortie du champ ou avec Entrée. */
export function InlineAmount({ cents, currency, label, onSave, disabled }: InlineAmountProps) {
  const { i18n } = useTranslation();
  const [value, setValue] = useState(centsToInput(cents, i18n.language));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => setValue(centsToInput(cents, i18n.language)), [cents, i18n.language]);

  const commit = () => {
    const parsed = value.trim() === '' ? 0 : parseAmountToCents(value);
    if (parsed === null) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (parsed !== cents) onSave(parsed);
  };

  return (
    <AmountInput
      aria-label={label}
      aria-invalid={invalid}
      currency={currency}
      value={value}
      disabled={disabled}
      className="h-10 text-base"
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur(), e.preventDefault())}
    />
  );
}
