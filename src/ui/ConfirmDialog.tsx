import { useEffect, useId, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  tone = 'danger',
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: ReactNode;
  body: ReactNode;
  confirmLabel?: ReactNode;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const bodyId = useId();
  const dialogRef = { current: null as HTMLDivElement | null };

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('modal-open');
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <div ref={(node) => { dialogRef.current = node; }} className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId}>
        <h2 className="dialog__title" id={titleId}>
          {title}
        </h2>
        <div className="dialog__body" id={bodyId}>
          {body}
          {children}
        </div>
        <div className="dialog__actions">
          <Button variant="secondary" onClick={onCancel}>
            {t('action.cancel')}
          </Button>
          <Button variant={tone} onClick={onConfirm}>
            {confirmLabel ?? t('action.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
