import { expect, type Page } from '@playwright/test';

export const TRIP = {
  name: 'E2E Safety Trip',
  destination: 'Big Almaty Lake',
  departureLocal: '2030-06-10T09:00',
  returnLocal: '2030-06-12T18:00',
  groupSize: '3',
} as const;

export const OFFICIAL_EMERGENCY_NUMBERS = ['112', '101', '102', '103', '104'] as const;

export function trackPageErrors(page: Page): Error[] {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));
  return errors;
}

export async function switchToEnglish(page: Page): Promise<void> {
  // Header language switcher is present on every app route; land on home first.
  if (!page.url().startsWith('http')) {
    await page.goto('/');
  }
  const englishButton = page.locator('.lang-btn[aria-label="English"]');
  if ((await englishButton.getAttribute('aria-pressed')) !== 'true') {
    await englishButton.click();
  }
  await expect(englishButton).toHaveAttribute('aria-pressed', 'true');
}

export async function createTrip(page: Page): Promise<string> {
  await page.goto('/trips/new');
  await page.getByLabel('Trip name').fill(TRIP.name);
  await page.getByLabel('Destination').fill(TRIP.destination);
  await page.getByLabel('Planned departure').fill(TRIP.departureLocal);
  await page.getByLabel('Expected return').fill(TRIP.returnLocal);
  await page.getByLabel('Group size').fill(TRIP.groupSize);
  await page.getByRole('button', { name: 'Create trip' }).click();
  await page.waitForURL(/\/trips\/[^/]+$/);
  await expect(page.getByRole('heading', { level: 1, name: TRIP.name })).toBeVisible();
  const tripId = new URL(page.url()).pathname.split('/').pop() ?? '';
  expect(tripId).not.toBe('');
  expect(tripId).not.toBe('new');
  return tripId;
}

/**
 * Asserts the official emergency numbers are reachable through real tel: links.
 * Never clicks them — clicking could trigger a phone handler in some environments.
 */
export async function expectEmergencyTelLinks(page: Page): Promise<void> {
  const hrefs = await page
    .locator('a[href^="tel:"]')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('href') ?? ''));
  for (const number of OFFICIAL_EMERGENCY_NUMBERS) {
    expect(hrefs, `expected a tel:${number} link`).toContain(`tel:${number}`);
  }
  for (const href of hrefs) {
    expect(href.startsWith('tel:')).toBe(true);
  }
  for (const number of OFFICIAL_EMERGENCY_NUMBERS) {
    await expect(page.locator(`a[href="tel:${number}"]`).first()).toBeVisible();
  }
}
