#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../src/locales/', import.meta.url).pathname;
const languages = ['en', 'kk', 'ru'];
const namespaces = readdirSync(join(root, 'en')).filter((file) => file.endsWith('.json'));
let failures = 0;

function keysOf(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' ? keysOf(value, path) : [path];
  });
}

for (const namespace of namespaces) {
  const base = JSON.parse(readFileSync(join(root, 'en', namespace), 'utf8'));
  const baseKeys = new Set(keysOf(base));
  for (const language of languages.slice(1)) {
    const file = join(root, language, namespace);
    let translated;
    try {
      translated = JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      console.error(`MISSING FILE ${file}`);
      failures += 1;
      continue;
    }
    const translatedKeys = new Set(keysOf(translated));
    const missing = [...baseKeys].filter((key) => !translatedKeys.has(key));
    const extra = [...translatedKeys].filter((key) => !baseKeys.has(key));
    if (missing.length) {
      failures += missing.length;
      console.error(`[${language}/${namespace}] missing ${missing.length} key(s): ${missing.slice(0, 8).join(', ')}`);
    }
    if (extra.length) {
      failures += extra.length;
      console.error(`[${language}/${namespace}] extra ${extra.length} key(s): ${extra.slice(0, 8).join(', ')}`);
    }
    for (const key of translatedKeys) {
      const value = translated[key];
      if (typeof value === 'string' && value.trim() === '') {
        failures += 1;
        console.error(`[${language}/${namespace}] empty translation: ${key}`);
      }
    }
  }
}

if (failures > 0) {
  console.error(`i18n check failed with ${failures} issue(s).`);
  process.exit(1);
}
console.log(`i18n check passed: ${languages.length} languages × ${namespaces.length} namespaces.`);
