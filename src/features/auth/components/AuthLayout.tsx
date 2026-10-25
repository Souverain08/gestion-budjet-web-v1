import { Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Connexion en deux panneaux : à gauche le bleu de la marque, séparé du
 * formulaire par une vague ; sur téléphone, le bleu passe en haut.
 */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-muted p-0 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden bg-surface shadow-2xl sm:rounded-3xl md:grid-cols-[1fr_1.1fr]">
        {/* Panneau de marque */}
        <section className="relative flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 px-8 pt-10 pb-16 text-center text-white md:py-16">
          <p className="text-lg font-medium tracking-wide">{t('auth.welcomeTo')}</p>
          <span className="flex size-24 items-center justify-center rounded-full bg-white shadow-lg">
            <Wallet className="size-11 text-blue-700" aria-hidden />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">{t('app.name')}</h1>
          <p className="max-w-xs text-sm leading-relaxed text-blue-50">{t('auth.brandText')}</p>
          <Wave />
        </section>

        {/* Formulaire */}
        <section className="relative z-10 flex flex-col justify-center px-6 py-8 sm:px-12 md:py-14">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

/** Vague de séparation : verticale sur ordinateur, horizontale sur téléphone. */
function Wave() {
  return (
    <>
      <svg
        aria-hidden
        viewBox="0 0 120 800"
        preserveAspectRatio="none"
        className="absolute inset-y-0 -right-px hidden h-full w-24 md:block"
      >
        <path
          d="M120 0 H70 C40 60 95 120 60 190 C30 250 90 310 55 380 C25 440 85 500 50 570 C20 630 80 700 55 800 H120 Z"
          fill="var(--surface)"
          opacity="0.35"
        />
        <path
          d="M120 0 H90 C60 70 110 130 80 200 C55 260 105 320 78 390 C52 450 100 520 75 590 C50 650 100 720 85 800 H120 Z"
          fill="var(--surface)"
        />
      </svg>
      <svg aria-hidden viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-px h-12 w-full md:hidden">
        <path d="M0 60 V30 C60 0 110 50 170 25 C230 0 280 45 340 20 C370 8 390 15 400 22 V60 Z" fill="var(--surface)" />
      </svg>
    </>
  );
}
