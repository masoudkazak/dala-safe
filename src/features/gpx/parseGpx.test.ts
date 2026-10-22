import { describe, expect, it } from 'vitest';
import type { GpxTrack } from '../../domain/types';
import { MAX_GPX_BYTES, parseGpx, type ParseGpxResult } from './parseGpx';

const GPX_OPEN = '<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">';

function gpx(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>${GPX_OPEN}${body}</gpx>`;
}

function point(lat: string, lon: string, extra = ''): string {
  return `<trkpt lat="${lat}" lon="${lon}">${extra}</trkpt>`;
}

function expectTrack(result: ParseGpxResult): GpxTrack {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(`Expected successful parse, got ${result.code}`);
  return result.track;
}

function expectError(result: ParseGpxResult): string {
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error('Expected parse failure');
  return result.code;
}

describe('parseGpx', () => {
  it('parses a single track with elevation, time, summary and source', () => {
    const xml = gpx(
      `<metadata><name>Metadata name</name></metadata>
       <trk><name>Ridge &amp; Lake</name><trkseg>
         ${point('43.0000', '76.0000', '<ele>1000</ele><time>2026-01-01T00:00:00Z</time>')}
         ${point('43.0010', '76.0000', '<ele>1012</ele><time>2026-01-01T00:10:00Z</time>')}
       </trkseg></trk>`,
    );

    const track = expectTrack(
      parseGpx(xml, { now: new Date('2026-01-02T03:04:05.000Z'), id: 'track-1' }),
    );

    expect(track.id).toBe('track-1');
    expect(track.name).toBe('Ridge & Lake');
    expect(track.source).toBe('imported');
    expect(track.importedAt).toBe('2026-01-02T03:04:05.000Z');
    expect(track.points).toHaveLength(2);
    expect(track.points[0]).toEqual({
      lat: 43,
      lon: 76,
      ele: 1000,
      time: '2026-01-01T00:00:00Z',
    });
    expect(track.summary.pointCount).toBe(2);
    expect(track.summary.ascentMeters).toBe(12);
    expect(track.summary.distanceMeters).toBeGreaterThan(110);
    expect(track.summary.distanceMeters).toBeLessThan(112);
    expect(track.warnings).toEqual([]);
  });

  it('flattens multiple tracks and segments in document order', () => {
    const xml = gpx(
      `<trk><name>First</name>
         <trkseg>${point('43.0', '76.0')}${point('43.1', '76.1')}</trkseg>
         <trkseg>${point('43.2', '76.2')}</trkseg>
       </trk>
       <trk><name>Second</name>
         <trkseg>${point('43.3', '76.3')}</trkseg>
       </trk>`,
    );

    const track = expectTrack(parseGpx(xml));

    expect(track.name).toBe('First');
    expect(track.points.map((item) => item.lat)).toEqual([43, 43.1, 43.2, 43.3]);
    expect(track.summary.pointCount).toBe(4);
    expect(track.warnings).toContain('gpx.warning.multipleSegments');
  });

  it('computes haversine distance within tolerance', () => {
    const xml = gpx(
      `<trk><name>Equator</name><trkseg>
         ${point('0', '0')}
         ${point('0', '1')}
       </trkseg></trk>`,
    );

    const track = expectTrack(parseGpx(xml));
    expect(Math.abs((track.summary.distanceMeters ?? 0) - 111_195)).toBeLessThan(50);
  });

  it('sums only positive elevation changes', () => {
    const xml = gpx(
      `<trk><name>Hills</name><trkseg>
         ${point('43', '76', '<ele>1000</ele>')}
         ${point('43.01', '76', '<ele>990</ele>')}
         ${point('43.02', '76', '<ele>1010</ele>')}
       </trkseg></trk>`,
    );

    const track = expectTrack(parseGpx(xml));
    expect(track.summary.ascentMeters).toBe(20);
  });

  it('returns null ascent when elevation is missing from any point', () => {
    const xml = gpx(
      `<trk><name>Partial elevation</name><trkseg>
         ${point('43', '76', '<ele>1000</ele>')}
         ${point('43.01', '76')}
       </trkseg></trk>`,
    );

    const track = expectTrack(parseGpx(xml));
    expect(track.summary.ascentMeters).toBeNull();
    expect(track.warnings).toContain('gpx.warning.elevationUnavailable');
  });

  it('ignores invalid elevation and time values without inventing data', () => {
    const xml = gpx(
      `<trk><name>Bad metadata</name><trkseg>
         ${point('43', '76', '<ele>not-a-number</ele><time>not-a-time</time>')}
         ${point('43.01', '76', '<ele>1020</ele><time>2026-01-01T00:00:00Z</time>')}
       </trkseg></trk>`,
    );

    const track = expectTrack(parseGpx(xml));
    expect(track.points[0].ele).toBeUndefined();
    expect(track.points[0].time).toBeUndefined();
    expect(track.summary.ascentMeters).toBeNull();
    expect(track.warnings).toContain('gpx.warning.invalidElevationIgnored');
    expect(track.warnings).toContain('gpx.warning.invalidTimeIgnored');
  });

  it('rejects a non-gpx root element', () => {
    const result = parseGpx('<?xml version="1.0"?><route><trk/></route>');
    expect(expectError(result)).toBe('not-gpx');
  });

  it('rejects malformed XML and empty input', () => {
    expect(expectError(parseGpx('<gpx><trk>'))).toBe('malformed');
    expect(expectError(parseGpx('   '))).toBe('malformed');
  });

  it('rejects files over the byte limit', () => {
    const xml = gpx(`<trk><trkseg>${point('43', '76')}</trkseg></trk>`);
    expect(xml.length).toBeLessThan(MAX_GPX_BYTES);
    expect(expectError(parseGpx(xml, { maxBytes: 10 }))).toBe('too-large');
  });

  it('rejects a GPX file with no points', () => {
    expect(expectError(parseGpx(gpx('<trk><name>Empty</name><trkseg></trkseg></trk>')))).toBe('no-points');
    expect(expectError(parseGpx(gpx('')))).toBe('no-points');
  });

  it('rejects missing or out-of-range coordinates', () => {
    expect(expectError(parseGpx(gpx(`<trk><trkseg>${point('91', '76')}</trkseg></trk>`)))).toBe(
      'invalid-coordinates',
    );
    expect(expectError(parseGpx(gpx(`<trk><trkseg>${point('43', '181')}</trkseg></trk>`)))).toBe(
      'invalid-coordinates',
    );
    expect(expectError(parseGpx(gpx('<trk><trkseg><trkpt lon="76"/></trkseg></trk>')))).toBe(
      'invalid-coordinates',
    );
    expect(expectError(parseGpx(gpx(`<trk><trkseg>${point('north', '76')}</trkseg></trk>`)))).toBe(
      'invalid-coordinates',
    );
  });
});
