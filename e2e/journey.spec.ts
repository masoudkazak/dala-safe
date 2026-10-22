import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
import {
  TRIP,
  createTrip,
  expectEmergencyTelLinks,
  switchToEnglish,
  trackPageErrors,
} from './helpers';

test.describe('main user journey (prompt.md §10 / plan §8.2)', () => {
  test('10-step journey: open → language → trip → checklist → plan → share → reminder → emergency → export → delete', async ({
    page,
  }) => {
    const pageErrors = trackPageErrors(page);

    // 1. Open the application.
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Dala Safe' })).toBeVisible();
    await expect(page.locator('#main-content')).not.toBeEmpty();

    // 2. Select a language via the header switcher so later assertions are in English.
    await switchToEnglish(page);
    await expect(page.locator('.lang-btn[aria-label="English"]')).toHaveAttribute('aria-pressed', 'true');

    // 3. Create a trip via /trips/new.
    const tripId = await createTrip(page);
    expect(page.url()).toContain(`/trips/${tripId}`);

    // 4. Readiness checklist: toggle items and confirm persistence after reload.
    await page.goto(`/trips/${tripId}/checklist`);
    const checkboxes = page.getByRole('checkbox');
    await expect(checkboxes.first()).toBeVisible();
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    await page.reload();
    await expect(checkboxes.nth(0)).toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');

    // 5. Generate the safety plan on /trips/:id/plan.
    await page.goto(`/trips/${tripId}/plan`);
    await page.getByRole('button', { name: 'Generate plan' }).click();
    await expect(page.getByText('Plan generated.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Trip details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Guidance' })).toBeVisible();
    await expect(page.getByText(TRIP.name).first()).toBeVisible();

    // 6. Generate + copy a trusted-contact message. Generated only — never a real send.
    await page.goto(`/trips/${tripId}/share`);
    await expect(page.getByText(/generated only — not delivered/i).first()).toBeVisible();
    await page.getByRole('button', { name: 'Generate trusted-contact message' }).click();
    const preview = page.getByRole('region', { name: 'Trusted contact — English' });
    await expect(preview).toBeVisible();
    await expect(preview.locator('pre')).toContainText(TRIP.name);
    await expect(preview.locator('pre')).toContainText(TRIP.destination);
    await page.getByRole('button', { name: 'Copy message — English' }).click();
    await expect(page.getByText(/has not been sent|Nothing has been sent/i)).toBeVisible();

    // 7. Create a return reminder on /trips/:id/reminder (.ics download).
    await page.goto(`/trips/${tripId}/reminder`);
    await expect(page.getByRole('heading', { name: 'Return reminder (.ics)' })).toBeVisible();
    const icsDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download .ics' }).click();
    const icsDownload = await icsDownloadPromise;
    expect(icsDownload.suggestedFilename()).toMatch(/\.ics$/);

    // 8. Emergency guidance: official numbers with real tel: links (never clicked).
    await page.goto('/emergency');
    await expect(page.getByRole('heading', { name: 'Emergency numbers' })).toBeVisible();
    await expectEmergencyTelLinks(page);

    // 9. Export trip data on /settings/data; payload must be a valid Dala Safe export.
    await page.goto('/settings/data');
    const exportDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export all trips' }).click();
    const exportDownload = await exportDownloadPromise;
    const exportPath = await exportDownload.path();
    expect(exportPath).toBeTruthy();
    const exportRaw = await readFile(String(exportPath), 'utf8');
    const exportPayload = JSON.parse(exportRaw) as {
      format?: string;
      trips?: Array<{ name?: string }>;
    };
    expect(exportPayload.format).toBe('dala-safe-trip-export');
    expect(Array.isArray(exportPayload.trips)).toBe(true);
    expect(exportPayload.trips?.some((trip) => trip.name === TRIP.name)).toBe(true);

    // 10. Delete the trip with confirmation and verify the expected result.
    await page.goto('/trips');
    const tripCard = page.locator('li.card').filter({ hasText: TRIP.name });
    await expect(tripCard).toBeVisible();
    await tripCard.getByRole('button', { name: 'Delete trip' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete trip' }).click();
    await expect(page.getByText('No trips yet')).toBeVisible();
    await expect(page).toHaveURL(/\/trips$/);
    await expect(page.getByText(TRIP.name)).toHaveCount(0);

    // No uncaught page errors during the whole journey.
    expect(pageErrors).toEqual([]);
  });
});
