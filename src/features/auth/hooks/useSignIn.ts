import { useNavigate } from 'react-router';
import { signedIn, useAppDispatch } from '../../../app/store';
import { ROUTES } from '../../../constants/routes.constants';
import type { Schemas } from '../../../services/api/apiClient';

/** Enregistre l'utilisateur connecté puis ouvre le tableau de bord. */
export function useSignIn() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return (user: Schemas['UserView']) => {
    dispatch(signedIn(user));
    navigate(ROUTES.dashboard, { replace: true });
  };
}
