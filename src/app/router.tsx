import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { MainLayout } from '../components/layout/MainLayout';
import { Loader } from '../components/ui';
import { ROUTES } from '../constants/routes.constants';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { BudgetPage } from '../features/budgets/pages/BudgetPage';
import { CategoryDetailPage } from '../features/budgets/pages/CategoryDetailPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { OnboardingPage } from '../features/onboarding/pages/OnboardingPage';
import { ExpensesPage } from '../features/expenses/pages/ExpensesPage';
import { IncomesPage } from '../features/incomes/pages/IncomesPage';
import { SavingsAccountPage } from '../features/savings/pages/SavingsAccountPage';
import { SavingsPage } from '../features/savings/pages/SavingsPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { TrackingPage } from '../features/tracking/pages/TrackingPage';
import { useAppSelector } from './store';

function RequireAuth() {
  const status = useAppSelector((s) => s.session.status);
  if (status === 'loading') return <Loader />;
  return status === 'authenticated' ? <Outlet /> : <Navigate to={ROUTES.login} replace />;
}

function PublicOnly() {
  const status = useAppSelector((s) => s.session.status);
  if (status === 'loading') return <Loader />;
  return status === 'anonymous' ? <Outlet /> : <Navigate to={ROUTES.dashboard} replace />;
}

export const router = createBrowserRouter([
  {
    element: <PublicOnly />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },
  // Accessible connecté ou non : on l'ouvre depuis un email.
  { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: ROUTES.onboarding, element: <OnboardingPage /> },
      {
        element: <MainLayout />,
        children: [
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.budget, element: <BudgetPage /> },
          { path: ROUTES.category(), element: <CategoryDetailPage /> },
          { path: ROUTES.tracking, element: <TrackingPage /> },
          { path: ROUTES.expenses, element: <ExpensesPage /> },
          { path: ROUTES.incomes, element: <IncomesPage /> },
          { path: ROUTES.savings, element: <SavingsPage /> },
          { path: ROUTES.savingsAccount(), element: <SavingsAccountPage /> },
          { path: ROUTES.settings, element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.dashboard} replace /> },
]);
