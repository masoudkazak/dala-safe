import { useId } from 'react';
import type { GpxTrack } from '../../domain/types';
import { useI18n } from '../../i18n';
import { Badge } from '../../ui';

const WIDTH = 640;
const HEIGHT = 360;
const PADDING = 36;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function RouteMap({
  track,
  title,
  description,
}: {
  track: Pick<GpxTrack, 'name' | 'points'>;
  title?: string;
  description?: string;
}) {
  const { t: translateKey } = useI18n();
  const t = (key: string, vars?: Record<string, string | number>) => translateKey(`gpx:${key}`, vars);
  const titleId = useId();
  const descriptionId = useId();

  const points = track.points.filter(
    (point) =>
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lon) &&
      Math.abs(point.lat) <= 90 &&
      Math.abs(point.lon) <= 180,
  );

  if (points.length === 0) {
    return (
      <div className="alert alert--warning" role="status">
        {t('gpx.map.empty')}
      </div>
    );
  }

  const lats = points.map((point) => point.lat);
  const lons = points.map((point) => point.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const project = (lat: number, lon: number) => {
    const x = maxLon === minLon ? WIDTH / 2 : PADDING + ((lon - minLon) / (maxLon - minLon)) * (WIDTH - PADDING * 2);
    const y =
      maxLat === minLat ? HEIGHT / 2 : HEIGHT - PADDING - ((lat - minLat) / (maxLat - minLat)) * (HEIGHT - PADDING * 2);
    return { x: round(x), y: round(y) };
  };

  const projected = points.map((point) => project(point.lat, point.lon));
  const polyline = projected.map((point) => `${point.x},${point.y}`).join(' ');
  const start = projected[0];
  const end = projected[projected.length - 1];

  const resolvedTitle = title ?? t('gpx.map.title', { name: track.name || t('gpx.untitled') });
  const resolvedDescription = description ?? t('gpx.map.desc', { count: points.length });

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          background: 'var(--color-surface-muted)',
          border: '1px solid var(--color-line)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <title id={titleId}>{resolvedTitle}</title>
        <desc id={descriptionId}>{resolvedDescription}</desc>
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--color-primary, #1f5c4a)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={start.x}
          cy={start.y}
          r={9}
          fill="var(--color-success, #246143)"
          stroke="#ffffff"
          strokeWidth={2}
        >
          <title>{t('gpx.map.start')}</title>
        </circle>
        <circle
          cx={end.x}
          cy={end.y}
          r={9}
          fill="var(--color-danger, #972f26)"
          stroke="#ffffff"
          strokeWidth={2}
        >
          <title>{t('gpx.map.end')}</title>
        </circle>
      </svg>
      <div className="cluster" style={{ marginTop: 'var(--space-2)' }}>
        <Badge tone="success">{t('gpx.map.start')}</Badge>
        <Badge tone="danger">{t('gpx.map.end')}</Badge>
      </div>
    </div>
  );
}

export const RouteVisualization = RouteMap;
