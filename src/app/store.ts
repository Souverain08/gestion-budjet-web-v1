import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { Schemas } from '../services/api/apiClient';
import { currentBudgetMonth, type YearMonth } from '../utils/dates';

/**
 * Redux ne garde que la session et l'interface (section 7.1) ; les données
 * serveur vivent dans le cache de React Query.
 */

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

interface SessionState {
  status: SessionStatus;
  user: Schemas['UserView'] | null;
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: { status: 'loading', user: null } as SessionState,
  reducers: {
    signedIn(state, action: PayloadAction<Schemas['UserView']>) {
      state.status = 'authenticated';
      state.user = action.payload;
    },
    userUpdated(state, action: PayloadAction<Schemas['UserView']>) {
      state.user = action.payload;
    },
    signedOut(state) {
      state.status = 'anonymous';
      state.user = null;
    },
  },
});

interface UiState {
  /** Fenêtre de saisie rapide ouverte depuis n'importe quel écran (US-09) */
  quickExpenseOpen: boolean;
  /** Mois affiché par le tableau de bord et le budget ; null : mois en cours */
  selectedMonth: YearMonth | null;
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { quickExpenseOpen: false, selectedMonth: null } as UiState,
  reducers: {
    openQuickExpense(state) {
      state.quickExpenseOpen = true;
    },
    closeQuickExpense(state) {
      state.quickExpenseOpen = false;
    },
    monthSelected(state, action: PayloadAction<YearMonth>) {
      state.selectedMonth = action.payload;
    },
  },
});

export const { signedIn, userUpdated, signedOut } = sessionSlice.actions;
export const { openQuickExpense, closeQuickExpense, monthSelected } = uiSlice.actions;

export const store = configureStore({
  reducer: { session: sessionSlice.reducer, ui: uiSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useCurrentUser = () => {
  const user = useAppSelector((state) => state.session.user);
  if (!user) throw new Error('useCurrentUser hors d’une route protégée');
  return user;
};

/** Mois sélectionné, ou mois budgétaire en cours selon le jour de début (RG-02). */
export function useSelectedMonth(): [YearMonth, (value: YearMonth) => void] {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.ui.selectedMonth);
  const startDay = useAppSelector((state) => state.session.user?.monthStartDay ?? 1);
  return [selected ?? currentBudgetMonth(startDay), (value) => dispatch(monthSelected(value))];
}
