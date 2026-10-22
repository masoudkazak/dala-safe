import { describe, expect, it } from 'vitest';
import { GUIDANCE_CATALOG, getGuidanceById, parseGuidanceCatalog } from './catalog';

describe('guidance catalog', () => {
  it('loads a versioned catalog with unique rule ids', () => {
    expect(GUIDANCE_CATALOG.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(GUIDANCE_CATALOG.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(GUIDANCE_CATALOG.rules.length).toBeGreaterThanOrEqual(8);

    const ids = GUIDANCE_CATALOG.rules.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('looks up a rule by id', () => {
    const rule = getGuidanceById('long-duration');
    expect(rule?.severity).toBe('caution');
    expect(getGuidanceById('does-not-exist')).toBeUndefined();
  });

  it('rejects a malformed rule', () => {
    const rule = GUIDANCE_CATALOG.rules[0];
    expect(() =>
      parseGuidanceCatalog({
        ...GUIDANCE_CATALOG,
        rules: [{ ...rule, source: {} }],
      }),
    ).toThrow(/malformed/);
  });

  it('rejects duplicate rule ids', () => {
    const rule = GUIDANCE_CATALOG.rules[0];
    expect(() =>
      parseGuidanceCatalog({
        ...GUIDANCE_CATALOG,
        rules: [rule, rule],
      }),
    ).toThrow(/duplicate/);
  });

  it('rejects a catalog without rules or metadata', () => {
    expect(() => parseGuidanceCatalog({ ...GUIDANCE_CATALOG, rules: [] })).toThrow(/at least one rule/);
    expect(() => parseGuidanceCatalog({ ...GUIDANCE_CATALOG, lastReviewed: 'not-a-date' })).toThrow(/ISO date/);
  });
});
