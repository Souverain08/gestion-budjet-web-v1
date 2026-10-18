import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signedOut, useAppDispatch, useCurrentUser, userUpdated } from '../../../app/store';
import { FormError } from '../../../components/feedback';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button, Card, CardTitle, Field, Input, Select } from '../../../components/ui';
import { CURRENCIES, SUPPORTED_LOCALES } from '../../../constants/app.constants';
import { api, unwrap, type Schemas } from '../../../services/api/apiClient';
import { authService } from '../../auth/services/authService';

type Theme = Schemas['UserView']['theme'];
const THEMES: { value: Theme; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
];

function useUpdateMe() {
  const dispatch = useAppDispatch();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: Schemas['UpdateMeDto']) => unwrap(api.PATCH('/v1/me', { body })),
    onSuccess: (user) => {
      dispatch(userUpdated(user));
      // Le jour de début change les périodes affichées.
      void client.invalidateQueries();
    },
  });
}

export function SettingsPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const dispatch = useAppDispatch();
  const client = useQueryClient();
  const update = useUpdateMe();
  const [displayName, setDisplayName] = useState(user.displayName ?? '');
  const logout = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      client.clear();
      dispatch(signedOut());
    },
  });

  return (
    <>
      <PageHeader title={t('nav.settings')} />
      <div className="space-y-6">
        <Card>
          <CardTitle>{t('settings.profile')}</CardTitle>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate({ displayName });
            }}
          >
            <Field label={t('auth.displayName')}>
              {(p) => <Input {...p} maxLength={80} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />}
            </Field>
            <Field label={t('auth.email')}>{(p) => <Input {...p} value={user.email} disabled />}</Field>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm" loading={update.isPending && update.variables?.displayName !== undefined}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardTitle>{t('settings.budget')}</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('settings.currency')} hint={t('settings.currencyHint')}>
              {(p) => (
                <Select {...p} value={user.currency} onChange={(e) => update.mutate({ currency: e.target.value })}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t('settings.monthStartDay')} hint={t('settings.monthStartDayHint')}>
              {(p) => (
                <Select {...p} value={user.monthStartDay} onChange={(e) => update.mutate({ monthStartDay: Number(e.target.value) })}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        </Card>

        <Card>
          <CardTitle>{t('settings.display')}</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('settings.language')}>
              {(p) => (
                <Select {...p} value={user.locale} onChange={(e) => update.mutate({ locale: e.target.value as 'fr' | 'en' })}>
                  {SUPPORTED_LOCALES.map((l) => (
                    <option key={l} value={l}>
                      {t(`settings.languages.${l}`)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">{t('settings.theme')}</legend>
              <div role="radiogroup" className="grid grid-cols-3 gap-2">
                {THEMES.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={user.theme === value}
                    onClick={() => update.mutate({ theme: value })}
                    className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm ${
                      user.theme === value ? 'border-primary bg-primary-soft text-primary' : 'border-border hover:bg-surface-muted'
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                    {t(`settings.themes.${value}`)}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </Card>

        <FormError error={update.error} />

        <Button variant="secondary" icon={<LogOut className="size-4" />} loading={logout.isPending} onClick={() => logout.mutate()}>
          {t('settings.logout')}
        </Button>
      </div>
    </>
  );
}
