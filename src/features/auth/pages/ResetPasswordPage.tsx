import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { FormError } from '../../../components/feedback';
import { Button, Field, Input } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
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
  });
  const reset = useMutation({
    mutationFn: (v: ResetPasswordValues) => authService.resetPassword({ token, password: v.password }),
  });
  const e = formState.errors;

  return (
    <AuthLayout title={t('auth.resetTitle')}>
      {reset.isSuccess ? (
        <div className="space-y-4">
          <div role="status" className="flex items-start gap-3 rounded-xl bg-savings-soft p-4 text-savings">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
            <p>{t('auth.resetDone')}</p>
          </div>
          <Link to={ROUTES.login} className="block text-center font-medium text-primary hover:underline">
            {t('auth.loginAction')}
          </Link>
        </div>
      ) : (
        <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => reset.mutate(v))}>
          <Field label={t('auth.newPassword')} hint={t('validation.password')} error={e.password && t(e.password.message!)}>
            {(p) => <Input {...p} type="password" autoComplete="new-password" {...register('password')} />}
          </Field>
          <Field label={t('auth.confirmPassword')} error={e.confirm && t(e.confirm.message!)}>
            {(p) => <Input {...p} type="password" autoComplete="new-password" {...register('confirm')} />}
          </Field>
          <FormError error={reset.error} />
          <Button type="submit" className="w-full" loading={reset.isPending} disabled={!token}>
            {t('auth.resetAction')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
