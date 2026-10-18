import { useTranslation } from 'react-i18next';

export function Spinner({ className = 'size-6' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

export function Loader() {
  const { t } = useTranslation();
  return (
    <div role="status" className="flex justify-center p-8 text-primary">
      <Spinner />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}

/** Squelette affiché à la place des listes pendant le chargement (section 6.4). */
export function Skeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-surface-muted ${className}`} />;
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  const { t } = useTranslation();
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">{t('common.loading')}</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
