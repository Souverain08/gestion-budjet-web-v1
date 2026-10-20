import { useNavigate } from 'react-router';
import { signedIn, useAppDispatch } from '../../../app/store';
import { ROUTES } from '../../../constants/routes.constants';
import type { Schemas } from '../../../services/api/apiClient';

/**
 * Enregistre l'utilisateur connecté puis ouvre le tableau de bord, ou le
 * parcours d'accueil après une inscription (US-16).
 */
export function useSignIn(destination: string = ROUTES.dashboard) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return (user: Schemas['UserView']) => {
    dispatch(signedIn(user));
    navigate(destination, { replace: true });
  };
}
