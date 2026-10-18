import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FormError } from '../../../components/feedback';
import { Button, Field, Input } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { AuthLayout } from '../components/AuthLayout';
import { useSignIn } from '../hooks/useSignIn';
import { loginSchema, type LoginValues } from '../schemas/authSchemas';
import { authService } from '../services/authService';

export function LoginPage() {
  const { t } = useTranslation();
  const signIn = useSignIn();
  const { register, handleSubmit, formState } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const login = useMutation({ mutationFn: authService.login, onSuccess: signIn });
  const e = formState.errors;

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => login.mutate(v))}>
        <Field label={t('auth.email')} error={e.email && t(e.email.message!)}>
          {(p) => <Input {...p} type="email" autoComplete="email" {...register('email')} />}
        </Field>
        <Field label={t('auth.password')} error={e.password && t(e.password.message!)}>
          {(p) => <Input {...p} type="password" autoComplete="current-password" {...register('password')} />}
        </Field>
        <div className="text-right">
          <Link to={ROUTES.forgotPassword} className="text-sm text-primary hover:underline">
            {t('auth.forgotLink')}
          </Link>
        </div>
        <FormError error={login.error} />
        <Button type="submit" className="w-full" loading={login.isPending}>
          {t('auth.loginAction')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {t('auth.noAccount')}{' '}
        <Link to={ROUTES.register} className="font-medium text-primary hover:underline">
          {t('auth.registerLink')}
        </Link>
      </p>
    </AuthLayout>
  );
}
