import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { openQuickExpense, useAppDispatch, useCurrentUser, userUpdated } from '../../../app/store';
import { ProgressBar } from '../../../components/charts/ProgressBar';
import { FormError } from '../../../components/feedback';
import { AmountInput, Button, Card, Field, Input, Money, Select, Skeleton } from '../../../components/ui';
import { CURRENCIES } from '../../../constants/app.constants';
import { ROUTES } from '../../../constants/routes.constants';
import { api, unwrap } from '../../../services/api/apiClient';
import { currentBudgetMonth } from '../../../utils/dates';
import { parseAmountToCents } from '../../../utils/money';
import { CategoryIcon } from '../../budgets/components/CategoryIcon';
import { InlineAmount } from '../../budgets/components/InlineAmount';
import {
  useBudgetForMonth,
  useCreateBudget,
  useUpdateBudget,
  useUpdateCategory,
  type Budget,
} from '../../budgets/hooks/useBudget';
import { useCreateIncome } from '../../incomes/hooks/useIncomes';

const STEPS = 5;
/** Part des revenus proposée pour l'épargne à l'étape 3. */
const SUGGESTED_SAVINGS_RATE = 0.1;

/**
 * Premier budget actif en moins de 5 minutes (US-16) : 5 étapes au plus,
 * chacune peut être passée.
 */
export function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useCurrentUser();
  const [step, setStep] = useState(1);
  // Le mois dépend du jour de début choisi à l'étape 1.
  const month = currentBudgetMonth(user.monthStartDay);
  const budget = useBudgetForMonth(month);

  const next = () => setStep((s) => Math.min(STEPS, s + 1));
  const finish = (withExpense: boolean) => {
    navigate(ROUTES.dashboard, { replace: true });
    if (withExpense) dispatch(openQuickExpense());
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/icons/icon.svg" alt="" className="size-8" />
          <span className="font-semibold">{t('app.name')}</span>
        </div>
        <button type="button" className="text-sm text-muted hover:text-text" onClick={() => finish(false)}>
          {t('onboarding.skipAll')}
        </button>
      </div>

      <ol aria-label={t('onboarding.progress', { step, total: STEPS })} className="mb-6 grid grid-cols-5 gap-2">
        {Array.from({ length: STEPS }, (_, i) => (
          <li
            key={i}
            aria-current={i + 1 === step ? 'step' : undefined}
            className={`h-1.5 rounded-full ${i + 1 <= step ? 'bg-primary' : 'bg-surface-muted'}`}
          />
        ))}
      </ol>
      <p className="mb-2 text-sm text-muted">{t('onboarding.progress', { step, total: STEPS })}</p>

      {step === 1 && <PreferencesStep onNext={next} />}
      {step > 1 && budget.isLoading && <Skeleton className="h-64" />}
      {step === 2 && !budget.isLoading && <IncomeStep budget={budget.data ?? null} month={month} onNext={next} />}
      {step === 3 && budget.data && <SavingsStep budget={budget.data} onNext={next} />}
      {step === 4 && budget.data && <AllocationStep budget={budget.data} onNext={next} />}
      {step === 5 && budget.data && <ActivationStep budget={budget.data} onFinish={finish} />}
      {step > 2 && !budget.isLoading && !budget.data && (
        <StepCard title={t('onboarding.noBudget')} onSkip={() => setStep(2)} skipLabel={t('common.back')}>
          <></>
        </StepCard>
      )}
    </main>
  );
}

function StepCard({
  title,
  text,
  children,
  onSkip,
  skipLabel,
}: {
  title: string;
  text?: string;
  children: ReactNode;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {text && <p className="mt-1 text-muted">{text}</p>}
      <div className="mt-6 space-y-4">{children}</div>
      {onSkip && (
        <button type="button" onClick={onSkip} className="mt-4 w-full text-center text-sm text-muted hover:text-text">
          {skipLabel ?? t('onboarding.skipStep')}
        </button>
      )}
    </Card>
  );
}

/** Étape 1 : devise et jour de début du mois. */
function PreferencesStep({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const dispatch = useAppDispatch();
  const [currency, setCurrency] = useState(user.currency);
  const [startDay, setStartDay] = useState(user.monthStartDay);
  const save = useMutation({
    mutationFn: () => unwrap(api.PATCH('/v1/me', { body: { currency, monthStartDay: startDay } })),
    onSuccess: (updated) => {
      dispatch(userUpdated(updated));
      onNext();
    },
  });

  return (
    <StepCard title={t('onboarding.preferencesTitle')} text={t('onboarding.preferencesText')} onSkip={onNext}>
      <Field label={t('settings.currency')}>
        {(p) => (
          <Select {...p} value={currency} onChange={(e) => setCurrency(e.target.value)}>
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
          <Select {...p} value={startDay} onChange={(e) => setStartDay(Number(e.target.value))}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <FormError error={save.error} />
      <Button className="w-full" loading={save.isPending} onClick={() => save.mutate()}>
        {t('onboarding.continue')}
      </Button>
    </StepCard>
  );
}

/** Étape 2 : revenus du mois. Crée le budget du mois s'il n'existe pas. */
function IncomeStep({
  budget,
  month,
  onNext,
}: {
  budget: Budget | null;
  month: { year: number; month: number };
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const user = useCurrentUser();
  const createBudget = useCreateBudget();
  const createIncome = useCreateIncome();
  const [label, setLabel] = useState(t('onboarding.salary'));
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string>();
  const pending = createBudget.isPending || createIncome.isPending;

  const ensureBudget = async () => budget ?? (await createBudget.mutateAsync({ ...month, withDefaultCategories: true }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(amount);
    if (!amountCents) return setError(t('validation.amount'));
    setError(undefined);
    try {
      const target = await ensureBudget();
      await createIncome.mutateAsync({ budgetId: target.id, label: label.trim() || t('onboarding.salary'), amountCents, status: 'expected', isRecurring: true });
      onNext();
    } catch {
      /* erreur affichée par FormError */
    }
  };

  return (
    <StepCard
      title={t('onboarding.incomeTitle')}
      text={t('onboarding.incomeText')}
      onSkip={async () => {
        await ensureBudget().catch(() => undefined);
        onNext();
      }}
    >
      {budget && budget.incomeCents > 0 && (
        <p className="rounded-xl bg-primary-soft px-3 py-2 text-sm text-primary">
          {t('onboarding.incomeAlready')} <Money cents={budget.incomeCents} currency={budget.currency} />
        </p>
      )}
      <form noValidate onSubmit={submit} className="space-y-4">
        <Field label={t('incomes.label')}>
          {(p) => <Input {...p} maxLength={80} value={label} onChange={(e) => setLabel(e.target.value)} />}
        </Field>
        <Field label={t('expenses.amount')} error={error}>
          {(p) => <AmountInput {...p} autoFocus currency={budget?.currency ?? user.currency} value={amount} onChange={(e) => setAmount(e.target.value)} />}
        </Field>
        <FormError error={createBudget.error ?? createIncome.error} />
        <Button type="submit" className="w-full" loading={pending}>
          {t('onboarding.continue')}
        </Button>
      </form>
    </StepCard>
  );
}

/** Étape 3 : objectif d'épargne, prélevé en premier (RG-05), avec un montant suggéré. */
function SavingsStep({ budget, onNext }: { budget: Budget; onNext: () => void }) {
  const { t } = useTranslation();
  const update = useUpdateBudget();
  // Arrondi à l'unité monétaire : 10 % des revenus.
  const suggested = Math.round((budget.incomeCents * SUGGESTED_SAVINGS_RATE) / 100) * 100;
  const [cents, setCents] = useState(budget.savingsTargetCents || suggested);

  return (
    <StepCard title={t('onboarding.savingsTitle')} text={t('onboarding.savingsText')} onSkip={onNext}>
      {suggested > 0 && (
        <button
          type="button"
          onClick={() => setCents(suggested)}
          className="w-full rounded-xl border border-savings/40 bg-savings-soft px-3 py-2 text-left text-sm text-savings"
        >
          {t('onboarding.savingsSuggested')} <Money cents={suggested} currency={budget.currency} className="font-semibold" />
        </button>
      )}
      <InlineAmount cents={cents} currency={budget.currency} label={t('budget.savingsTarget')} onSave={setCents} />
      <FormError error={update.error} />
      <Button
        variant="savings"
        className="w-full"
        loading={update.isPending}
        onClick={() => update.mutate({ id: budget.id, savingsTargetCents: cents }, { onSuccess: onNext })}
      >
        {t('onboarding.continue')}
      </Button>
    </StepCard>
  );
}

/** Étape 4 : répartition guidée du reste entre les catégories prédéfinies. */
function AllocationStep({ budget, onNext }: { budget: Budget; onNext: () => void }) {
  const { t } = useTranslation();
  const update = useUpdateCategory();
  const left = budget.leftToAllocateCents;
  const available = budget.incomeCents - budget.savingsTargetCents;

  return (
    <StepCard title={t('onboarding.allocationTitle')} text={t('onboarding.allocationText')} onSkip={onNext}>
      <div className="rounded-xl bg-surface-muted p-3">
        <p className="text-sm text-muted">{t('budget.leftToAllocate')}</p>
        <p aria-live="polite" className={`text-xl font-semibold ${left < 0 ? 'text-danger' : left === 0 ? 'text-savings' : 'text-primary'}`}>
          <Money cents={left} currency={budget.currency} />
        </p>
        <div className="mt-2">
          <ProgressBar value={budget.plannedCents} max={Math.max(available, 0)} label={t('budget.leftToAllocate')} />
        </div>
      </div>
      <ul className="space-y-2">
        {budget.categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3">
            <CategoryIcon name={c.icon} color={c.color} />
            <span className="flex-1 truncate">{c.name}</span>
            <div className="w-36">
              <InlineAmount
                cents={c.plannedCents}
                currency={budget.currency}
                label={t('budget.plannedFor', { name: c.name })}
                onSave={(plannedCents) => update.mutate({ id: c.id, plannedCents })}
              />
            </div>
          </li>
        ))}
      </ul>
      <FormError error={update.error} />
      <Button className="w-full" onClick={onNext}>
        {t('onboarding.continue')}
      </Button>
    </StepCard>
  );
}

/** Étape 5 : activation (RG-04) puis première dépense. */
function ActivationStep({ budget, onFinish }: { budget: Budget; onFinish: (withExpense: boolean) => void }) {
  const { t } = useTranslation();
  const update = useUpdateBudget();
  const active = budget.status === 'active';
  const left = budget.leftToAllocateCents;

  return (
    <StepCard title={t('onboarding.activationTitle')} text={t('onboarding.activationText')}>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <dt className="text-muted">{t('dashboard.income')}</dt>
        <dd className="text-right"><Money cents={budget.incomeCents} currency={budget.currency} /></dd>
        <dt className="text-muted">{t('budget.savingsFirst')}</dt>
        <dd className="text-right text-savings"><Money cents={budget.savingsTargetCents} currency={budget.currency} /></dd>
        <dt className="text-muted">{t('budget.planned')}</dt>
        <dd className="text-right"><Money cents={budget.plannedCents} currency={budget.currency} /></dd>
        <dt className="font-medium">{t('budget.leftToAllocate')}</dt>
        <dd className={`text-right font-medium ${left < 0 ? 'text-danger' : ''}`}><Money cents={left} currency={budget.currency} /></dd>
      </dl>

      {active ? (
        <p className="flex items-center gap-2 rounded-xl bg-savings-soft px-3 py-2 text-savings">
          <Check className="size-5" aria-hidden />
          {t('onboarding.activated')}
        </p>
      ) : (
        <>
          {left < 0 && <p className="text-sm text-danger">{t('budget.negativeHint')}</p>}
          <FormError error={update.error} />
          <Button className="w-full" disabled={left < 0} loading={update.isPending} onClick={() => update.mutate({ id: budget.id, status: 'active' })}>
            {t('budget.activate')}
          </Button>
        </>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant={active ? 'primary' : 'secondary'} onClick={() => onFinish(true)}>
          {t('onboarding.firstExpense')}
        </Button>
        <Button variant="ghost" onClick={() => onFinish(false)}>
          {t('onboarding.goToDashboard')}
        </Button>
      </div>
    </StepCard>
  );
}
