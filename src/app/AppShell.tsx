import { NavLink, Outlet, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { SUPPORTED_LANGUAGES, type Language } from '../domain/types';
import { useServiceWorkerUpdate } from './useServiceWorkerUpdate';
import { useOnlineStatus } from './useOnlineStatus';
import { CompassIcon, EmergencyIcon, HomeIcon, SettingsIcon, TripsIcon } from '../ui/Icons';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home', labelShortKey: 'nav.homeShort', icon: HomeIcon, end: true },
  { to: '/trips', labelKey: 'nav.trips', labelShortKey: 'nav.tripsShort', icon: TripsIcon, end: false },
  { to: '/emergency', labelKey: 'nav.emergency', labelShortKey: 'nav.emergencyShort', icon: EmergencyIcon, end: false },
  { to: '/future', labelKey: 'nav.future', labelShortKey: 'nav.futureShort', icon: CompassIcon, end: false },
  { to: '/settings', labelKey: 'nav.settings', labelShortKey: 'nav.settingsShort', icon: SettingsIcon, end: false },
];

export function AppShell() {
  const { t, language, setLanguage } = useI18n();
  const online = useOnlineStatus();
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t('action.continue')}
      </a>
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/" className="brand" aria-label={t('app.name')}>
            <span className="brand__mark" aria-hidden="true">
              D
            </span>
            <span>{t('app.name')}</span>
          </Link>
          <nav className="desktop-nav" aria-label={t('nav.home')}>
            {NAV_ITEMS.map(({ to, labelKey, end }) => (
              <NavLink key={to} to={to} end={end}>
                {t(labelKey)}
              </NavLink>
            ))}
          </nav>
          <div className="lang-switcher" role="group" aria-label={t('language.label')}>
            {SUPPORTED_LANGUAGES.map((code: Language) => (
              <button
                key={code}
                type="button"
                className={code === language ? 'lang-btn lang-btn--active' : 'lang-btn'}
                aria-pressed={code === language}
                aria-label={t(`language.${code}Native`)}
                onClick={() => setLanguage(code)}
                lang={code}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {!online ? (
          <div className="offline-banner" role="status">
            <span className="offline-banner__dot" aria-hidden="true" />
            {t('state.offline')} — {t('home.card.offline.body')}
          </div>
        ) : null}
        {updateAvailable ? (
          <div className="offline-banner" role="status">
            <span>{t('settings.pwa.updateAvailable')}</span>
            <button type="button" className="button button--secondary button--sm" onClick={applyUpdate}>
              {t('action.continue')}
            </button>
          </div>
        ) : null}
      </header>

      <main id="main-content" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="app-footer">
        <span>{t('footer.tagline')}</span>
        <Link to="/status">{t('footer.status')}</Link>
      </footer>

      <nav className="mobile-nav" aria-label={t('nav.home')}>
        {NAV_ITEMS.map(({ to, labelShortKey, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon />
            <span>{t(labelShortKey)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
