/**
 * Préférences légères du navigateur (langue, thème avant connexion).
 * Le stockage peut être indisponible (navigation privée) : on ignore l'erreur.
 */
export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* stockage indisponible */
    }
  },
};
