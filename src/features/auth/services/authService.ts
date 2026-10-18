import { api, unwrap, type Schemas } from '../../../services/api/apiClient';
import { setAccessToken } from '../../../services/api/session';

type User = Schemas['UserView'];

async function startSession(promise: Promise<Schemas['AuthResponseDto']>): Promise<User> {
  const body = await promise;
  setAccessToken(body.accessToken);
  return body.user;
}

export const authService = {
  login: (body: Schemas['LoginDto']) =>
    startSession(unwrap(api.POST('/v1/auth/login', { body }))),

  register: (body: Schemas['RegisterDto']) =>
    startSession(unwrap(api.POST('/v1/auth/register', { body }))),

  async logout(): Promise<void> {
    try {
      await unwrap(api.POST('/v1/auth/logout', { body: {} }));
    } finally {
      setAccessToken(null);
    }
  },

  forgotPassword: (body: Schemas['ForgotPasswordDto']) =>
    unwrap(api.POST('/v1/auth/forgot-password', { body })),

  resetPassword: (body: Schemas['ResetPasswordDto']) =>
    unwrap(api.POST('/v1/auth/reset-password', { body })),
};
