import { AlertCircle, WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { errorMessage } from '../../utils/errors';
import { Button } from '../ui';

/** Erreur claire avec « Réessayer » (section 6.4). */
export function ErrorMessage({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-danger/40 bg-danger-soft p-6 text-center">
      <AlertCircle className="size-6 text-danger" aria-hidden />
      <p>{errorMessage(error, t)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}

/** Message d'erreur sous un formulaire. */
export function FormError({ error }: { error: unknown }) {
  const { t } = useTranslation();
  if (!error) return null;
  return (
    <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
      {errorMessage(error, t)}
    </p>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center">
      {icon && <div className="text-primary">{icon}</div>}
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="max-w-md text-muted">{description}</p>}
      {actions && <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}

/** Bandeau discret hors connexion ; le web reste en lecture seule (section 12.1). */
export function OfflineBanner() {
  const { t } = useTranslation();
  const online = useNetworkStatus();
  if (online) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-warning-soft px-4 py-2 text-sm text-warning">
      <WifiOff className="size-4" aria-hidden />
      {t('offline.banner')}
    </div>
  );
}
