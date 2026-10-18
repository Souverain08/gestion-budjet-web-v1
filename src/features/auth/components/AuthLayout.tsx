import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <img src="/icons/icon.svg" alt="" className="size-10" />
          <div>
            <p className="font-semibold">{t('app.name')}</p>
            <p className="text-sm text-muted">{t('app.tagline')}</p>
          </div>
        </div>
        <Card className="p-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </Card>
      </div>
    </main>
  );
}
