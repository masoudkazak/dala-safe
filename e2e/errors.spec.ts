import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import {
  TRIP,
  createTrip,
  expectEmergencyTelLinks,
  switchToEnglish,
  trackPageErrors,
} from './helpers';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page): Promise<void> {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

test.describe('error and failure scenarios (plan §8.2)', () => {
  test('missing geolocation permission: emergency page shows a denied message, tel: links stay usable', async ({
    page,
    context,
  }) => {
    const pageErrors = trackPageErrors(page);

    // Geolocation permission is denied (Playwright default; granted list is empty).
    await context.grantPermissions([]);
    await switchToEnglish(page);
    await page.goto('/emergency');

    await expect(page.getByText('Call 112 first', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Get my coordinates' }).click();
    await expect(
      page.getByText('Location permission was denied. You can still call emergency services'),
    ).toBeVisible();

    // No crash; emergency links still rendered and enabled.
    await expectEmergencyTelLinks(page);
    expect(pageErrors).toEqual([]);
  });

  test('geolocation unsupported: message shown, request disabled, tel: links still rendered', async ({
    page,
    context,
  }) => {
    const pageErrors = trackPageErrors(page);

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: undefined,
      });
    });
    await switchToEnglish(page);
    await page.goto('/emergency');

    await expect(page.getByText('This browser does not support location access.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get my coordinates' })).toBeDisabled();
    await expectEmergencyTelLinks(page);
    expect(pageErrors).toEqual([]);
  });

  test('unsupported native sharing: fallback copy message instead of a throw', async ({
    page,
    context,
  }) => {
    const pageErrors = trackPageErrors(page);

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: undefined,
      });
    });
    await switchToEnglish(page);
    const tripId = await createTrip(page);

    await page.goto(`/trips/${tripId}/share`);
    await page.getByRole('button', { name: 'Generate trusted-contact message' }).click();
    await expect(page.getByRole('region', { name: 'Trusted contact — English' })).toBeVisible();

    // Share, but never a real send: navigator.share is undefined, so the app must fall back.
    await page.getByRole('button', { name: 'Share… — English' }).click();
    await expect(page.getByText('Native sharing is not available')).toBeVisible();
    await expect(page.getByText(/has not been sent|Nothing has been sent/i)).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('empty storage: trips list shows the empty state', async ({ page }) => {
    const pageErrors = trackPageErrors(page);

    await switchToEnglish(page);
    await page.goto('/trips');
    await expect(page.getByRole('heading', { name: 'No trips yet' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'New trip' }).first()).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('malformed imported file: invalid-file error is shown, no crash', async ({ page }) => {
    const pageErrors = trackPageErrors(page);

    const tempDir = await mkdtemp(join(tmpdir(), 'dala-safe-e2e-'));
    const badFile = join(tempDir, 'not-an-export.json');
    await writeFile(badFile, '{}', 'utf8');

    try {
      await switchToEnglish(page);
      await page.goto('/settings/data');
      await page.getByLabel('Choose a Dala Safe JSON file').setInputFiles(badFile);
      await expect(
        page.getByRole('alert').filter({ hasText: 'not a valid Dala Safe export' }),
      ).toBeVisible();
      // The app is still alive after rejecting the file.
      await expect(page.getByRole('heading', { level: 1, name: 'Local data' })).toBeVisible();
      expect(pageErrors).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test('small mobile viewport (320x568): no horizontal overflow on /trips and /emergency', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await page.setViewportSize({ width: 320, height: 568 });

    await page.goto('/trips');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/emergency');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectEmergencyTelLinks(page);

    expect(pageErrors).toEqual([]);
  });

  test('language switching kk → ru → en updates headings and navigation', async ({ page }) => {
    const pageErrors = trackPageErrors(page);

    await page.goto('/settings');
    // Default language is Kazakh.
    await expect(page.getByRole('heading', { level: 1, name: 'Параметрлер' })).toBeVisible();

    await page.locator('.lang-btn[aria-label="Русский"]').click();
    await expect(page.getByRole('heading', { level: 1, name: 'Настройки' })).toBeVisible();
    await expect(page.locator('.lang-btn[aria-label="Русский"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: 'Поездки' }).first()).toBeVisible();

    await page.locator('.lang-btn[aria-label="English"]').click();
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Trips' }).first()).toBeVisible();
    await expect(page.locator('.lang-btn[aria-label="English"]')).toHaveAttribute('aria-pressed', 'true');

    expect(pageErrors).toEqual([]);
  });

  test('reload keeps the created trip; app boots with service workers blocked', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    await switchToEnglish(page);
    const tripId = await createTrip(page);
    expect(tripId).not.toBe('');

    await page.goto('/trips');
    await expect(page.getByRole('link', { name: TRIP.name })).toBeVisible();

    // Persistence across reload (independent of any PWA update flow).
    await page.reload();
    await expect(page.getByRole('link', { name: TRIP.name })).toBeVisible();

    // The config blocks service workers; the app must still boot cleanly.
    const swInfo = await page.evaluate(() => ({
      hasServiceWorker: 'serviceWorker' in navigator,
      registerType: typeof navigator.serviceWorker?.register,
    }));
    expect(swInfo.hasServiceWorker).toBe(true);
    expect(swInfo.registerType).toBe('function');
    await expect(page.getByRole('link', { name: 'Dala Safe' })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});
