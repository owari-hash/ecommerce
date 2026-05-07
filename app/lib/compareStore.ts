'use client';

export type CompareItem = { id: string; title: string; slug?: string };

const STORAGE_KEY = 'turbotech.compare.items.v1';
const MAX_ITEMS = 4;

export function readCompare(): CompareItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.id === 'string' && typeof x.title === 'string')
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function writeCompare(items: CompareItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    window.dispatchEvent(new Event('compare:changed'));
  } catch {
    // ignore
  }
}

export function toggleCompare(item: CompareItem) {
  const items = readCompare();
  const exists = items.some((x) => x.id === item.id);
  const next = exists ? items.filter((x) => x.id !== item.id) : [item, ...items].slice(0, MAX_ITEMS);
  writeCompare(next);
  return next;
}

