import { useI18n } from '../i18n';
import { ButtonLink, PageHeader } from '../ui';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="stack">
      <PageHeader title={t('notFound.title')} lead={t('notFound.body')} />
      <div>
        <ButtonLink to="/" variant="secondary">
          {t('notFound.home')}
        </ButtonLink>
      </div>
    </div>
  );
}
