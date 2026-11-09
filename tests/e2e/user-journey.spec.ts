import { test, expect } from '@playwright/test';

test.describe('Roamly Central End-to-End User Journey', () => {
  test('discover destination → choose template → customise → edit itinerary → select stay → inspect budget → share read-only', async ({
    page,
  }) => {
    // 1. Visit Marketing Homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Roamly/);
    await expect(page.locator('h1')).toContainText('Plan your ultimate journey');

    // 2. Discover Destinations
    await page.click('nav >> text=Destinations');
    await expect(page).toHaveURL(/\/destinations/);
    await expect(page.locator('h1')).toContainText('Explore Handcrafted Destinations');

    // Inspect Bali destination page
    await page.click('a[href="/destinations/bali"]');
    await expect(page).toHaveURL(/\/destinations\/bali/);
    await expect(page.locator('h1')).toContainText('Bali');

    // Check Climate matrix & Visa checker
    await expect(page.locator('text=Monthly Climate & Best Travel Windows')).toBeVisible();
    await expect(page.locator('text=Contextual Visa & Entry Requirements')).toBeVisible();

    // 3. Choose Template & Customise
    await page.goto('/templates/bali-essential-culture-cliffs');
    await expect(page.locator('h1')).toContainText('Essential Bali');

    // Click Duplicate & Customise
    await page.click('button:has-text("Duplicate & Customise")');

    // Should navigate to newly duplicated Tripboard
    await page.waitForURL(/\/trips\/[a-zA-Z0-9-]+/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/trips\/[a-zA-Z0-9-]+/);

    // 4. Verify Tripboard Workspace and Persistent Tabs
    await expect(page.getByRole('button', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Itinerary', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stays', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Explore', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bookings & Budget', exact: true })).toBeVisible();

    // Verify Overview metrics
    await expect(page.locator('text=Trip Length')).toBeVisible();
    await expect(page.locator('text=Booking Readiness Checklist')).toBeVisible();

    // 5. Itinerary Workspace Tab
    await page.getByRole('button', { name: 'Itinerary', exact: true }).click();
    await expect(page.getByText('Day 1', { exact: true })).toBeVisible();

    // Toggle Compact mode
    await page.getByRole('button', { name: 'Compact', exact: true }).click();
    await page.getByRole('button', { name: 'Detailed', exact: true }).click();

    // 6. Stays and Hotel Comparison Tab
    await page.getByRole('button', { name: 'Stays', exact: true }).click();
    await expect(page.locator('text=Transparent Multi-Provider Price Comparison')).toBeVisible();

    // Click Compare provider offers
    const compareButton = page.locator('button:has-text("Compare")').first();
    if (await compareButton.isVisible()) {
      await compareButton.click();
      await expect(page.locator('text=All Available Provider Quotes')).toBeVisible();
    }

    // 7. Bookings & Budget Tab
    await page.getByRole('button', { name: 'Bookings & Budget', exact: true }).click();
    await expect(page.locator('text=Total Estimated Trip Budget')).toBeVisible();

    // Toggle Per-Person share
    await page.getByRole('button', { name: 'Per-Person Share', exact: false }).click();
    await expect(page.locator('text=Per-Person Estimated Budget')).toBeVisible();

    // 8. Revocable Share Modal and Read-Only Verification
    await page.getByRole('button', { name: 'Share', exact: true }).click();
    await expect(page.locator('text=Share Read-Only Tripboard')).toBeVisible();
    await expect(page.locator('text=Privacy & Scrubbing Protection')).toBeVisible();

    // Read the share URL from the input
    const shareInput = page.locator('input[readonly]');
    await expect(shareInput).toBeVisible();
    await page.waitForTimeout(1000); // Wait for token generation
    const shareUrl = await shareInput.inputValue();
    expect(shareUrl).toContain('/share/');

    // Visit the shared read-only link in browser
    await page.goto(shareUrl);
    await expect(page.locator('text=Viewing a read-only shared tripboard')).toBeVisible();
    await expect(page.locator('button:has-text("Duplicate & Customise")')).toBeVisible();
  });
});
