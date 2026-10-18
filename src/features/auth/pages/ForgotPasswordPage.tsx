import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FormError } from '../../../components/feedback';
import { Button, Field, Input } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { AuthLayout } from '../components/AuthLayout';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas/authSchemas';
import { authService } from '../services/authService';

/** Le message est le même que le compte existe ou non (US-02). */
export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { register, handleSubmit, formState } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const request = useMutation({ mutationFn: authService.forgotPassword });

  return (
    <AuthLayout title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')}>
      {request.isSuccess ? (
        <div role="status" className="flex items-start gap-3 rounded-xl bg-savings-soft p-4 text-savings">
          <MailCheck className="size-5 shrink-0" aria-hidden />
          <p>{t('auth.forgotSent')}</p>
        </div>
      ) : (
        <form noValidate className="space-y-4" onSubmit={handleSubmit((v) => request.mutate(v))}>
          <Field label={t('auth.email')} error={formState.errors.email && t(formState.errors.email.message!)}>
            {(p) => <Input {...p} type="email" autoComplete="email" {...register('email')} />}
          </Field>
          <FormError error={request.error} />
          <Button type="submit" className="w-full" loading={request.isPending}>
            {t('auth.forgotAction')}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </AuthLayout>
  );
}
