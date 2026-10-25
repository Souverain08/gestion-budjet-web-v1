import { Check } from 'lucide-react';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Affiche la coche quand la saisie est correcte */
  valid?: boolean;
}

/** Champ souligné des écrans de connexion, avec une coche une fois valide. */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, error, hint, valid, className = '', ...props },
  ref,
) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`h-11 w-full border-0 border-b-2 border-border bg-transparent pr-8 text-text placeholder:text-muted/70 focus:border-primary focus:outline-none aria-[invalid=true]:border-danger ${className}`}
          {...props}
        />
        {valid && !error && <Check className="absolute top-1/2 right-1 size-5 -translate-y-1/2 text-primary" aria-hidden />}
      </div>
      <Message id={id} error={error} hint={hint} />
    </div>
  );
});

function Message({ id, error, hint }: { id: string; error?: string; hint?: ReactNode }) {
  if (error) {
    return (
      <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-danger">
        {error}
      </p>
    );
  }
  return hint ? (
    <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
      {hint}
    </p>
  ) : null;
}

/** Bouton arrondi en pilule : plein (action principale) ou contour (alternative). */
export function pillClass(variant: 'solid' | 'outline' = 'solid'): string {
  const base =
    'inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-full px-6 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
  return variant === 'solid'
    ? `${base} bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md hover:shadow-lg`
    : `${base} border-2 border-border text-muted hover:border-primary hover:text-primary`;
}
