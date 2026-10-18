import { LayoutDashboard, PiggyBank, Plus, Receipt, Settings, Wallet, Banknote } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import { openQuickExpense, useAppDispatch } from '../../app/store';
import { ROUTES } from '../../constants/routes.constants';
import { QuickExpenseModal } from '../../features/expenses/components/QuickExpenseModal';
import { OfflineBanner } from '../feedback';
import { Button } from '../ui';

const NAV = [
  { to: ROUTES.dashboard, key: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.budget, key: 'nav.budget', icon: Wallet },
  { to: ROUTES.expenses, key: 'nav.expenses', icon: Receipt },
  { to: ROUTES.incomes, key: 'nav.incomes', icon: Banknote },
  { to: ROUTES.savings, key: 'nav.savings', icon: PiggyBank },
  { to: ROUTES.settings, key: 'nav.settings', icon: Settings },
] as const;

const MOBILE_TABS = NAV.filter((n) => n.to !== ROUTES.incomes);

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition ${
    isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface-muted hover:text-text'
  }`;

/** Barre latérale sur ordinateur, barre d'onglets en bas sur téléphone. */
export function MainLayout() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const renderTab = ({ to, key, icon: Icon, ...rest }: (typeof NAV)[number]) => (
    <MobileTab key={to} to={to} label={t(`${key}Short`)} end={'end' in rest} icon={<Icon className="size-5" aria-hidden />} />
  );

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-surface focus:p-2">
        {t('nav.skip')}
      </a>

      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-border bg-surface p-4 md:flex">
        <div className="flex items-center gap-2 px-2">
          <img src="/icons/icon.svg" alt="" className="size-8" />
          <span className="font-semibold">{t('app.name')}</span>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => dispatch(openQuickExpense())}>
          {t('expenses.add')}
        </Button>
        <nav aria-label={t('nav.label')} className="flex flex-col gap-1">
          {NAV.map(({ to, key, icon: Icon, ...rest }) => (
            <NavLink key={to} to={to} className={linkClass} end={'end' in rest}>
              <Icon className="size-5" aria-hidden />
              {t(key)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col pb-20 md:pb-0">
        <OfflineBanner />
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8">
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
