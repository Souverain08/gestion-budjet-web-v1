import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FormError } from '../../../components/feedback';
import { Button, Field, Input } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import type { Locale } from '../../../constants/app.constants';
import { fieldError } from '../../../utils/errors';
import { AuthLayout } from '../components/AuthLayout';
import { useSignIn } from '../hooks/useSignIn';
import { registerSchema, type RegisterValues } from '../schemas/authSchemas';
import { authService } from '../services/authService';

/** Inscription en moins d'une minute (US-01). */
export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const signIn = useSignIn();
  const { register, handleSubmit, formState } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const signup = useMutation({
    mutationFn: (values: RegisterValues) =>
      authService.register({
        ...values,
        displayName: values.displayName || undefined,
        locale: i18n.language as Locale,
      }),
    onSuccess: signIn,
  });
  const e = formState.errors;

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => signup.mutate(v))}>
        <Field label={t('auth.displayName')} hint={t('common.optional')}>
          {(p) => <Input {...p} autoComplete="given-name" {...register('displayName')} />}
        </Field>
        <Field label={t('auth.email')} error={(e.email && t(e.email.message!)) || fieldError(signup.error, 'email')}>
          {(p) => <Input {...p} type="email" autoComplete="email" {...register('email')} />}
        </Field>
        <Field
          label={t('auth.password')}
          hint={t('validation.password')}
          error={(e.password && t(e.password.message!)) || fieldError(signup.error, 'password')}
        >
          {(p) => <Input {...p} type="password" autoComplete="new-password" {...register('password')} />}
        </Field>
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
        <Button type="submit" className="w-full" loading={signup.isPending}>
          {t('auth.registerAction')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {t('auth.hasAccount')}{' '}
        <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
          {t('auth.loginLink')}
        </Link>
      </p>
    </AuthLayout>
  );
}
