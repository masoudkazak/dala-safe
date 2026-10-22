import { describe, expect, it } from 'vitest';
import type { GpxPoint, GpxTrack } from '../../domain/types';
import { exportGpx } from './exportGpx';
import { computeDistanceMeters, parseGpx } from './parseGpx';

function makeTrack(overrides: Partial<GpxTrack> = {}): GpxTrack {
  return {
    id: 'track-1',
    name: 'Ridge & <Valley> "East"',
    source: 'imported',
    points: [
      { lat: 43.1, lon: 76.2, ele: 1200, time: '2026-01-01T08:00:00Z' },
      { lat: 43.2, lon: 76.3, ele: 1260 },
    ],
    summary: { pointCount: 2, distanceMeters: 12_000, ascentMeters: 60 },
    importedAt: '2026-01-01T07:00:00Z',
    warnings: [],
    ...overrides,
  };
}

const NOW = new Date('2026-02-03T04:05:06.000Z');

describe('exportGpx', () => {
  it('creates GPX 1.1 XML with metadata, escaped names and point data', () => {
    const { xml, filename } = exportGpx(makeTrack(), { now: NOW });

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<gpx version="1.1"');
    expect(xml).toContain('xmlns="http://www.topografix.com/GPX/1/1"');
    expect(xml).toContain('<name>Ridge &amp; &lt;Valley&gt; &quot;East&quot;</name>');
    expect(xml).toContain('<time>2026-02-03T04:05:06.000Z</time>');
    expect(xml).toContain('<trkpt lat="43.1" lon="76.2">');
    expect(xml).toContain('<ele>1200</ele>');
    expect(xml).toContain('<time>2026-01-01T08:00:00Z</time>');
    expect(xml).toContain('<trkpt lat="43.2" lon="76.3">');
    expect(xml).toContain('<ele>1260</ele>');
    expect(xml).not.toContain('<ele>undefined</ele>');
    expect(filename).toBe('Ridge-Valley-East.gpx');
  });

  it('is deterministic when now is injected', () => {
    const first = exportGpx(makeTrack(), { now: NOW });
    const second = exportGpx(makeTrack(), { now: NOW });
    const later = exportGpx(makeTrack(), { now: new Date('2027-01-01T00:00:00.000Z') });

    expect(first.xml).toBe(second.xml);
    expect(first.filename).toBe(second.filename);
    expect(first.xml).not.toBe(later.xml);
  });

  it('round-trips points, name and summary through parse and export', () => {
    const originalPoints: GpxPoint[] = [
      { lat: 43.1234567, lon: 76.7654321, ele: 1200.5, time: '2026-01-01T08:00:00Z' },
      { lat: 43.1287654, lon: 76.7712345, ele: 1235.25, time: '2026-01-01T08:30:00Z' },
    ];
    const original = makeTrack({
      name: 'Ridge Loop',
      points: originalPoints,
      summary: {
        pointCount: originalPoints.length,
        distanceMeters: computeDistanceMeters(originalPoints),
        ascentMeters: 34.75,
      },
    });

    const exported = exportGpx(original, { now: NOW });
    const parsed = parseGpx(exported.xml, { now: NOW, id: 'round-trip' });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.track.name).toBe(original.name);
    expect(parsed.track.source).toBe('imported');
    expect(parsed.track.points).toEqual(original.points);
    expect(parsed.track.summary.pointCount).toBe(original.points.length);
    expect(parsed.track.summary.ascentMeters).toBeCloseTo(34.75, 5);
    expect(parsed.track.summary.distanceMeters).toBeCloseTo(original.summary.distanceMeters ?? 0, 5);
  });
});
