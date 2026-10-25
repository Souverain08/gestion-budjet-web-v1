import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FormError } from '../../../components/feedback';
import { Spinner } from '../../../components/ui';
import type { Locale } from '../../../constants/app.constants';
import { ROUTES } from '../../../constants/routes.constants';
import { fieldError } from '../../../utils/errors';
import { AuthField, pillClass } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { useSignIn } from '../hooks/useSignIn';
import { registerSchema, type RegisterValues } from '../schemas/authSchemas';
import { authService } from '../services/authService';

/** Inscription en moins d'une minute (US-01), puis parcours d'accueil (US-16). */
export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const signIn = useSignIn(ROUTES.onboarding);
  const { register, handleSubmit, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });
  const signup = useMutation({
    mutationFn: (values: RegisterValues) =>
      authService.register({
        ...values,
        displayName: values.displayName || undefined,
        locale: i18n.language as Locale,
      }),
    onSuccess: signIn,
  });
  const { errors: e, touchedFields: touched } = formState;

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <form noValidate className="space-y-6" onSubmit={handleSubmit((v) => signup.mutate(v))}>
        <AuthField
          label={t('auth.displayName')}
          autoComplete="given-name"
          placeholder={t('auth.namePlaceholder')}
          valid={touched.displayName}
          {...register('displayName')}
        />
        <AuthField
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          error={(e.email && t(e.email.message!)) || fieldError(signup.error, 'email')}
          valid={touched.email}
          {...register('email')}
        />
        <AuthField
          label={t('auth.password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('auth.passwordPlaceholder')}
          hint={t('validation.password')}
          error={(e.password && t(e.password.message!)) || fieldError(signup.error, 'password')}
          valid={touched.password}
          {...register('password')}
        />
        <div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-0.5 size-4 accent-[var(--primary)]" {...register('acceptTerms')} />
            <span>{t('auth.acceptTerms')}</span>
          </label>
          {e.acceptTerms && (
            <p role="alert" className="mt-1 text-sm text-danger">
              {t(e.acceptTerms.message!)}
            </p>
          )}
        </div>
        <FormError error={signup.error} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={pillClass('solid')} disabled={signup.isPending}>
            {signup.isPending && <Spinner className="size-4" />}
            {t('auth.registerAction')}
          </button>
          <Link to={ROUTES.login} className={pillClass('outline')}>
            {t('auth.loginLink')}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
