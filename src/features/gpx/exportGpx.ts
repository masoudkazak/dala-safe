import type { GpxPoint, GpxTrack } from '../../domain/types';

export interface GpxExportOptions {
  now?: Date;
}

export interface GpxExportResult {
  xml: string;
  filename: string;
}

function decimal(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const text = String(value);
  if (!/e/i.test(text)) return text;
  return value.toFixed(10).replace(/0+$/, '').replace(/\.$/, '');
}

function stripInvalidXmlCharacters(value: string): string {
  let result = '';
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code >= 0x20 || code === 0x09 || code === 0x0a || code === 0x0d) result += character;
  }
  return result;
}

export function escapeXml(value: string): string {
  return stripInvalidXmlCharacters(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isValidPoint(point: GpxPoint): boolean {
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lon) &&
    Math.abs(point.lat) <= 90 &&
    Math.abs(point.lon) <= 180
  );
}

export function suggestedFilename(name: string): string {
  const base = name
    .normalize('NFKC')
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 80);
  return `${base || 'route'}.gpx`;
}

export function exportGpx(track: GpxTrack, options: GpxExportOptions | Date = {}): GpxExportResult {
  const now = options instanceof Date ? options : options.now ?? new Date();
  const name = track.name ?? '';
  const escapedName = escapeXml(name);
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="Dala Safe" xmlns="http://www.topografix.com/GPX/1/1">',
    '  <metadata>',
    `    <name>${escapedName}</name>`,
    `    <time>${escapeXml(now.toISOString())}</time>`,
    '  </metadata>',
    '  <trk>',
    `    <name>${escapedName}</name>`,
    '    <trkseg>',
  ];

  for (const point of track.points) {
    if (!isValidPoint(point)) continue;
    lines.push(`      <trkpt lat="${decimal(point.lat)}" lon="${decimal(point.lon)}">`);
    if (typeof point.ele === 'number' && Number.isFinite(point.ele)) {
      lines.push(`        <ele>${decimal(point.ele)}</ele>`);
    }
    if (point.time) {
      lines.push(`        <time>${escapeXml(point.time)}</time>`);
    }
    lines.push('      </trkpt>');
  }

  lines.push('    </trkseg>', '  </trk>', '</gpx>', '');

  return {
    xml: lines.join('\n'),
    filename: suggestedFilename(name),
  };
}
