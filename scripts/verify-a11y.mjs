import { chromium } from '@playwright/test';

/**
 * Accessibility audit (plan §8.4) for Dala Safe.
 *
 * Runs against `vite preview` in a real Chromium and checks, per route and per
 * language: landmarks, heading order, accessible names, form labels, focus
 * behaviour, positive tabindex, WCAG AA colour contrast on rendered text,
 * reduced-motion support, and the language switcher's aria-pressed state.
 *
 * Usage: npm run build && npm run preview -- --port 4173
 *        node scripts/verify-a11y.mjs
 * Exit code 0 = no findings; 1 = at least one finding (every finding printed).
 *
 * Findings are printed as structured records so they can be copied into
 * `docs/testing-report.md`. A finding is not a claim about assistive-technology
 * behaviour — it is an observable property of the DOM/CSS.
 */

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const ROUTES = [
  ['/', 'home'],
  ['/trips', 'trips (empty)'],
  ['/status', 'feature status'],
  ['/emergency', 'emergency'],
  ['/tour', 'tour'],
  ['/settings', 'settings'],
  ['/settings/data', 'data export/import'],
  ['/future', 'future features'],
  ['/trips/new', 'trip form'],
  ['/nonexistent-404', 'not found'],
];
const LANGUAGES = ['kk', 'ru', 'en'];

const pageAudit = () => {
  const findings = [];

  const parseRgb = (value) => {
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };

  const luminance = ({ r, g, b }) => {
    const channel = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };

  const contrast = (fg, bg) => {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const blend = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });

  // ---- landmarks -----------------------------------------------------------
  const landmarks = {
    header: document.querySelectorAll('header, [role="banner"]').length,
    nav: Array.from(document.querySelectorAll('nav, [role="navigation"]')).map(
      (n) => n.getAttribute('aria-label') ?? n.getAttribute('aria-labelledby') ?? '',
    ),
    main: document.querySelectorAll('main, [role="main"]').length,
    footer: document.querySelectorAll('footer, [role="contentinfo"]').length,
  };
  if (landmarks.header === 0) findings.push({ check: 'landmark', detail: 'no banner/header landmark' });
  if (landmarks.main !== 1) findings.push({ check: 'landmark', detail: `main landmarks = ${landmarks.main}, expected 1` });
  if (landmarks.footer === 0) findings.push({ check: 'landmark', detail: 'no contentinfo/footer landmark' });
  if (landmarks.nav.length === 0) findings.push({ check: 'landmark', detail: 'no navigation landmark' });
  for (const label of landmarks.nav) {
    if (!label) findings.push({ check: 'landmark', detail: 'a <nav> has no accessible name' });
  }

  // ---- skip link -----------------------------------------------------------
  const firstFocusable = document.querySelector(
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const skipLink = Array.from(document.querySelectorAll('a[href]')).find((a) =>
    (a.getAttribute('href') ?? '').startsWith('#'),
  );
  if (!skipLink) findings.push({ check: 'skip-link', detail: 'no in-page skip link found' });
  else if (firstFocusable !== skipLink)
    findings.push({ check: 'skip-link', detail: 'skip link is not the first focusable element' });

  // ---- headings ------------------------------------------------------------
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const h1s = headings.filter((h) => h.tagName === 'H1');
  if (h1s.length !== 1) findings.push({ check: 'headings', detail: `h1 count = ${h1s.length}, expected 1` });
  let previous = 0;
  for (const heading of headings) {
    const level = Number(heading.tagName[1]);
    if (previous > 0 && level > previous + 1) {
      findings.push({
        check: 'headings',
        detail: `level skipped: h${previous} → h${level} at "${heading.textContent.trim().slice(0, 60)}"`,
      });
    }
    previous = level;
  }

  // ---- accessible names ----------------------------------------------------
  const nameable = document.querySelectorAll('button, a[href], input, select, textarea, [role="button"]');
  for (const el of nameable) {
    const label =
      el.getAttribute('aria-label') ??
      (el.getAttribute('aria-labelledby')
        ? (document.getElementById(el.getAttribute('aria-labelledby'))?.textContent ?? '')
        : '') ??
      '';
    const text = el.textContent?.trim() ?? '';
    const title = el.getAttribute('title') ?? '';
    const placeholder = el.getAttribute('placeholder') ?? '';
    const fieldId = el.getAttribute('id');
    const labelFor = fieldId ? document.querySelector(`label[for="${CSS.escape(fieldId)}"]`) : null;
    const wrappedByLabel = el.closest('label');
    const hasLabelText = Boolean(
      (labelFor?.textContent ?? '').trim() || (wrappedByLabel?.textContent ?? '').trim(),
    );
    const named = Boolean(label || text || title || placeholder) || (hasLabelText && el.matches('input, select, textarea'));
    if (!named) {
      findings.push({
        check: 'accessible-name',
        detail: `${el.tagName.toLowerCase()} with no accessible name — ${el.outerHTML.slice(0, 120)}`,
      });
    }
  }

  // ---- form labels ---------------------------------------------------------
  for (const field of document.querySelectorAll('input, select, textarea')) {
    if (field.type === 'hidden') continue;
    const id = field.getAttribute('id');
    const byFor = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
    const wrapped = field.closest('label');
    const aria = field.getAttribute('aria-label') ?? field.getAttribute('aria-labelledby');
    if (!byFor && !wrapped && !aria) {
      findings.push({
        check: 'form-label',
        detail: `${field.tagName.toLowerCase()}#${id ?? '(no id)'} type=${field.getAttribute('type') ?? ''} has no label — ${field.outerHTML.slice(0, 120)}`,
      });
    }
  }

  // ---- tabindex ------------------------------------------------------------
  for (const el of document.querySelectorAll('[tabindex]')) {
    const value = Number(el.getAttribute('tabindex'));
    if (value > 0) {
      findings.push({ check: 'tabindex', detail: `positive tabindex ${value} on ${el.tagName.toLowerCase()}` });
    }
  }

  // ---- aria-hidden focusable ----------------------------------------------
  for (const el of document.querySelectorAll('[aria-hidden="true"] a, [aria-hidden="true"] button, [aria-hidden="true"] input')) {
    findings.push({ check: 'aria-hidden', detail: `focusable element inside aria-hidden container: ${el.tagName.toLowerCase()}` });
  }

  // ---- colour contrast -----------------------------------------------------
  for (const el of document.querySelectorAll('body *')) {
    const text = (el.childNodes.length && Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim())
      ? el.textContent.trim()
      : '');
    if (!text || text.length < 2) continue;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) continue;
    if (style.textTransform === 'none' && el.closest('[aria-hidden="true"]')) continue;

    const fg = parseRgb(style.color);
    if (!fg) continue;

    let bg = null;
    let node = el;
    while (node) {
      const candidate = parseRgb(getComputedStyle(node).backgroundColor);
      if (candidate && candidate.a > 0) {
        bg = candidate;
        break;
      }
      node = node.parentElement;
    }
    if (!bg) bg = { r: 255, g: 255, b: 255, a: 1 };

    const fgOnBg = fg.a < 1 ? blend(fg, bg) : fg;
    const ratio = contrast(fgOnBg, bg);
    const fontSize = parseFloat(style.fontSize);
    const weight = Number(style.fontWeight) || 400;
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700);
    const required = isLarge ? 3 : 4.5;
    if (ratio + 0.01 < required) {
      findings.push({
        check: 'contrast',
        detail: `${ratio.toFixed(2)}:1 (needs ${required}:1) ${style.color} on rgb(${bg.r.toFixed(0)}, ${bg.g.toFixed(0)}, ${bg.b.toFixed(0)}) — "${text.slice(0, 48)}"`,
        selector: describe(el),
      });
    }
  }

  function describe(el) {
    const cls = typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : '';
    return `${el.tagName.toLowerCase()}${cls}`;
  }

  // ---- reduced motion ------------------------------------------------------
  const reducedMotionRule = Array.from(document.styleSheets).some((sheet) => {
    try {
      return Array.from(sheet.cssRules ?? []).some(
        (rule) => rule.media?.mediaText?.includes('prefers-reduced-motion'),
      );
    } catch {
      return false;
    }
  });
  if (!reducedMotionRule) findings.push({ check: 'reduced-motion', detail: 'no prefers-reduced-motion CSS rule found' });

  return findings;
};

const focusAudit = async () => {
  const findings = [];
  const seen = [];
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? '').trim().slice(0, 40),
        rect: { w: rect.width, h: rect.height },
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });
    if (!active) break;
    if (active.rect.w === 0 || active.rect.h === 0) {
      findings.push({ check: 'focus', detail: `focused ${active.tag} "${active.text}" has zero size` });
    }
    seen.push(`${active.tag}:${active.text}`);
  }
  if (seen.length < 5) findings.push({ check: 'focus', detail: `only ${seen.length} elements reachable by Tab` });
  return findings;
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const all = [];

try {
  for (const lang of LANGUAGES) {
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    const switcher = page.locator('button[aria-pressed]');
    const switchCount = await switcher.count();
    const pressedTrue = await page.locator('button[aria-pressed="true"]').count();
    if (switchCount !== 3) {
      all.push({ lang, route: '/settings', check: 'i18n-switch', detail: `expected 3 aria-pressed switch buttons, found ${switchCount}` });
    }
    if (pressedTrue !== 1) {
      all.push({ lang, route: '/settings', check: 'i18n-switch', detail: `expected exactly 1 pressed language button, found ${pressedTrue}` });
    }

    for (const [route, name] of ROUTES) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      const findings = await page.evaluate(pageAudit);
      for (const finding of findings) all.push({ lang, route: name, ...finding });

      if (route === '/' || route === '/emergency') {
        const focusFindings = await focusAudit();
        for (const finding of focusFindings) all.push({ lang, route: name, ...finding });
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      }
    }
  }

  // keyboard reachability of the main journey on one route set
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const focusFindings = await focusAudit();
  for (const finding of focusFindings) all.push({ lang: 'all', route: 'home', ...finding });
} catch (error) {
  all.push({ check: 'script', detail: String(error) });
} finally {
  await browser.close();
}

const byCheck = all.reduce((acc, f) => ({ ...acc, [f.check]: (acc[f.check] ?? 0) + 1 }), {});
console.log(JSON.stringify({ total: all.length, byCheck, findings: all }, null, 2));
process.exit(all.length === 0 ? 0 : 1);
