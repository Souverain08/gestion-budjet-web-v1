import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FormError } from '../../../components/feedback';
import { Spinner } from '../../../components/ui';
import { ROUTES } from '../../../constants/routes.constants';
import { AuthField, pillClass } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas/authSchemas';
import { authService } from '../services/authService';

/** Le message est le même que le compte existe ou non (US-02). */
export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { register, handleSubmit, formState } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  });
  const request = useMutation({ mutationFn: authService.forgotPassword });

  return (
    <AuthLayout title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')}>
      {request.isSuccess ? (
        <div role="status" className="flex items-start gap-3 rounded-2xl bg-savings-soft p-4 text-savings">
          <MailCheck className="size-5 shrink-0" aria-hidden />
          <p>{t('auth.forgotSent')}</p>
        </div>
      ) : (
        <form noValidate className="space-y-6" onSubmit={handleSubmit((v) => request.mutate(v))}>
          <AuthField
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            error={formState.errors.email && t(formState.errors.email.message!)}
            valid={formState.touchedFields.email}
            {...register('email')}
          />
          <FormError error={request.error} />
          <button type="submit" className={pillClass('solid')} disabled={request.isPending}>
            {request.isPending && <Spinner className="size-4" />}
            {t('auth.forgotAction')}
          </button>
        </form>
      )}
      <Link to={ROUTES.login} className={`${pillClass('outline')} mt-6`}>
        {t('auth.backToLogin')}
      </Link>
    </AuthLayout>
  );
}
