import { useEffect, useSyncExternalStore } from 'react';
import { useAppSelector } from '../app/store';
import { STORAGE_KEYS } from '../constants/app.constants';
import { storage } from '../services/storage/storageService';

export type ThemePreference = 'system' | 'light' | 'dark';

const media = () => window.matchMedia('(prefers-color-scheme: dark)');

function subscribe(callback: () => void) {
  const query = media();
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

/** Applique le thème choisi (clair, sombre ou automatique, US-23) sur <html>. */
export function useApplyTheme() {
  const userTheme = useAppSelector((s) => s.session.user?.theme);
  const systemDark = useSyncExternalStore(subscribe, () => media().matches, () => false);
  const preference = (userTheme ?? storage.get(STORAGE_KEYS.theme) ?? 'system') as ThemePreference;
  const dark = preference === 'dark' || (preference === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    if (userTheme) storage.set(STORAGE_KEYS.theme, userTheme);
  }, [dark, userTheme]);
}
