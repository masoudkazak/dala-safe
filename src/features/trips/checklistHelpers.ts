import type { ChecklistItem, LocalizedText } from '../../domain/types';
import { createId } from '../../domain/trip';

export function addCustomItem(items: ChecklistItem[], text: string, id: string = createId()): ChecklistItem[] {
  const trimmed = text.trim();
  if (!trimmed) return items;
  const label: LocalizedText = { kk: trimmed, ru: trimmed, en: trimmed };
  return [...items, { id, templateId: 'custom', label, required: false, done: false, custom: true }];
}

export function toggleItem(items: ChecklistItem[], id: string): ChecklistItem[] {
  return items.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
}

export function removeItem(items: ChecklistItem[], id: string): ChecklistItem[] {
  return items.filter((item) => item.id !== id);
}

export function resetProgress(items: ChecklistItem[]): ChecklistItem[] {
  return items.map((item) => (item.done ? { ...item, done: false } : item));
}
