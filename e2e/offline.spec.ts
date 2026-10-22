import { test, expect } from '@playwright/test';
import { expectEmergencyTelLinks, trackPageErrors } from './helpers';

/**
 * Offline / connectivity-loss scenarios (prompt.md §10, plan §8.2–8.3).
 *
 * IMPORTANT — scope limitation: `playwright.config.ts` sets `serviceWorkers: 'block'`,
 * so this suite CANNOT verify true service-worker-based offline caching of the built
 * app shell. That behaviour (real disconnect after first load with the SW active) is
 * verified separately via a manual real-disconnect test recorded in
 * `docs/testing-report.md`. What is automated here is the SPA's own resilience:
 * the offline banner driven by navigator.onLine / the `offline` event, no white
 * screen while offline, and emergency guidance (tel: links) staying reachable.
 *
 * Note: `context.setOffline(true)` blocks all network I/O, so a full `page.reload()`
 * while offline cannot succeed without a service worker. Offline navigation is
 * therefore exercised as SPA (client-side) navigation, which is the realistic path
 * for a user who already loaded the app.
 */

// The app's default language is Kazakh; the offline banner reads "Офлайн — …".
const OFFLINE_BANNER = /^Офлайн —/;

test.describe('offline resilience', () => {
  test('offline after full load: banner appears, SPA stays usable, emergency tel: links reachable', async ({
    page,
    context,
  }) => {
    const pageErrors = trackPageErrors(page);

    // Load the app fully while online.
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Dala Safe' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: OFFLINE_BANNER })).toHaveCount(0);

    // Lose connectivity.
    await context.setOffline(true);
    await expect(page.getByRole('status').filter({ hasText: OFFLINE_BANNER })).toBeVisible();

    // Navigate within the SPA while offline — no white screen, emergency guidance reachable.
    const desktopNav = page.getByRole('navigation', { name: 'Басты бет' }).first();
    await desktopNav.getByRole('link', { name: 'Төтенше жағдай' }).click();
    await expect(page).toHaveURL(/\/emergency/);
    await expect(page.locator('#main-content')).not.toBeEmpty();
    await expectEmergencyTelLinks(page);

    // The emergency page also shows its own offline note.
    await expect(page.getByText('Сіз офлайнсыз.', { exact: false })).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('forced navigator.onLine=false before load: banner renders without any network event', async ({
    page,
    context,
  }) => {
    const pageErrors = trackPageErrors(page);

    // Drive navigator.onLine to false before the app boots, then also dispatch the
    // offline event to exercise the listener path in useOnlineStatus.
    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'onLine', {
        configurable: true,
        get: () => false,
      });
    });

    await page.goto('/');
    await expect(page.getByRole('status').filter({ hasText: OFFLINE_BANNER })).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(page.getByRole('status').filter({ hasText: OFFLINE_BANNER })).toBeVisible();

    // App must still render (no white screen) and emergency guidance stays reachable.
    await expect(page.locator('#main-content')).not.toBeEmpty();
    const desktopNav = page.getByRole('navigation', { name: 'Басты бет' }).first();
    await desktopNav.getByRole('link', { name: 'Төтенше жағдай' }).click();
    await expect(page).toHaveURL(/\/emergency/);
    await expectEmergencyTelLinks(page);

    expect(pageErrors).toEqual([]);
  });

  test('back online: banner disappears and the app keeps working', async ({ page, context }) => {
    const pageErrors = trackPageErrors(page);

    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Dala Safe' })).toBeVisible();

    await context.setOffline(true);
    const banner = page.getByRole('status').filter({ hasText: OFFLINE_BANNER });
    await expect(banner).toBeVisible();

    await context.setOffline(false);
    await expect(banner).toBeHidden();

    // The app keeps working after reconnection.
    const desktopNav = page.getByRole('navigation', { name: 'Басты бет' }).first();
    await desktopNav.getByRole('link', { name: 'Төтенше жағдай' }).click();
    await expect(page).toHaveURL(/\/emergency/);
    await expectEmergencyTelLinks(page);

    expect(pageErrors).toEqual([]);
  });
});
