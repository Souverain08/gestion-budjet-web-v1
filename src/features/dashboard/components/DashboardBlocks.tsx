import { ArrowRight, Banknote, History, PiggyBank, Plus, Receipt, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { openQuickExpense, useAppDispatch } from '../../../app/store';
import { Card, CardTitle, Money, SkeletonList } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { formatDate } from '../../../utils/dates';
import { CategoryIcon } from '../../budgets/components/CategoryIcon';
import type { Category } from '../../budgets/hooks/useBudget';
import { useExpenses } from '../../expenses/hooks/useExpenses';
import { Amounts, describe } from '../../tracking/components/ActivityPanel';
import { useActivity } from '../../tracking/hooks/useTracking';

// ─── Bandeau d'accueil ──────────────────────────────────────────────────

export interface HeroTile {
  label: string;
  cents: number;
  hint?: string;
  icon: LucideIcon;
}

/** Bandeau en dégradé bleu, chiffres du mois sur des tuiles translucides. */
export function HeroBanner({
  title,
  subtitle,
  aside,
  tiles,
  currency,
}: {
  title: string;
  subtitle: string;
  aside: ReactNode;
  tiles: HeroTile[];
  currency: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-6 text-white shadow-xl md:p-8">
      {/* Cercles décoratifs */}
      <span aria-hidden className="absolute -top-16 -right-10 size-56 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-white/5" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
          <p className="mt-1 text-blue-100">{subtitle}</p>
        </div>
        {aside}
      </div>
      <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ label, cents, hint, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:p-4">
            <div className="flex items-center gap-2 text-sm text-blue-50">
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/15">
                <Icon className="size-4" aria-hidden />
              </span>
              {label}
            </div>
            <Money cents={cents} currency={currency} className="mt-3 block text-lg font-bold sm:text-2xl" />
            {hint && <p className="mt-1 text-xs text-blue-100">{hint}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Cartes colorées ────────────────────────────────────────────────────

/** Dégradés assez foncés pour un texte blanc lisible (contraste AA). */
const TONES = {
  green: 'from-emerald-600 to-emerald-800',
  blue: 'from-blue-600 to-blue-800',
  amber: 'from-amber-700 to-orange-800',
  red: 'from-rose-600 to-red-800',
} as const;

export function ColorCard({
  tone,
  icon: Icon,
  label,
  value,
  footer,
  progress,
}: {
  tone: keyof typeof TONES;
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  footer?: string;
  /** Entre 0 et 1 */
  progress?: number;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${TONES[tone]} p-4 text-white shadow-lg sm:p-5`}>
      <span aria-hidden className="absolute -right-6 -bottom-8 size-28 rounded-full bg-white/10" />
      <span className="flex size-10 items-center justify-center rounded-xl bg-white/20">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-lg font-bold sm:text-2xl">{value}</p>
      <p className="text-sm text-white/90">{label}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25" aria-hidden>
          <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} />
        </div>
      )}
      {footer && <p className="mt-2 text-xs text-white/85">{footer}</p>}
    </div>
  );
}

// ─── Dernières dépenses ─────────────────────────────────────────────────

export function RecentExpenses({ from, to, categories }: { from: string; to: string; categories: Category[] }) {
  const { t, i18n } = useTranslation();
  const expenses = useExpenses({ from, to }, 5);
  const items = expenses.data?.pages[0]?.items ?? [];
  const byId = new Map(categories.map((c) => [c.id, c]));

  return (
    <Card className="p-5">
      <CardTitle action={<SeeAll to={ROUTES.expenses} />}>{t('dashboard.latestExpenses')}</CardTitle>
      {expenses.isLoading ? (
        <SkeletonList rows={4} />
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-muted">{t('dashboard.noExpenses')}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((e) => {
            const category = e.categoryId ? byId.get(e.categoryId) : undefined;
            return (
              <li key={e.id} className="flex items-center gap-3 py-3">
                <CategoryIcon name={category?.icon ?? (e.categoryId ? 'tag' : 'circle-help')} color={category?.color ?? null} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{e.note || category?.name || t('budget.unplanned')}</p>
                  <p className="text-xs text-muted">
                    {category?.name ?? t('budget.unplanned')} · {formatDate(e.spentOn, i18n.language)}
                  </p>
                </div>
                <Money cents={-e.amountCents} currency={e.currency} signed className="font-semibold" />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

// ─── Activité récente (historique de traçabilité) ───────────────────────

export function RecentActivity({ budgetId, currency }: { budgetId: string; currency: string }) {
  const { t, i18n } = useTranslation();
  const activity = useActivity(budgetId);
  const items = activity.data?.pages[0]?.items.slice(0, 5) ?? [];
  const when = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="p-5">
      <CardTitle action={<SeeAll to={ROUTES.tracking} />}>{t('dashboard.recentActivity')}</CardTitle>
      {activity.isLoading ? (
        <SkeletonList rows={4} />
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-muted">{t('tracking.noActivity')}</p>
      ) : (
        <ol className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <History className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{describe(item, t)}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                  <time dateTime={String(item.occurredAt)}>{when.format(new Date(item.occurredAt))}</time>
                  <Amounts item={item} currency={item.currency ?? currency} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

// ─── Actions rapides ────────────────────────────────────────────────────

export function QuickActions() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const tile = 'flex flex-col items-start gap-3 rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg';

  return (
    <Card className="p-5">
      <CardTitle>{t('dashboard.quickActions')}</CardTitle>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => dispatch(openQuickExpense())} className={`${tile} from-blue-600 to-blue-800`}>
          <Plus className="size-5" aria-hidden />
          <span className="text-sm font-semibold">{t('expenses.add')}</span>
        </button>
        <Link to={ROUTES.incomes} className={`${tile} from-emerald-600 to-emerald-800`}>
          <Banknote className="size-5" aria-hidden />
          <span className="text-sm font-semibold">{t('incomes.add')}</span>
        </Link>
        <Link to={ROUTES.savings} className={`${tile} from-amber-700 to-orange-800`}>
          <PiggyBank className="size-5" aria-hidden />
          <span className="text-sm font-semibold">{t('savings.deposit')}</span>
        </Link>
        <Link to={ROUTES.tracking} className={`${tile} from-violet-600 to-purple-800`}>
          <Receipt className="size-5" aria-hidden />
          <span className="text-sm font-semibold">{t('nav.tracking')}</span>
        </Link>
      </div>
    </Card>
  );
}

function SeeAll({ to }: { to: string }) {
  const { t } = useTranslation();
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
      {t('dashboard.seeAll')}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}
