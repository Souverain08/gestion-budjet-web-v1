import { Banknote, History, LayoutDashboard, PiggyBank, Plus, Receipt, Settings, Wallet } from 'lucide-react';
import { Link } from 'react-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import { openQuickExpense, useAppDispatch, useCurrentUser } from '../../app/store';
import { ROUTES } from '../../constants/routes.constants';
import { QuickExpenseModal } from '../../features/expenses/components/QuickExpenseModal';
import { OfflineBanner } from '../feedback';
import { Button } from '../ui';

const NAV = [
  { to: ROUTES.dashboard, key: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.budget, key: 'nav.budget', icon: Wallet },
  { to: ROUTES.tracking, key: 'nav.tracking', icon: History },
  { to: ROUTES.expenses, key: 'nav.expenses', icon: Receipt },
  { to: ROUTES.incomes, key: 'nav.incomes', icon: Banknote },
  { to: ROUTES.savings, key: 'nav.savings', icon: PiggyBank },
  { to: ROUTES.settings, key: 'nav.settings', icon: Settings },
] as const;

// Revenus et suivi s'ouvrent depuis le budget et le tableau de bord.
const MOBILE_TABS = NAV.filter((n) => n.to !== ROUTES.incomes && n.to !== ROUTES.tracking);

// Élément actif : pilule bleue pleine (modèle Pelio).
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-4 py-2.5 font-medium transition ${
    isActive ? 'bg-primary text-on-primary shadow-md shadow-primary/25' : 'text-muted hover:bg-surface-muted hover:text-text'
  }`;

/** Barre latérale sur ordinateur, barre d'onglets en bas sur téléphone. */
export function MainLayout() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useCurrentUser();
  const renderTab = ({ to, key, icon: Icon, ...rest }: (typeof NAV)[number]) => (
    <MobileTab key={to} to={to} label={t(`${key}Short`)} end={'end' in rest} icon={<Icon className="size-5" aria-hidden />} />
  );

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-surface focus:p-2">
        {t('nav.skip')}
      </a>

      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-border bg-surface px-4 py-6 md:flex">
        <Link to={ROUTES.dashboard} className="flex items-center gap-2 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 text-white">
            <Wallet className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight text-primary">{t('app.name')}</span>
        </Link>
        <nav aria-label={t('nav.label')} className="flex flex-1 flex-col gap-1.5">
          {NAV.map(({ to, key, icon: Icon, ...rest }) => (
            <NavLink key={to} to={to} className={linkClass} end={'end' in rest}>
              <Icon className="size-5" aria-hidden />
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <Link to={ROUTES.settings} className="flex items-center gap-3 rounded-2xl bg-surface-muted p-3 hover:bg-primary-soft">
          <Avatar name={user.displayName ?? user.email} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{user.displayName ?? t('nav.settings')}</span>
            <span className="block truncate text-xs text-muted">{user.email}</span>
          </span>
        </Link>
      </aside>

      <div className="flex min-w-0 flex-col pb-20 md:pb-0">
        <OfflineBanner />
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:px-8">
          <Link to={ROUTES.dashboard} className="flex items-center gap-2 md:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-500 text-white">
              <Wallet className="size-4" aria-hidden />
            </span>
            <span className="font-bold text-primary">{t('app.name')}</span>
          </Link>
          <p className="hidden text-sm text-muted md:block">
            {new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </p>
          <div className="flex items-center gap-3">
            {/* Sur téléphone, la saisie passe par le « + » de la barre du bas. */}
            <span className="hidden md:block">
              <Button size="sm" icon={<Plus className="size-4" />} onClick={() => dispatch(openQuickExpense())}>
                {t('expenses.add')}
              </Button>
            </span>
            <Link to={ROUTES.settings} className="flex items-center gap-2" aria-label={t('nav.settings')}>
              <Avatar name={user.displayName ?? user.email} />
              <span className="hidden text-left lg:block">
                <span className="block text-sm font-semibold">{t('dashboard.hello', { name: user.displayName ?? '' }).trim()}</span>
                <span className="block text-xs text-muted">{user.email}</span>
              </span>
            </Link>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>

      {/* Onglets mobiles : usages quotidiens, saisie au centre (section 8.1) ; revenus depuis le budget */}
      <nav
        aria-label={t('nav.label')}
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {MOBILE_TABS.slice(0, 3).map(renderTab)}
        <button
          type="button"
          onClick={() => dispatch(openQuickExpense())}
          className="flex items-center justify-center"
          aria-label={t('expenses.add')}
        >
          <span className="flex size-12 -translate-y-3 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg">
            <Plus className="size-6" aria-hidden />
          </span>
        </button>
        {MOBILE_TABS.slice(3).map(renderTab)}
      </nav>

      <QuickExpenseModal />
    </div>
  );
}

/** Initiales de l'utilisateur dans un rond coloré. */
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/[s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
  return (
    <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-blue-500 text-sm font-bold text-white">
      {initials}
    </span>
  );
}

function MobileTab({ to, label, icon, end }: { to: string; label: string; icon: ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-w-0 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? 'text-primary' : 'text-muted'}`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
