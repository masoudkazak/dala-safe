import type { ReactNode } from 'react';
import { useI18n } from '../i18n';
import { Button } from './Button';

export function EmptyState({ title, body, action }: { title: ReactNode; body: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__body">{body}</p>
      {action}
    </div>
  );
}

export function LoadingState({ label }: { label?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="state-block" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label ?? t('state.loading')}</span>
    </div>
  );
}

export function ErrorState({ title, body, onRetry }: { title?: ReactNode; body?: ReactNode; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="alert alert--danger" role="alert">
      <p>
        <strong>{title ?? t('state.error')}</strong>
      </p>
      {body ? <p>{body}</p> : null}
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('action.retry')}
        </Button>
      ) : null}
    </div>
  );
}
