import { useI18n } from '../i18n';
import { Card, PageHeader, ButtonLink } from '../ui';

export function SettingsPage() {
  const { t, language } = useI18n();

  return (
    <div className="stack">
      <PageHeader eyebrow={t('app.name')} title={t('settings.title')} lead={t('settings.language.description')} />

      <Card title={t('language.label')}>
        <p className="card__body" style={{ marginBottom: 0 }}>
          <strong lang={language}>{t(`language.${language}Native`)}</strong>
        </p>
        <p className="small muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
          {t('settings.translation.body')}
        </p>
      </Card>

      <Card title={t('settings.data.title')}>
        <p className="card__body">{t('settings.data.description')}</p>
        <div className="cluster" style={{ marginTop: '1rem' }}>
          <ButtonLink to="/settings/data" variant="secondary">
            {t('settings.data.manage')}
          </ButtonLink>
        </div>
      </Card>

      <Card title={t('settings.pwa.title')}>
        <p className="card__body">{t('settings.pwa.body')}</p>
      </Card>

      <Card title={t('settings.about.title')}>
        <p className="card__body">{t('settings.about.body')}</p>
        <p className="small muted" style={{ marginBottom: 0 }}>
          {t('home.limits.body')}
        </p>
      </Card>
    </div>
  );
}
