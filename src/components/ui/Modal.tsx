import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Fenêtre modale native (<dialog>) : focus, Échap et accessibilité gérés par le navigateur. */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-0 text-text shadow-xl backdrop:bg-black/50 max-sm:mb-0 max-sm:w-full max-sm:rounded-b-none"
    >
      {open && (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            <IconButton label={t('common.close')} onClick={onClose}>
              <X className="size-5" />
            </IconButton>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
