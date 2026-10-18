import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Schemas } from '../../../services/api/apiClient';

const STYLES = {
  green: { box: 'bg-savings-soft text-savings', Icon: CircleCheck },
  orange: { box: 'bg-warning-soft text-warning', Icon: TriangleAlert },
  red: { box: 'bg-danger-soft text-danger', Icon: CircleAlert },
} as const;

/** Indicateur de santé (RG-13) : couleur, icône et texte, jamais la couleur seule. */
export function BudgetHealth({ health }: { health: Schemas['HealthView'] }) {
  const { t } = useTranslation();
  const { box, Icon } = STYLES[health.color];
  return (
    <div className={`flex items-start gap-3 rounded-2xl p-4 ${box}`}>
      <Icon className="mt-0.5 size-6 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">{t(`dashboard.health.${health.color}`)}</p>
        <p className="text-sm opacity-90">
          {t('dashboard.health.detail', {
            spent: Math.round(health.spentRatio * 100),
            elapsed: Math.round(health.elapsedRatio * 100),
          })}
        </p>
      </div>
    </div>
  );
}
