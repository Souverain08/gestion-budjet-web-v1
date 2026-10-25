import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { FormError } from '../../../components/feedback';
import { Spinner } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { AuthField, pillClass } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas/authSchemas';
import { authService } from '../services/authService';

/** Ouverte depuis le lien reçu par email (/reset-password?token=…). */
export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { register, handleSubmit, formState } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  });
  const reset = useMutation({
    mutationFn: (v: ResetPasswordValues) => authService.resetPassword({ token, password: v.password }),
  });
  const { errors: e, touchedFields: touched } = formState;

  return (
    <AuthLayout title={t('auth.resetTitle')}>
      {reset.isSuccess ? (
        <div className="space-y-6">
          <div role="status" className="flex items-start gap-3 rounded-2xl bg-savings-soft p-4 text-savings">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
            <p>{t('auth.resetDone')}</p>
          </div>
          <Link to={ROUTES.login} className={pillClass('solid')}>
            {t('auth.loginAction')}
          </Link>
        </div>
      ) : (
        <form noValidate className="space-y-6" onSubmit={handleSubmit((v) => reset.mutate(v))}>
          <AuthField
            label={t('auth.newPassword')}
            type="password"
            autoComplete="new-password"
            hint={t('validation.password')}
            error={e.password && t(e.password.message!)}
            valid={touched.password}
            {...register('password')}
          />
          <AuthField
            label={t('auth.confirmPassword')}
            type="password"
            autoComplete="new-password"
            error={e.confirm && t(e.confirm.message!)}
            valid={touched.confirm}
            {...register('confirm')}
          />
          <FormError error={reset.error} />
          <button type="submit" className={pillClass('solid')} disabled={reset.isPending || !token}>
            {reset.isPending && <Spinner className="size-4" />}
            {t('auth.resetAction')}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
