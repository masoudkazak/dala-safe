import type { GpxPoint, GpxTrack, TrackSummary } from '../../domain/types';

export const MAX_GPX_BYTES = 5 * 1024 * 1024;

export type GpxParseErrorCode =
  | 'too-large'
  | 'malformed'
  | 'not-gpx'
  | 'no-points'
  | 'invalid-coordinates';

export type ParseGpxResult =
  | { ok: true; track: GpxTrack }
  | { ok: false; code: GpxParseErrorCode };

export interface ParseGpxOptions {
  now?: Date;
  id?: string;
  maxBytes?: number;
}

export const GPX_ERROR_KEYS: Record<GpxParseErrorCode, string> = {
  'too-large': 'gpx.error.tooLarge',
  malformed: 'gpx.error.malformed',
  'not-gpx': 'gpx.error.notGpx',
  'no-points': 'gpx.error.noPoints',
  'invalid-coordinates': 'gpx.error.invalidCoordinates',
};

export const WARNING_KEYS = {
  multipleSegments: 'gpx.warning.multipleSegments',
  elevationUnavailable: 'gpx.warning.elevationUnavailable',
  invalidElevationIgnored: 'gpx.warning.invalidElevationIgnored',
  invalidTimeIgnored: 'gpx.warning.invalidTimeIgnored',
} as const;

const EARTH_RADIUS_METERS = 6_371_008.8;

function byteLength(text: string): number {
  if (typeof TextEncoder === 'undefined') return text.length;
  return new TextEncoder().encode(text).byteLength;
}

function localNameOf(element: Element): string {
  return (element.localName ?? element.nodeName).toLowerCase();
}

function descendantsByLocalName(parent: Element, name: string): Element[] {
  const wanted = name.toLowerCase();
  return Array.from(parent.getElementsByTagName('*')).filter((element) => localNameOf(element) === wanted);
}

function directChildrenByLocalName(parent: Element, name: string): Element[] {
  const wanted = name.toLowerCase();
  return Array.from(parent.children).filter((element) => localNameOf(element) === wanted);
}

function firstText(element: Element | undefined): string {
  return element?.textContent?.trim() ?? '';
}

function parseCoordinate(raw: string | null, limit: number): number | null {
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || Math.abs(value) > limit) return null;
  return value;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceMeters(a: GpxPoint, b: GpxPoint): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLon = toRadians(b.lon - a.lon);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);
  const value = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const clamped = Math.min(1, Math.max(0, value));
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(clamped), Math.sqrt(1 - clamped));
}

export function computeDistanceMeters(points: GpxPoint[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += haversineDistanceMeters(points[index - 1], points[index]);
  }
  return total;
}

export function computeAscentMeters(points: GpxPoint[]): number | null {
  if (points.length === 0) return null;
  if (points.some((point) => typeof point.ele !== 'number' || !Number.isFinite(point.ele))) return null;
  let ascent = 0;
  for (let index = 1; index < points.length; index += 1) {
    const delta = (points[index].ele as number) - (points[index - 1].ele as number);
    if (delta > 0) ascent += delta;
  }
  return ascent;
}

function buildSummary(points: GpxPoint[]): TrackSummary {
  return {
    pointCount: points.length,
    distanceMeters: computeDistanceMeters(points),
    ascentMeters: computeAscentMeters(points),
  };
}

export function parseGpx(xml: string, options: ParseGpxOptions | Date = {}): ParseGpxResult {
  const resolvedOptions: ParseGpxOptions = options instanceof Date ? { now: options } : options;
  const maxBytes = resolvedOptions.maxBytes ?? MAX_GPX_BYTES;
  if (byteLength(xml) > maxBytes) return { ok: false, code: 'too-large' };

  const source = xml.trim();
  if (source === '') return { ok: false, code: 'malformed' };

  let document: Document;
  try {
    document = new DOMParser().parseFromString(source, 'application/xml');
  } catch {
    return { ok: false, code: 'malformed' };
  }

  const root = document.documentElement;
  if (!root || localNameOf(root) === 'parsererror') return { ok: false, code: 'malformed' };
  if (descendantsByLocalName(root, 'parsererror').length > 0) return { ok: false, code: 'malformed' };
  if (localNameOf(root) !== 'gpx') return { ok: false, code: 'not-gpx' };

  const warnings: string[] = [];
  const addWarning = (key: string) => {
    if (!warnings.includes(key)) warnings.push(key);
  };

  const tracks = descendantsByLocalName(root, 'trk');
  const metadata = directChildrenByLocalName(root, 'metadata')[0];
  const metadataName = firstText(directChildrenByLocalName(metadata ?? root, 'name')[0]);

  let trackName = '';
  const points: GpxPoint[] = [];
  let segmentCount = 0;

  for (const track of tracks) {
    if (trackName === '') {
      const nameElement = directChildrenByLocalName(track, 'name')[0];
      trackName = firstText(nameElement);
    }

    const segments = directChildrenByLocalName(track, 'trkseg');
    segmentCount += segments.length;

    for (const segment of segments) {
      for (const pointElement of directChildrenByLocalName(segment, 'trkpt')) {
        const lat = parseCoordinate(pointElement.getAttribute('lat'), 90);
        const lon = parseCoordinate(pointElement.getAttribute('lon'), 180);
        if (lat === null || lon === null) return { ok: false, code: 'invalid-coordinates' };

        const point: GpxPoint = { lat, lon };

        const eleElement = directChildrenByLocalName(pointElement, 'ele')[0];
        if (eleElement) {
          const rawElevation = firstText(eleElement);
          const elevation = Number(rawElevation);
          if (rawElevation === '' || !Number.isFinite(elevation)) {
            addWarning(WARNING_KEYS.invalidElevationIgnored);
          } else {
            point.ele = elevation;
          }
        }

        const timeElement = directChildrenByLocalName(pointElement, 'time')[0];
        if (timeElement) {
          const rawTime = firstText(timeElement);
          if (rawTime === '' || Number.isNaN(Date.parse(rawTime))) {
            addWarning(WARNING_KEYS.invalidTimeIgnored);
          } else {
            point.time = rawTime;
          }
        }

        points.push(point);
      }
    }
  }

  if (points.length === 0) return { ok: false, code: 'no-points' };
  if (tracks.length > 1 || segmentCount > 1) addWarning(WARNING_KEYS.multipleSegments);

  const summary = buildSummary(points);
  if (summary.ascentMeters === null) addWarning(WARNING_KEYS.elevationUnavailable);

  const now = resolvedOptions.now ?? new Date();
  const id = resolvedOptions.id ?? `gpx-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    ok: true,
    track: {
      id,
      name: trackName || metadataName,
      source: 'imported',
      points,
      summary,
      importedAt: now.toISOString(),
      warnings,
    },
  };
}
