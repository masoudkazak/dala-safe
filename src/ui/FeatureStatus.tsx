import { useI18n } from '../i18n';
import type { FeatureState } from '../domain/types';
import { Badge, type BadgeTone } from './Badge';

const STATE_TONE: Record<FeatureState, BadgeTone> = {
  available: 'success',
  demo: 'info',
  planned: 'neutral',
  'requires-integration': 'warning',
  'needs-verification': 'accent',
};

const STATE_KEY: Record<FeatureState, string> = {
  available: 'featureStatus.available',
  demo: 'featureStatus.demo',
  planned: 'featureStatus.planned',
  'requires-integration': 'featureStatus.requires-integration',
  'needs-verification': 'featureStatus.needs-verification',
};

const DESCRIPTION_KEY: Record<FeatureState, string> = {
  available: 'featureStatus.available.description',
  demo: 'featureStatus.demo.description',
  planned: 'featureStatus.planned.description',
  'requires-integration': 'featureStatus.requires-integration.description',
  'needs-verification': 'featureStatus.needs-verification.description',
};

export function FeatureStatus({
  state,
  note,
  showDescription = false,
}: {
  state: FeatureState;
  note?: string;
  showDescription?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="feature-status">
      <Badge tone={STATE_TONE[state]}>{t(STATE_KEY[state])}</Badge>
      {showDescription ? <span className="feature-status__note">{t(DESCRIPTION_KEY[state])}</span> : null}
      {note ? <span className="feature-status__note">{note}</span> : null}
    </div>
  );
}
