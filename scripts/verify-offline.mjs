import { chromium } from '@playwright/test';

/**
 * Real service-worker offline verification.
 *
 * `playwright.config.ts` sets `serviceWorkers: 'block'` for the automated suite, so
 * true app-shell offline caching is NOT covered by `npm run test:e2e`. This script
 * runs against `vite preview` with service workers ALLOWED and performs a genuine
 * disconnect: first load online (SW installs, assets cache), then `setOffline(true)`
 * and a FULL `page.reload()`, which only succeeds if the SW serves the app shell.
 *
 * Usage: npm run build && npm run preview -- --port 4173
 *        node scripts/verify-offline.mjs
 * Exit code 0 = all offline checks passed; 1 = a check failed.
 */

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const results = [];
let failed = false;

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

try {
  // 1. First load while online.
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  check('online: app shell loaded', await page.getByRole('link', { name: 'Dala Safe' }).isVisible());
  check('online: no offline banner', (await page.getByRole('status').filter({ hasText: /^Офлайн —/ }).count()) === 0);

  // 2. Service worker registered, activated and controlling the page.
  const sw = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 5000);
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => {
            clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
      });
    }
    return {
      scriptUrl: reg.active?.scriptURL ?? null,
      controlled: Boolean(navigator.serviceWorker.controller),
    };
  });
  check('service worker active and controlling', sw.controlled && Boolean(sw.scriptUrl), sw.scriptUrl ?? 'no active worker');

  // 3. Shell + hashed assets actually cached.
  const cache = await page.evaluate(async () => {
    const names = await caches.keys();
    const entries = await Promise.all(
      names.map(async (name) => (await (await caches.open(name)).keys()).map((r) => r.url)),
    );
    const urls = entries.flat();
    return {
      names,
      total: urls.length,
      hasIndex: urls.some((u) => u.endsWith('/') || u.endsWith('/index.html')),
      assets: urls.filter((u) => u.includes('/assets/')).length,
    };
  });
  check('cache exists', cache.names.length > 0, cache.names.join(', '));
  check('index.html precached', cache.hasIndex);
  check('app assets cached', cache.assets > 0, `${cache.assets} asset URL(s)`);

  // 4. Real disconnect: full reload must be served by the SW.
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (document.querySelector('#main-content')?.textContent ?? '').trim().length > 0, null, {
    timeout: 15000,
  });
  check('offline full reload: app shell rendered', await page.locator('#main-content').isVisible());
  await page
    .waitForFunction(
      () =>
        Array.from(document.querySelectorAll('[role="status"]')).some((el) =>
          (el.textContent ?? '').includes('Офлайн'),
        ),
      null,
      { timeout: 10000 },
    )
    .catch(() => undefined);
  check(
    'offline full reload: offline banner shown',
    (await page.getByRole('status').filter({ hasText: /^Офлайн —/ }).count()) > 0,
  );

  // 5. Offline navigation to emergency guidance (SPA link click) + tel: links present.
  await page.locator('a[href="/emergency"]').first().click();
  await page.waitForURL('**/emergency');
  // Wait for the SPA to render the emergency content (it may need to boot after a full navigation).
  await page.waitForFunction(() => document.querySelector('a[href^="tel:"]') !== null, null, { timeout: 15000 });
  const emergency = await page.evaluate(() => ({
    mainText: document.querySelector('#main-content')?.textContent ?? '',
    telHrefs: Array.from(document.querySelectorAll('a[href^="tel:"]')).map((a) => a.getAttribute('href')),
  }));
  check('offline: emergency route reachable', emergency.mainText.length > 0);
  check('offline: emergency numbers rendered', ['112', '101', '102', '103', '104'].every((n) => emergency.mainText.includes(n)));
  check(
    'offline: tel: links present and real',
    emergency.telHrefs.includes('tel:112') && emergency.telHrefs.includes('tel:101'),
    emergency.telHrefs.join(', '),
  );
  await page.waitForFunction(() => document.body.textContent.includes('Сіз офлайнсыз'), null, { timeout: 5000 }).catch(() => undefined);
  check('offline: emergency page offline note', (await page.getByText('Сіз офлайнсыз.', { exact: false }).count()) > 0);

  // 6. Back online: banner clears, app still usable.
  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await page.waitForFunction(
    () => !Array.from(document.querySelectorAll('[role="status"]')).some((el) => (el.textContent ?? '').includes('Офлайн')),
    null,
    { timeout: 5000 },
  ).catch(() => undefined);
  check(
    'recovery: offline banner cleared',
    (await page.getByRole('status').filter({ hasText: /^Офлайн —/ }).count()) === 0,
  );
  await page.locator('a[href="/trips"]').first().click();
  await page.waitForURL('**/trips');
  check('recovery: navigation works', (await page.locator('#main-content').isVisible()));
} catch (error) {
  check('script completed without throwing', false, String(error));
} finally {
  await browser.close();
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
