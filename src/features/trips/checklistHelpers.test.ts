import { describe, expect, it } from 'vitest';
import { createChecklistItems } from '../../domain/trip';
import { addCustomItem, removeItem, resetProgress, toggleItem } from './checklistHelpers';

describe('checklist helpers', () => {
  it('adds a custom item with the same text in all languages', () => {
    const items = createChecklistItems();
    const next = addCustomItem(items, '  Tell the group about the meeting point  ', 'custom-1');
    expect(next).toHaveLength(items.length + 1);
    const added = next[next.length - 1];
    expect(added).toMatchObject({
      id: 'custom-1',
      templateId: 'custom',
      required: false,
      done: false,
      custom: true,
    });
    expect(added.label).toEqual({
      kk: 'Tell the group about the meeting point',
      ru: 'Tell the group about the meeting point',
      en: 'Tell the group about the meeting point',
    });
  });

  it('ignores empty custom text', () => {
    const items = createChecklistItems();
    expect(addCustomItem(items, '   ')).toBe(items);
  });

  it('toggles a single item by id and leaves others untouched', () => {
    const items = createChecklistItems();
    const target = items[2];
    const next = toggleItem(items, target.id);
    expect(next.find((item) => item.id === target.id)?.done).toBe(true);
    expect(next.filter((item) => item.done)).toHaveLength(1);
    expect(toggleItem(next, target.id).find((item) => item.id === target.id)?.done).toBe(false);
  });

  it('removes only the targeted custom item', () => {
    const items = addCustomItem(createChecklistItems(), 'Extra item', 'custom-1');
    const customId = items[items.length - 1].id;
    const next = removeItem(items, customId);
    expect(next).toHaveLength(items.length - 1);
    expect(next.some((item) => item.id === customId)).toBe(false);
  });

  it('resets done flags but keeps items and custom entries', () => {
    let items = createChecklistItems();
    items = toggleItem(items, items[0].id);
    items = toggleItem(items, items[1].id);
    items = addCustomItem(items, 'Custom done', 'custom-1');
    items = toggleItem(items, 'custom-1');
    const next = resetProgress(items);
    expect(next).toHaveLength(items.length);
    expect(next.every((item) => !item.done)).toBe(true);
    expect(next.some((item) => item.custom)).toBe(true);
  });
});
