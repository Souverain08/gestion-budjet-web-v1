export const ROUTES = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/',
  budget: '/budget',
  category: (id = ':id') => `/budget/categories/${id}`,
  expenses: '/expenses',
  incomes: '/incomes',
  savings: '/savings',
  savingsAccount: (id = ':id') => `/savings/${id}`,
  settings: '/settings',
} as const;
