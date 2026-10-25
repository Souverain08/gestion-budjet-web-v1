import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FormError } from '../../../components/feedback';
import { Spinner } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { AuthField, pillClass } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { useSignIn } from '../hooks/useSignIn';
import { loginSchema, type LoginValues } from '../schemas/authSchemas';
import { authService } from '../services/authService';

export function LoginPage() {
  const { t } = useTranslation();
  const signIn = useSignIn();
  const { register, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });
  const login = useMutation({ mutationFn: authService.login, onSuccess: signIn });
  const { errors: e, touchedFields: touched } = formState;

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <form noValidate className="space-y-6" onSubmit={handleSubmit((v) => login.mutate(v))}>
        <AuthField
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          error={e.email && t(e.email.message!)}
          valid={touched.email}
          {...register('email')}
        />
        <AuthField
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          placeholder={t('auth.passwordPlaceholder')}
          error={e.password && t(e.password.message!)}
          valid={touched.password}
          {...register('password')}
        />
        <div className="text-right">
          <Link to={ROUTES.forgotPassword} className="text-sm font-medium text-primary hover:underline">
            {t('auth.forgotLink')}
          </Link>
        </div>
        <FormError error={login.error} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={pillClass('solid')} disabled={login.isPending}>
            {login.isPending && <Spinner className="size-4" />}
            {t('auth.loginAction')}
          </button>
          <Link to={ROUTES.register} className={pillClass('outline')}>
            {t('auth.registerLink')}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
