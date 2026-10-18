# gestion-budjet-web

Application web de gestion budgétaire (React, Vite, Tailwind, React Query, Redux Toolkit), installable en PWA.

## Prérequis

- Node.js 22
- L'API `gestion-budjet-api` lancée sur http://localhost:3333

## Installation

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

En développement, Vite redirige `/v1` vers l'API : le site et l'API ont la même origine, le cookie de session fonctionne sans configuration.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (avec service worker PWA) |
| `npm run preview` | Sert le build de production |
| `npm test` | Tests unitaires (Vitest) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification des types |
| `npm run api:types` | Régénère `src/types/api.d.ts` depuis `../gestion-budjet-api/openapi.json` |

Après une modification de l'API : `npm run openapi` dans l'API, puis `npm run api:types` ici.

## Organisation

- `src/features/*` : une fonctionnalité par dossier (pages, composants, hooks, schémas).
- `src/services/api` : client HTTP typé (openapi-fetch), renouvellement automatique de la session.
- `src/app/store.ts` : Redux pour la session et l'interface seulement ; les données serveur sont dans React Query.
- `src/i18n/locales` : textes français (référence) et anglais, mêmes clés vérifiées par TypeScript.
- `src/styles/globals.css` : jetons de design clair et sombre.

## Session

- Jeton d'accès en mémoire uniquement.
- Jeton de rafraîchissement dans un cookie `httpOnly` posé par l'API (en-tête `X-Client-Platform: web`).
- Une requête refusée en 401 déclenche un rafraîchissement, puis est rejouée une fois.

## Hors-ligne

Lecture seule (section 12.1 du cahier des charges) : le service worker garde les dernières réponses de l'API ; la saisie est désactivée sans réseau.
"# gestion-budjet-web-v1" 
